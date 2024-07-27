// pages/faceRecognition.js
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useCamera from '../hooks/useCamera';
import * as faceapi from 'face-api.js';
import LoadingModal from '../components/LoadingModal';
import Image from 'next/image';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FaceRecognitionPage = () => {
    const { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob } = useCamera();
    const { data: session } = useSession();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!session?.user) return;
        fetchUser();
    }, [session]);

    const fetchUser = async () => {
        try {
            const userId = session?.user?.id;
            const response = await axios.get(`/api/user/${userId}`);
            setUser(response.data);
        } catch (error) {
            setError('Error fetching user');
        }
    };

    const registerFace = async () => {
        console.log(session)
        if (!session?.user) return;
        const userId = session.user.id;
        const blob = await getBlob();

        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'webcam.jpg');
        formData.append('user_id', userId);

        try {
            const response = await axios.post(`${API_URL}/api/face/regist`, formData);
            setMessage(response.data.message);
        } catch (error) {
            setError('Error registering face');
        }
    };

    const recognizeFace = async () => {
        const blob = await getBlob();
        if (!blob) return;

        const image = await faceapi.bufferToImage(blob);
        const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

        if (!detections.length) {
            setMessage('No faces detected');
            return;
        }

        const labeledFaceDescriptors = await loadLabeledImages();
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

        const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
        if (bestMatch.label === 'unknown') {
            setMessage('Face not recognized');
        } else {
            setMessage(`Hello, ${bestMatch.label}!`);
        }
    };

    const loadLabeledImages = async () => {
        const labels = [user.name];
        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];
                for (let i = 1; i <= 3; i++) {
                    const img = await faceapi.fetchImage(`/images/${label}/${i}.jpg`);
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    if (detections) descriptions.push(detections.descriptor);
                }
                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <LoadingModal show={loading} />
            <h1 className="text-3xl font-bold mb-4">Face Recognition</h1>
            <div>
                <div>{user?.id}</div>
                <div>{user?.name}</div>
            </div>
            <div className="flex items-center mb-4">
                <div>
                    <button
                        onClick={registerFace}
                        className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
                    >
                        Register Face
                    </button>
                    <button
                        onClick={recognizeFace}
                        className="bg-green-500 text-white py-2 px-4 rounded mb-2"
                    >
                        Recognize Face
                    </button>
                    <video ref={videoRef} width="640" height="480" className="mb-4 border-2 border-gray-300" />
                    <canvas ref={canvasRef} width="640" height="480" className="hidden" />
                    {message && <div>{message}</div>}
                    {error && <div>{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionPage;
