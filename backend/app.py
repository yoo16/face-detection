from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.face_detection import detect_faces, register_face, recognize_face
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
        return jsonify({'error': 'No image part in the request'})

    user_id = request.form['user_id']
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'})

    img = file.read()

    print(f"Received image for user ID: {user_id}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result = register_face(user_id, img, timestamp)
    print(f"{result}")
    return jsonify(result)

@app.route('/api/face/recognize', methods=['POST'])
def recognize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'})
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'})
    img = file.read()

    result = recognize_face(img)
    print(f"{result}")
    return jsonify(result)


if __name__ == '__main__':
    if not os.path.exists('static/registered_faces'):
        os.makedirs('static/registered_faces')

    HOST = app.config['HOST']
    PORT = app.config['PORT']

    print(f"URL: http://{HOST}:{PORT}")
    print(f"CORS: http://{HOST}:{PORT}")

    app.run(host=app.config['HOST'], port=int(app.config['PORT']))
