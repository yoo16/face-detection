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
                    detectFaces(); // Start detecting faces
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

    const getBlob = useCallback(async (): Promise<Blob | null> => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const blob = await new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, 'image/jpeg'));
                return blob;
            }
        }
        return null;
        // const imageDataUrl = captureImage();
        // if (!imageDataUrl) return;
        // const blob = await fetch(imageDataUrl).then(res => res.blob());
        // return blob;
    }, []);

    const detectFaces = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        const context = canvasRef.current.getContext('2d');

        const detect = async () => {
            if (context && videoRef.current) {
                const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
                if (detections && canvasRef?.current) {
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, detections);
                    // faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
                    setFaceDetected(detections.length > 0);
                }
            }
            requestAnimationFrame(detect);
        };

        detect();
    }, []);

    return { videoRef, canvasRef, cameraActive, startCamera, stopCamera, captureImage, getBlob, faceDetected };
};

export default useCamera;
