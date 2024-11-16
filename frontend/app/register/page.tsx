'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState, useCallback } from 'react';
import LoadingModal from '@/app/components/LoadingModal';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, captureImage, faceDetected, getBlob } = useCamera();
    const { data: session } = useSession();
    const [user, setUser] = useState();
    const [message, setMessage] = useState<string | null>(null);
    const [image, setImage] = useState(null);
    const [isMaxImages, setIsMaxImages] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagesCount, setImagesCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>();


    const fetchUser = useCallback(async () => {
        try {
            const userId = session?.user?.id;
            const response = await axios.get(`/api/user/${userId}`);
            setUser(response.data);
        } catch (error) {
            setError('Error fetching user');
        }
    }, [session?.user?.id]);

    const deleteFaces = async () => {
        if (!userId) return;

        const formData = new FormData();
        formData.append('user_id', userId?.toString());
        try {
            const uri = `${API_URL}api/face/deletes`;
            const response = await axios.post(uri, formData);
            return response.data.status;
        } catch (error) {
            setError('Error deleting faces');
        }
    };

    const registFace = async () => {
        if (!userId) return;

        const blob = await getBlob();
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, "webcam.jpg");
        formData.append('user_id', userId.toString());

        try {
            const uri = `${API_URL}api/face/regist`;
            const response = await axios.post(uri, formData);
            setImagesCount(response.data.images_count);
            setImageUrl(URL.createObjectURL(blob));
            setError(response.data.error);
            return response.data.status;
        } catch (error) {
            setError('Error registering face');
        }
    };

    const registFaces = async () => {
        if (!session?.user) return;
        setLoading(true);

        await deleteFaces();

        setLoading(false);

        const MAX = 10;
        let count = 0;
        let index = 0;

        while (count < 5) {
            const status = await registFace();
            let message = "";
            if (status) {
                count++;
                message = `Registered face count: ${count}`;
            } else {
                message = `Register face error: ${index}`;
            }
            setMessage(message);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            index++;
            if (index > MAX) break;
        }
        setLoading(false);
        setError(null);
        setMessage("Face registration completed.");
    };

    useEffect(() => {
        if (session?.user?.id) {
            setUserId(Number(session.user.id));
        }
    }, [session]);

    useEffect(() => {
        const initializeCamera = async () => {
            await startCamera();
        };
        initializeCamera();
    }, [startCamera]);

    return (
        <div className="bg-gray-100 flex flex-col items-center justify-center">
            <LoadingModal show={loading} />

            <h1 className="text-3xl font-bold mb-4">Register</h1>
            <div>
                <h2 className="text-xl font-bold mb-4">User ID</h2>
                <input
                    type="number"
                    className="p-3"
                    onChange={(e) => setUserId(Number(e.target.value))}
                    value={userId}
                    placeholder="User ID"
                />
            </div>
            <div className="flex items-center mb-4">
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

                    <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                    {cameraActive && (
                        <>
                            <video ref={videoRef} width="320" height="240" className="mb-4 border-2 border-gray-300" />
                            <div className="text-center">
                                <button
                                    onClick={registFaces}
                                    className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                                    disabled={isMaxImages}
                                >
                                    Register Face
                                </button>
                            </div>
                        </>
                    )}

                    {imageUrl && (
                        <Image src={imageUrl} alt="Registered Face" width={320} height={240} className="mb-4 border-2 border-gray-300" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
