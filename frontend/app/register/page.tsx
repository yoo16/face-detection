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
    const [image, setImage] = useState(null);
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


    const registerFace = async () => {
        if (!session?.user) return;
        const userId = session.user.id as string;

        const blob = await getBlob();
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, `webcam.jpg`);
        formData.append('user_id', userId);
        console.log("userID:", userId)
        try {
            var response = await axios.post(`${API_URL}api/face/regist`, formData);
            console.log(response.data)
            setError(response.data.error)
            setImage(response.data.image)
            return response.data.status
        } catch (error) {

        }
    }

    const checkMaxImages = async () => {
        const MAX = 100;
        const userId = session?.user?.id as string;
        var response = await axios.get(`${API_URL}api/user/${userId}/images_count`);
        var images_count = response.data.count
        return (images_count > MAX);
    }

    const registerFaces = async () => {
        if (!session?.user) return;
        const isMaxImages = await checkMaxImages();
        if (isMaxImages) {
            setError('Max registered images.')
            return;
        }

        setLoading(true);

        const MAX = 100;
        var count = 0;
        var index = 0;
        while (count < 10) {
            const status = await registerFace();
            if (status) {
                count++
                const message = `regist face count: ${count}`
                setMessage(message)
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            index++
            if (index > MAX) break;
        }
        setLoading(false);
        setError("")
        setMessage("regist face completed.")
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
                                onClick={() => registerFaces()}
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
