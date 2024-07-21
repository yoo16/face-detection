'use client'

import { useState, useRef } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [detectedImage, setDetectedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getDetectBlob = async () => {
    const blob = await (await fetch(`data:image/jpeg;base64,${detectedImage}`)).blob();
    return blob;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Home Page</h1>
      <div>

      </div>
    </div >
  );
};

export default HomePage;
