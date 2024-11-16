const registrationForm = document.getElementById('registrationForm');
const openCameraBtn = document.getElementById('openCameraBtn');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const photoInput = document.getElementById('photo');
const message = document.getElementById('message');
const registArea = document.getElementById('regist-area');
const maxImageCount = 5

console.log(API_REGIST_FACE_URL)

// キャプチャされた画像を保持するための DataTransfer オブジェクト
const dataTransfer = new DataTransfer();

// カメラ起動処理
// ローディング表示の制御関数
const showLoading = () => {
    document.getElementById('loading').style.display = 'flex';
};
const hideLoading = () => {
    document.getElementById('loading').style.display = 'none';
};

// カメラ起動処理
const onCamera = async (e) => {
    showLoading(); // ローディング表示
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = 'block';
    captureBtn.style.display = 'block';
    hideLoading(); // カメラ起動完了後にローディング非表示
};

// 画像キャプチャ処理
const onCapture = async (e) => {
    showLoading(); // キャプチャ中にローディング表示
    const context = canvas.getContext('2d');
    let count = 0;

    const captureImage = () => {
        if (count < maxImageCount) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                const file = new File([blob], `captured-image-${Date.now()}-${count}.jpg`, { type: 'image/jpeg' });

                // DataTransfer にキャプチャした画像を追加
                dataTransfer.items.add(file);

                // 更新したファイルリストを <input> 要素に反映
                photoInput.files = dataTransfer.files;
            });

            count++;
            setTimeout(captureImage, 1000);
        } else {
            hideLoading(); // キャプチャ終了後にローディング非表示
        }
    };

    captureImage(); // 最初のキャプチャを開始
};

// 登録処理
const regist = async (e) => {
    const userId = document.getElementById('user-id').value;
    if (userId > 0) {
        await registFaces(userId);
    } else {
        alert('invalid user id');
    }
};

const registFaces = async (userId) => {
    showLoading(); // 登録中にローディング表示
    const formData = new FormData();
    formData.append('user_id', userId);

    for (let i = 0; i < dataTransfer.files.length; i++) {
        formData.append('images', dataTransfer.files[i]);
    }

    try {
        const response = await fetch(API_REGIST_FACE_URL, {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result);
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        message.textContent = `Error: ${error.message}`;
        message.style.color = 'red';
    } finally {
        hideLoading(); // 登録完了後にローディング非表示
    }
};

// カメラを起動
onCamera();