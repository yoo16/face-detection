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


@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'}), 400
    img = file.read()

    print("Received image for detection")

    result_img = detect_faces(img)

    if result_img is None:
        return jsonify({'error': 'No faces detected'}), 400

    _, buffer = cv2.imencode('.jpg', result_img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')
    return jsonify({'image': encoded_img})


@app.route('/register', methods=['POST'])
def register():
    if 'user_id' not in request.form:
        return jsonify({'error': 'No user_id part in the request'}), 400
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    user_id = request.form['user_id']
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'}), 400
    img = file.read()

    print(f"Received image for user ID: {user_id}")
    print(f"Image size: {len(img)} bytes")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if register_face(user_id, img, timestamp):
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'failure'})


@app.route('/recognize', methods=['POST'])
def recognize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'}), 400
    img = file.read()

    print("Received image for recognition")

    result = recognize_face(img)

    if result.user_id > 0:
        return jsonify({'status': 'success', 'user_id': result.user_id})
    else:
        return jsonify({'status': 'failure', 'error': result.error})

if __name__ == '__main__':
    if not os.path.exists('static/registered_faces'):
        os.makedirs('static/registered_faces')

    HOST = app.config['HOST']
    PORT = app.config['PORT']
    
    app.run(host=app.config['HOST'], port=int(app.config['PORT']))
