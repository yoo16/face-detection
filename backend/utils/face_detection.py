import cv2
import numpy as np
import os
import base64

FACE_IMAGE_DIR = "static/registered_faces"
MAX_PROB_VALUE = 0.6
MAX_IMAGES_COUNT = 100


def get_initial_result():
    return {
        "user_id": 0,
        "error": "",
        "message": "",
        "image": None,
    }


def images_count(user_id):
    file_count = 0
    user_dir = os.path.join(FACE_IMAGE_DIR, str(user_id))
    if os.path.exists(user_dir):
        files = os.listdir(user_dir)
        file_count = len(files)
    return file_count

def delete_user_images(user_id):
    user_dir = os.path.join(FACE_IMAGE_DIR, str(user_id))
    for filename in os.listdir(user_dir):
        file_path = os.path.join(user_dir, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                os.rmdir(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def detect_faces(image_data):
    result = get_initial_result()

    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Failed to decode image")
        return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        result['error'] = "Failed to load cascade classifier"
        return result

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        result['error'] = "No faces detected"
        return result

    # face frame
    # for (x, y, w, h) in faces:
    #     cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
    result['image'] = img
    return result


def register_face(user_id, image_data, timestamp):
    result = get_initial_result()

    count = images_count(user_id)
    if (count) > MAX_IMAGES_COUNT:
        result["images_count"] = count
        result["error"] = "Faild regist. max image's count"
        return result

    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        result["error"] = "Failed to decode image"
        return result

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        result["error"] = "Failed to load cascade classifier"
        return result

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        result["error"] = "No faces detected"
        return result

    x, y, w, h = faces[0]
    face_img = gray[y:y + h, x:x + w]

    user_dir = os.path.join(FACE_IMAGE_DIR, user_id)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    face_path = os.path.join(user_dir, f'{timestamp}.jpg')
    cv2.imwrite(face_path, face_img)

    result['status'] = True
    result['message'] = "Registed face success."
    result["user_id"] = user_id
    result["images_count"] = images_count(user_id)

    # _, buffer = cv2.imencode('.jpg', face_img)
    # face_base64 = base64.b64encode(buffer).decode('utf-8')
    # result["image"] = face_base64

    return result


def recognize_face(image_data):
    result = get_initial_result()
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        result["error"] = "Failed to decode image"
        return result

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        result["error"] = "Failed to load cascade classifier"
        return result

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        result["error"] = "No faces detected"
        return result

    x, y, w, h = faces[0]
    face_img = gray[y:y + h, x:x + w]

    for user_id in os.listdir(FACE_IMAGE_DIR):
        user_dir = os.path.join(FACE_IMAGE_DIR, user_id)
        if os.path.isdir(user_dir):
            for filename in os.listdir(user_dir):
                print(f"File Name: {filename}")
                registered_face = cv2.imread(os.path.join(
                    user_dir, filename), cv2.IMREAD_GRAYSCALE)
                if registered_face is None:
                    print(f"Failed to load registered face: {filename}")
                    continue

                res = cv2.matchTemplate(
                    face_img, registered_face, cv2.TM_CCOEFF_NORMED)
                _, max_val, _, _ = cv2.minMaxLoc(res)
                if max_val > MAX_PROB_VALUE:
                    result["message"] = f"Recognized user ID: {user_id}"
                    result["user_id"] = user_id
                    return result

    result["error"] = "No user recognized"
    return result
