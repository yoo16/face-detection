import * as faceapi from 'face-api.js';
import { promises as fs } from 'fs';
import path from 'path';

// モデルの読み込み関数
export async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
}

// 特定のユーザーIDの画像からラベル付き顔データを読み込む関数
export const loadLabeledImages = async (userId: number) => {
    const descriptions: Float32Array[] = [];
    const basePath = path.join(process.cwd(), 'public', 'registered_faces', userId.toString());

    try {
        const files = await fs.readdir(basePath);
        for (const file of files) {
            const imagePath = path.join(basePath, file);
            try {
                const imageData = await fs.readFile(imagePath) as unknown as Blob;
                const img = await faceapi.bufferToImage(imageData);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (detections) {
                    descriptions.push(detections.descriptor);
                }
            } catch (error) {
                console.error(`Failed to process image: ${imagePath}`, error);
            }
        }
    } catch (error) {
        console.error(`Failed to read directory: ${basePath}`, error);
    }

    return new faceapi.LabeledFaceDescriptors(userId.toString(), descriptions);
};

// 画像を受け取り、認証処理を行う関数
export const recognizeFace = async (formData: FormData, userIds: number[]) => {
    const imageFile = formData.get('image') as File;
    if (!imageFile) {
        throw new Error('No image file provided');
    }

    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer) as unknown as Blob;
    const img = await faceapi.bufferToImage(imageBuffer);

    const queryDetections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!queryDetections) {
        throw new Error('No face detected in the provided image');
    }

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const userId of userIds) {
        const labeledDescriptors = await loadLabeledImages(userId);
        const faceMatcher = new faceapi.FaceMatcher([labeledDescriptors]);

        const match = faceMatcher.findBestMatch(queryDetections.descriptor);
        if (match.distance < bestDistance) {
            bestDistance = match.distance;
            bestMatch = { label: match.label, distance: match.distance };
        }
    }

    if (bestMatch) {
        return bestMatch;
    } else {
        throw new Error('No matching face found');
    }
};
