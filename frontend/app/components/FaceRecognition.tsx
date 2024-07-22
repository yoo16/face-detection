'use client'

import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => console.error('Error accessing camera: ', err));
  };

  useEffect(() => {
    if (modelsLoaded && videoRef.current) {
      startVideo();
      videoRef.current.addEventListener('play', () => {
        const displaySize = { width: videoRef.current!.width, height: videoRef.current!.height };
        faceapi.matchDimensions(canvasRef.current!, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(videoRef.current!)
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvasRef.current!.getContext('2d')?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          faceapi.draw.drawDetections(canvasRef.current!, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current!, resizedDetections);
        }, 100);
      });
    }
  }, [modelsLoaded]);

  return (
    <div>
      <video ref={videoRef} width="720" height="560" />
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );
};

export default FaceRecognition;
