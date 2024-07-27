'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, captureImage } = useCamera();
    const { data: session } = useSession();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const initializeCamera = async () => {
            await startCamera();
        };
        initializeCamera();
    }, [startCamera]);

    const handleCaptureAndSend = async () => {
        const imageDataUrl = captureImage();
        if (!imageDataUrl) return;

        const blob = await fetch(imageDataUrl).then(res => res.blob());
        const formData = new FormData();
        formData.append('image', blob, `webcam.jpg`);

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}api/face/recognize`, formData);
            console.log(response);
            const userId = response.data.user_id;
            if (userId > 0) {
                setMessage(`verify: ${userId}`);
            } else {
                setError('cannot verify');
            }
        } catch (error) {
            setError('Error verifying image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Register</h1>
            <div className="flex items-center mb-4">
                {!cameraActive && (
                    <button
                        onClick={startCamera}
                        className="bg-blue-500 text-white py-2 px-4 rounded m-2"
                    >
                        Start Camera
                    </button>
                )}
                {cameraActive && (
                    <>
                        <button
                            onClick={handleCaptureAndSend}
                            className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                        >
                            Capture and Verify
                        </button>
                        <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
                    </>
                )}
            </div>
            {message && <div className="my-1 p-4 bg-green-200 text-green-800 rounded">{message}</div>}
            {error && <div className="my-1 p-4 bg-red-200 text-red-800 rounded">{error}</div>}
        </div>
    );
};

export default RegisterPage;