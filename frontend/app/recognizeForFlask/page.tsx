'use client'

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { signIn } from 'next-auth/react';
import FaceRecognition from '@/app/components/FaceRecognition';

const RecognizePage = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob } = useCamera();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeCamera = async () => {
            await startCamera();
        };
        initializeCamera();
    }, [startCamera]);

    const recognizeFace = async () => {
        try {
            const blob = await getBlob();
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'webcam.jpg');
            const response = await axios.post(`${API_URL}api/face/recognize`, formData);
            setError(response.data.error);
            setMessage(response.data.message);
            console.log("response:", response)
            const user_id = response.data.user_id;
            if (user_id > 0) {
                signIn('credentials', {
                    callbackUrl: '/register',
                    userId: user_id,
                });
                stopCamera();
            }
        } catch (error) {
            setError('Recognition error.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Recognize Faces</h1>
            <div className="flex items-center mb-4">
                <div>
                    <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                    <div>
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
                    </div>

                    {cameraActive &&
                        <div>
                            <button
                                onClick={recognizeFace}
                                className="bg-purple-500 text-white py-2 px-4 rounded mb-2"
                            >
                                Authorize Face
                            </button>
                        </div>
                    }
                    <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                </div>
            </div>
        </div>
    );
};

export default RecognizePage;
