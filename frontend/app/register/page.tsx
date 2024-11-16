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
    const [user, setUser] = useState<User>();
    const [message, setMessage] = useState<string | null>(null);
    const [image, setImage] = useState(null);
    const [isMaxImages, setIsMaxImages] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagesCount, setImagesCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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
        if (!session?.user) return;
        const userId = session.user.id as string;
        const formData = new FormData();
        formData.append('user_id', userId);
        try {
            const uri =`${API_URL}api/face/deletes`
            var response = await axios.post(uri, formData);
            return response.data.status
        } catch (error) {

        } 
    }

    const registFace = async () => {
        if (!session?.user) return;
        const userId = session.user.id as string;

        const blob = await getBlob();
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, "webcam.jpg");
        formData.append('user_id', userId);
        // console.log(formData)

        try {
            const uri =`${API_URL}api/face/regist`
            var response = await axios.post(uri, formData);
            setImagesCount(response.data.images_count)
            setImageUrl(URL.createObjectURL(blob));
            setError(response.data.error)
            return response.data.status
        } catch (error) {

        }
    }

    const registFaces = async () => {
        if (!session?.user) return;
        setLoading(true);

        await deleteFaces();

        setLoading(false);

        const MAX = 10;
        var count = 0;
        var index = 0;
        
        while (count < 5) {
            const status = await registFace();
            var message = ""
            if (status) {
                count++
                message = `regist face count: ${count}`
            } else {
                message = `regist face error: ${index}`
            }
            setMessage(message)
            await new Promise((resolve) => setTimeout(resolve, 1000));
            index++
            if (index > MAX) break;
        }
        setLoading(false);
        setError("")
        setMessage("regist face completed.")
    };

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
                            <video ref={videoRef} width="320" height="240" className="mb-4 border-2 border-gray-300" />
                            <div className="text-center">
                                {isMaxImages ? (
                                    <button
                                        onClick={() => deleteFaces()}
                                        className="bg-red-500 text-white py-2 px-4 rounded mb-2"
                                    >
                                        Delete Face
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => registFaces()}
                                        className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                                        disabled={isMaxImages}
                                    >
                                        Register Face
                                    </button>
                                )}
                            </div>
                        </>
                    }

                    {imageUrl && (
                        <Image src={imageUrl} alt="Registered Face" width={320} height={240} className="mb-4 border-2 border-gray-300" />
                    )}

                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
