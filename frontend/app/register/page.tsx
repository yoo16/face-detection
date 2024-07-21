'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob } = useCamera();
    const { data: session } = useSession();
    const [user, setUser] = useState<User>();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user?.id) {
                try {
                    const userId = session.user.id;
                    const response = await axios.get(`/api/user/${userId}`);
                    console.log(response.data);
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
        };

        fetchUser();
    }, [session]);

    const registerFace = async () => {
        if (!session?.user) return
        try {
            const blob = await getBlob();
            if (!blob) return;
            const formData = new FormData();
            formData.append('image', blob, 'webcam.jpg');
            formData.append('user_id', session.user.id as string);
            var response = await axios.post(`${API_URL}api/face/regist`, formData);
            // console.log(response)
            setError(response.data.error)
            setMessage(response.data.message)
        } catch (error) {

        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Register</h1>
            <div>
                <div>{user?.id}</div>
                <div>{user?.name}</div>
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
                    {error && (
                        <div className="my-1 p-4 bg-red-200 text-red-800 rounded">
                            {error}
                        </div>
                    )}

                    <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                    {cameraActive &&
                        <div>
                            <button
                                onClick={stopCamera}
                                className="bg-red-500 text-white py-2 px-4 me-4 rounded"
                                disabled={!cameraActive}
                            >
                                Stop Camera
                            </button>
                            <button
                                onClick={registerFace}
                                className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                            >
                                Register Face
                            </button>
                        </div>
                    }
                    <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
