import cv2
import numpy as np
import os
import uuid
import shutil

probability = 0.6
face_dir = "static/registered_faces"
model_dir = "static/models"

# モデルファイルのパスを指定
face_detection_model = os.path.join(
    model_dir, "face_detection_yunet_2023mar.onnx")
face_recognition_model = os.path.join(
    model_dir, "face_recognition_sface_2021dec.onnx")

# YuNet モデルと FaceRecognizerSF モデルの設定
detector = cv2.FaceDetectorYN.create(face_detection_model, "", (320, 320))
detector.setInputSize((320, 320))  # 初期設定でサイズを指定

recognizer = cv2.FaceRecognizerSF.create(face_recognition_model, "")

def delete_faces_by_id(user_id):
    user_dir = os.path.join(face_dir, user_id)
    if os.path.exists(user_dir):
        try:
            # ディレクトリ削除
            shutil.rmtree(user_dir)
            print(f"Successfully deleted {user_dir}")
        except Exception as e:
            print(f"Failed to delete {user_dir}. Reason: {e}")
    else:
        print("User directory does not exist.")
    return



def detect_faces(image_data):
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Failed to decode image")
        return None

    # 入力画像をリサイズ
    img_resized = cv2.resize(img, (320, 320))

    # 顔検出
    faces = detector.detect(img_resized)
    if faces[1] is None:
        print("No faces detected")
        return None

    # 検出された顔に枠を描画
    for face in faces[1]:
        box = face[:4].astype(int)
        cv2.rectangle(
            img_resized, (box[0], box[1]), (box[0] + box[2], box[1] + box[3]), (255, 0, 0), 2)

    return img_resized

def register_face(user_id, image_data):
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Failed to decode image")
        return False

    # 入力画像をリサイズ
    img_resized = cv2.resize(img, (320, 320))

    # 顔検出
    faces = detector.detect(img_resized)
    if faces[1] is None:
        print("No faces detected")
        return False

    # 最初に検出された顔領域を取得し、特徴量を計算
    face = faces[1][0]
    aligned_face = recognizer.alignCrop(img_resized, face)
    features = recognizer.feature(aligned_face)

    # ユーザーディレクトリ作成（特徴量ファイル）
    user_dir = os.path.join(face_dir, user_id)
    os.makedirs(user_dir, exist_ok=True)

    # UUIDを使って特徴量を保存する `.npy` ファイルを生成
    unique_id = str(uuid.uuid4())
    feature_path = os.path.join(user_dir, f'{unique_id}.npy')
    np.save(feature_path, features)

    print(f"Saved features for user ID: {user_id} at {feature_path}")
    return True


def recognize_face(image_data):
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Failed to decode image")
        return None

    # 入力画像をリサイズ
    img_resized = cv2.resize(img, (320, 320))

    # 顔検出
    faces = detector.detect(img_resized)
    if faces[1] is None:
        print("No faces detected")
        return None

    # 最初に検出された顔領域を取得し、特徴量を計算
    face = faces[1][0]
    aligned_face = recognizer.alignCrop(img_resized, face)
    input_features = recognizer.feature(aligned_face)

    # 登録された顔特徴量と比較
    for user_id in os.listdir(face_dir):
        user_dir = os.path.join(face_dir, user_id)
        if os.path.isdir(user_dir):
            for filename in os.listdir(user_dir):
                feature_path = os.path.join(user_dir, filename)

                # .npyファイルのみを読み込み
                if feature_path.endswith(".npy"):
                    try:
                        registered_features = np.load(feature_path)
                    except Exception as e:
                        print(f"Error loading features from {
                              feature_path}: {e}")
                        continue

                    # 類似度スコアの計算
                    score = recognizer.match(
                        input_features, registered_features, cv2.FaceRecognizerSF_FR_COSINE)
                    print(f"Matching score for user {user_id}: {score}")

                    if score > probability:
                        print(f"Recognized user ID: {user_id}")
                        return user_id

    print("No user recognized")
    return None
