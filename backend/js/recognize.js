const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const message = document.getElementById('message');

// キャプチャされた画像を保持するための DataTransfer オブジェクト
var dataTransfer = new DataTransfer();

// 受付処理
const recognize = async (file) => {
    console.log(file)
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_RECEPT_FACE_URL, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const result = await response.json();
        console.log(result)
        if (result.user_id > 0) {
            message.textContent = `Recognize Success!! User ID is ${result.user_id}`;
            message.classList.add('text-green-500')
        } else {
            message.textContent = "Recognize Error!";
            message.classList.add('text-red-500')
        }
    }
};

// カメラ起動処理
const onCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // ビデオサイズに基づいてキャンバスサイズを設定
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
    } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Unable to access the camera. Please check your device permissions.");
    }
};

const onDetect = () => {
    captureImage(detect)
}

const onRecognize = () => {
    captureImage(recognize)
}

// 画像キャプチャと送信処理
const captureImage = (callback) => {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        const file = new File([blob], `captured-image.jpg`, { type: 'image/jpeg' });
        callback(file);
    });
};

// ページロード時にカメラを起動
window.onload = () => {
    onCamera();
};