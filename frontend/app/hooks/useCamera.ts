import { useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    const startCamera = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    startFaceDetection();
                };
            }
            setCameraActive(true);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        setFaceDetected(false);
    }, []);

    const captureImage = useCallback(() => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                return canvasRef.current.toDataURL('image/jpeg');
            }
        }
        return null;
    }, []);

    const startFaceDetection = useCallback(async () => {
        if (!videoRef.current) return;

        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

        const detectFaces = async () => {
            if (!videoRef.current) return;
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            setFaceDetected(detections.length > 0);
            requestAnimationFrame(detectFaces);
        };

        detectFaces();
    }, []);

    return { videoRef, canvasRef, cameraActive, startCamera, stopCamera, captureImage, faceDetected };
};

export default useCamera;
