'use client'

import { useState, useRef } from 'react';
import axios from 'axios';

const RecognizePage = () => {
    const [detectedImage, setDetectedImage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            streamRef.current = stream;
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
            streamRef.current = null;
            setCameraActive(false);
        }
    };

    const getDetectBlob = async () => {
        const blob = await (await fetch(`data:image/jpeg;base64,${detectedImage}`)).blob();
        return blob;
    }

    const recognizeFace = async () => {
        try {
            const blob = await getDetectBlob();
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'webcam.jpg');
            const response = await axios.post(`${API_URL}/recognize`, formData);
            setError(response.data.error);
            setMessage(response.data.message);
        } catch (error) {
            setError('Recognition error.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Recognize Faces</h1>
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
                    {error && (
                        <div className="my-1 p-4 bg-red-200 text-red-800 rounded">
                            {error}
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
                    <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                </div>

                <div>
                    {detectedImage && (
                        <div className="mt-4">
                            <button
                                onClick={recognizeFace}
                                className="bg-purple-500 text-white py-2 px-4 rounded mb-2"
                            >
                                Recognize Face
                            </button>
                            <img src={`data:image/jpeg;base64,${detectedImage}`} alt="Detected Faces" className="border-2 border-gray-300" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecognizePage;