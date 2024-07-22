import { useRef, useState, useCallback } from 'react';

const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const startCamera = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
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
    }, []);

    return { videoRef, canvasRef, cameraActive, startCamera, stopCamera, getBlob };
};

export default useCamera;
