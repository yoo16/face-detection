import { useState, useRef } from 'react';

const useCamera = () => {
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            streamRef.current = stream;
            setCameraActive(true);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.srcObject = null;
            }
            streamRef.current = null;
            setCameraActive(false);
        }
    };

    const getBlob = async () => {
        const context = canvasRef.current?.getContext('2d');
        if (!context || !videoRef.current || !canvasRef.current) return null;

        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        const blob = await (await fetch(imageData)).blob();
        return blob;
    };

    return {
        videoRef,
        canvasRef,
        cameraActive,
        startCamera,
        stopCamera,
        getBlob,
    };
};

export default useCamera;