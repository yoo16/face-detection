'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, captureImage, faceDetected, getBlob } = useCamera();
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

    const authorize = async () => {
        setMessage("");
        setError("");

        const imageDataUrl = captureImage();
        if (!imageDataUrl) return;

        const blob = await getBlob();
        if (!blob) return;
        const formData = new FormData();
        formData.append('image', blob, `webcam.jpg`);

        try {
            setLoading(true);
            const uri = `${API_URL}api/face/recognize`;
            const response = await axios.post(uri, formData);
            const userId = response.data.user_id;
            console.log(response)
            if (userId > 0) {
                setMessage(`verify: ${userId}`);
            } else {
                setError(`not verify`);
            }
        } catch (error) {
            setError('Error verifying image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Face Authorization</h1>
            {message && <div className="my-1 p-4 bg-green-200 text-green-800 rounded">{message}</div>}
            {error && <div className="my-1 p-4 bg-red-200 text-red-800 rounded">{error}</div>}
            <div className="mb-4">
                {cameraActive ? (
                    <>
                        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
                        <video ref={videoRef} width="320" height="240" className="mb-4 border-2 border-gray-300" />
                        <div className="text-center">
                            <button
                                onClick={authorize}
                                className={`py-2 px-4 rounded mb-2 bg-green-500 text-white`}
                            >
                                Authorize Face
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center">
                            <button
                                onClick={startCamera}
                                className="bg-green-50 py-2 px-4 rounded mb-2 'bg-green-500 text-white"
                            >
                                Start camera
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
