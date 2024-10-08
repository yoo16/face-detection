from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.face_detection import *
import cv2
import base64
import os
from datetime import datetime
from dotenv import load_dotenv
from config import Config

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

FACE_IMAGE_DIR = os.path.join(os.getcwd(), 'static', 'registered_faces')


@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': "hello flask"})

@app.route('/api/face/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        result['error'] = 'No image selected for uploading'
    else:
        file = request.files['image']
        img = file.read()
        result = detect_faces(img)

    if result['error']:
        return jsonify(result)

    _, buffer = cv2.imencode('.jpg', result['image'])
    result['image'] = base64.b64encode(buffer).decode('utf-8')
    return jsonify(result)


@app.route('/api/face/regist', methods=['POST'])
def register():
    if 'user_id' not in request.form:
        return jsonify({'error': 'No user_id part in the request'})

    if 'image' not in request.files:
        return jsonify({'error': 'No images part in the request'})

    user_id = request.form['user_id']
    file = request.files['image']

    image = file.read()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S%f")
    result = register_face(user_id, image, timestamp)

    return jsonify(result)


@app.route('/api/face/recognize', methods=['POST'])
def recognize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'})

    file = request.files['image']
    image = file.read()

    print(f"{file.filename}")

    result = recognize_face(image)
    print(f"{result}")
    return jsonify(result)


@app.route('/api/user/<int:user_id>/images_count', methods=['GET'])
def get_images_count(user_id):
    file_count = images_count(user_id)
    return jsonify({"count": file_count}), 200

@app.route('/api/user/<int:user_id>/delete_images', methods=['POST'])
def delete_images(user_id):
    result = delete_user_images(user_id)
    return jsonify(result), 200

if __name__ == '__main__':
    if not os.path.exists('static/registered_faces'):
        os.makedirs('static/registered_faces')

    HOST = app.config['HOST']
    PORT = app.config['PORT']

    print(f"URL: http://{HOST}:{PORT}")
    print(f"CORS: http://{HOST}:{PORT}")

    app.run(host=app.config['HOST'], port=int(app.config['PORT']))

