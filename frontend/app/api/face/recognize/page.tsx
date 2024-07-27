import { NextRequest, NextResponse } from 'next/server';
import * as faceapi from 'face-api.js';
import { promises as fs } from 'fs';
import path from 'path';

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
}

const loadLabeledImages = async (userId: number) => {
    const descriptions: Float32Array[] = [];
    const basePath = path.join(process.cwd(), 'public', 'registered_faces', userId.toString());

    try {
        const files = await fs.readdir(basePath);
        for (const file of files) {
            const imagePath = path.join(basePath, file);
            try {
                const imageData = await fs.readFile(imagePath);
                if (imageData) {
                    const img = await faceapi.bufferToImage(imageData);
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    if (detections) {
                        descriptions.push(detections.descriptor);
                    }
                }
            } catch (error) {
                console.log(`Failed to process image: ${imagePath}`);
            }
        }
    } catch (error) {
        console.log(`Failed to read directory: ${basePath}`);
    }

    return new faceapi.LabeledFaceDescriptors(userId.toString(), descriptions);
};

export async function POST(req: NextRequest) {
    try {
        await loadModels();

        const formData = await req.formData();
        const userId = formData.get('user_id') as string;
        const labeledDescriptors = await loadLabeledImages(Number(userId));
        const faceMatcher = new faceapi.FaceMatcher([labeledDescriptors]);

        const imageFile = formData.get('image') as File;
        const imageArrayBuffer = await imageFile.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        const img = await faceapi.bufferToImage(imageBuffer);

        const singleResult = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (singleResult) {
            const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
            return NextResponse.json({ label: bestMatch.label, distance: bestMatch.distance });
        } else {
            return NextResponse.json({ error: 'No face detected' });
        }
    } catch (error) {
        return NextResponse.json({ error: 'No face detected' });
    }
}
