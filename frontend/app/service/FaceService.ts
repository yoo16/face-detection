import * as faceapi from 'face-api.js';

export async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

export const loadLabeledImages = async (userId: number) => {
    const descriptions: Float32Array[] = [];
    const basePath = `/registered_faces/${userId}`;

    try {
        const response = await fetch(basePath);
        const files = await response.json();

        for (const file of files) {
            const imagePath = `${basePath}/${file}`;
            try {
                const img = await faceapi.fetchImage(imagePath);
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

export const recognizeFace = async (imageBuffer: Blob, userIds: number[]) => {
    const img = await faceapi.bufferToImage(imageBuffer);
    const queryDetections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!queryDetections) {
        throw new Error('No face detected in the provided image');
    }

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const userId of userIds) {
        console.log("User ID:", userId)
        const labeledDescriptors = await loadLabeledImages(userId);
        const faceMatcher = new faceapi.FaceMatcher([labeledDescriptors]);
        const match = faceMatcher.findBestMatch(queryDetections.descriptor);
        if (match.distance < bestDistance) {
            bestDistance = match.distance;
            bestMatch = { label: match.label, distance: match.distance };
        }
    }

    return bestMatch;
};
