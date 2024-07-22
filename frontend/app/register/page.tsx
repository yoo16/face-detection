'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState, useCallback } from 'react';
import LoadingModal from '@/app/components/LoadingModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob } = useCamera();
    const { data: session } = useSession();
    const [user, setUser] = useState<User>();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const initializeCamera = async () => {
            await startCamera();
        };
        initializeCamera();
    }, [startCamera]);

    useEffect(() => {
        if (!session?.user) return;
        const fetchUser = async () => {
            try {
                const userId = session?.user?.id;
                const response = await axios.get(`/api/user/${userId}`);
                setUser(response.data);
            } catch (error) {
                setError('Error fetching user');
            }
        };
        fetchUser();
    }, [session]);


    const registerFace = async (formData: FormData) => {
        if (!formData) return;
        console.log(formData)
        try {
            var response = await axios.post(`${API_URL}api/face/regist`, formData);
            setError(response.data.error)
            setMessage(response.data.message)
        } catch (error) {

        }
    }

    const registerFaces = async (times: number) => {
        if (!session?.user) return;
        setLoading(true);
        const userId = session.user.id as string;

        for (let i = 0; i < times; i++) {
            const blob = await getBlob();
            if (blob) {
                const formData = new FormData();
                formData.append('image', blob, `webcam.jpg`);
                formData.append('user_id', userId);
                await registerFace(formData);
                
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <LoadingModal show={loading} />

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
                                onClick={() => registerFaces(10)}
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
