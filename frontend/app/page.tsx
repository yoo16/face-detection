'use client'

import { useState, useRef } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [detectedImage, setDetectedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null); // メッセージ状態を追加

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;  // streamRefにMediaStreamを設定
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;  // streamRefをリセット
      setCameraActive(false);
    }
  };

  const captureImage = async (action: 'detect' | 'register' | 'recognize') => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const formData = new FormData();

        if (action === 'register') {
          const blob = await (await fetch(`data:image/jpeg;base64,${detectedImage}`)).blob();
          formData.append('image', blob, 'webcam.jpg');
          formData.append('user_id', userId);
        } else {
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = canvasRef.current.toDataURL('image/jpeg');
          const blob = await (await fetch(imageData)).blob();
          formData.append('image', blob, 'webcam.jpg');
        }

        let response;
        try {
          if (action === 'detect') {
            response = await axios.post(`${API_URL}/detect`, formData);
            setDetectedImage(response.data.image);
            setMessage('Faces detected successfully.');
          } else if (action === 'register') {
            response = await axios.post(`${API_URL}/register`, formData);
            setMessage(response.data.status === 'success' ? 'Registration successful' : 'Registration failed');
          } else if (action === 'recognize') {
            response = await axios.post(`${API_URL}/recognize`, formData);
            setMessage(response.data.status === 'success' ? `User recognized: ${response.data.user_id}` : 'Recognition failed');
          }
        } catch (error) {
          setMessage('An error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Webcam Face Detection and Recognition</h1>
      <div className="flex">
      </div>
      <div className="flex items-center mb-4">
        <div>
          {!cameraActive &&
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white py-2 px-4 rounded m-2"
            >
              Start Camera
            </button>
          }

          {message && (
            <div className="my-1 p-4 bg-green-200 text-green-800 rounded">
              {message}
            </div>
          )}

          <canvas ref={canvasRef} width="640" height="480" className="hidden" />

          {cameraActive &&
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white py-2 px-4 rounded"
              disabled={!cameraActive}
            >
              Stop Camera
            </button>
          }
          {cameraActive &&
            <>
              <button
                onClick={() => captureImage('detect')}
                className="bg-green-500 text-white py-2 px-4 rounded m-2"
              >
                Detect Faces
              </button>
            </>
          }
          <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
        </div>

        <div>
          {detectedImage && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => captureImage('register')}
                className="bg-yellow-500 text-white py-2 px-4 rounded mb-2"
              >
                Register Face
              </button>
              <img src={`data:image/jpeg;base64,${detectedImage}`} alt="Detected Faces" className="border-2 border-gray-300" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">

        <button
          onClick={() => captureImage('recognize')}
          className="bg-purple-500 text-white py-2 px-4 rounded mb-2"
        >
          Recognize Face
        </button>
      </div>

    </div >
  );
};

export default HomePage;
