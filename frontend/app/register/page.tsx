'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import useCamera from '@/app/hooks/useCamera';
import { useEffect, useState, useCallback } from 'react';
import LoadingModal from '@/app/components/LoadingModal';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob } = useCamera();
    const { data: session } = useSession();
    const [user, setUser] = useState<User>();
    const [message, setMessage] = useState<string | null>(null);
    const [image, setImage] = useState(null);
    const [isMaxImages, setIsMaxImages] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagesCount, setImagesCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const checkMaxImages = useCallback(async () => {
        const MAX = 100;
        const userId = session?.user?.id as string;
        const response = await axios.get(`${API_URL}api/user/${userId}/images_count`);
        const images_count = response.data.count;
        const isMaxImages = images_count >= MAX;

        setImagesCount(images_count)
        setIsMaxImages(isMaxImages);
        if (isMaxImages) setError(`Max face images. (${images_count})`)
    }, [session?.user?.id]);

    const fetchUser = useCallback(async () => {
        try {
            const userId = session?.user?.id;
            const response = await axios.get(`/api/user/${userId}`);
            setUser(response.data);
        } catch (error) {
            setError('Error fetching user');
        }
    }, [session?.user?.id]);

    const deleteImages = async () => {
        const userId = session?.user?.id as string;
        const confirmed = window.confirm('Are you sure you want to delete all images?');
        if (confirmed) {
            try {
                const uri = `${API_URL}api/user/${userId}/delete_images`;
                console.log(uri)
                const response = await axios.post(uri);
            } catch (error) {
                console.error('Error deleting images:', error);
            }
        }
    }

    const registerFace = async () => {
        if (isMaxImages) {
            return;
        }

        if (!session?.user) return;
        const userId = session.user.id as string;

        const blob = await getBlob();
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, `webcam.jpg`);
        formData.append('user_id', userId);
        try {
            var response = await axios.post(`${API_URL}api/face/regist`, formData);
            setImagesCount(response.data.images_count)
            setImageUrl(URL.createObjectURL(blob));
            setError(response.data.error)
            return response.data.status
        } catch (error) {

        }
    }


    const registerFaces = async () => {
        if (!session?.user) return;
        if (isMaxImages) return;

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
            if (imagesCount > MAX) break;
            await new Promise((resolve) => setTimeout(resolve, 500));
            index++
            if (index > MAX) break;
        }
        setLoading(false);
        setError("")
        setMessage("regist face completed.")
    };

    useEffect(() => {
        console.log("Session:", session)
        if (!session?.user) return;
        fetchUser();
        checkMaxImages();
    }, [session, fetchUser, checkMaxImages])

    useEffect(() => {
        const initializeCamera = async () => {
            await startCamera();
        };
        initializeCamera();
    }, [startCamera]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <LoadingModal show={loading} />

            <h1 className="text-3xl font-bold mb-4">Register</h1>
            <div>
                <div>{user?.name}</div>
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

                    {cameraActive &&
                        <>
                            <div>
                                {isMaxImages ? (
                                    <button
                                        onClick={() => deleteImages()}
                                        className="bg-red-500 text-white py-2 px-4 rounded mb-2"
                                    >
                                        Delete Face
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => registerFaces()}
                                        className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                                        disabled={isMaxImages}
                                    >
                                        Register Face
                                    </button>
                                )}
                            </div>
                            <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                        </>
                    }

                    {imageUrl && (
                        <Image src={imageUrl} alt="Registered Face" width={640} height={480} className="mb-4 border-2 border-gray-300" />
                    )}

                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
