from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils.face_detection import detect_faces, register_face, recognize_face, delete_faces_by_id
import cv2
import base64
import os
from datetime import datetime
from typing import List

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)


@app.get("/")
async def home():
    return {'message': 'Hello Fast API'}

# 画像の顔を検出するAPI


@app.post("/api/user/detect")
async def detect(image: UploadFile = File(...)):
    # print(image)
    # アップロードされた画像ファイルを読み込み
    img = await image.read()

    print("Received image for detection")

    # 顔検出を実行
    result_img = detect_faces(img)

    if result_img is None:
        raise HTTPException(status_code=400, detail="No faces detected")

    # 結果画像をエンコードしてbase64形式に変換
    _, buffer = cv2.imencode('.jpg', result_img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return {"image": encoded_img}


@app.post("/api/face/deletes")
async def delete_faces(user_id: str = Form(...)):
    print("Deletes User ID: ", user_id)
    delete_faces_by_id(user_id)
    return {"status": "success"}

# 画像とユーザーIDで顔を登録するAPI


@app.post("/api/face/regist")
async def register(user_id: str = Form(...), image: UploadFile = File(...)):
    print("Regist User ID: ", user_id)
    # print("Image: ", image)

    # 各アップロードされた画像ファイルを読み込み
    img = await image.read()
    print(f"Image name: {image.filename}")

    # 顔を登録（仮の処理）
    if not register_face(user_id, img):
        return {"status": "failure", "image": image.filename}

    return {"status": "success"}


@app.post("/api/face/regists")
async def register(user_id: str = Form(...), images: List[UploadFile] = File(...)):
    print("User ID: ", user_id)
    print("Images: ", images)

    for image in images:
        # 各アップロードされた画像ファイルを読み込み
        img = await image.read()

        print(f"Image name: {image.filename}")

        # 顔を登録（仮の処理）
        if not register_face(user_id, img):
            return {"status": "failure", "image": image.filename}

    return {"status": "success"}

# 顔を認識して登録ユーザーを返すAPI


@app.post("/api/face/recognize")
async def recognize(image: UploadFile = File(...)):
    # アップロードされた画像ファイルを読み込み
    img = await image.read()

    print("Received image for recognition")

    # 顔認識を実行
    recognized_user = recognize_face(img)

    if recognized_user:
        return {"status": "success", "user_id": recognized_user}
    else:
        return {"status": "failure"}

# アプリのエントリポイント
if __name__ == '__main__':
    # フォルダが存在しない場合は作成
    if not os.path.exists('static/registered_faces'):
        os.makedirs('static/registered_faces')

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
