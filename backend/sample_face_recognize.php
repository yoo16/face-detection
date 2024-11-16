<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evacuation Face Recognition - Home</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body>

    <main id="home" class="text-center py-20 mt-16 fade-in">
        <div class="container mx-auto">
            <h2 class="text-4xl font-bold mb-4">顔認証</h2>

            <div id="message" class="text-red-500 p-3"></div>

            <div class="my-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center items-center">
                <!-- カメラ映像を表示するビデオタグ -->
                <video id="video" width="320" height="240" autoplay class="mt-4"></video>

                <!-- キャプチャした画像を保持するキャンバス -->
                <canvas id="canvas" width="320" height="240" style="display:none;"></canvas>
            </div>

            <div id="responseMessage" class="p-3"></div>

            <!-- Button Group -->
            <div class="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center items-center">

                <form id="receipt-form" action="add.php" method="post">
                    <!-- Reception Button -->
                    <input type="hidden" id="user-id" name="user_id" value="1">
                </form>

                <button onclick="onRecognize()" class="bg-purple-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:bg-purple-700 transition duration-300 ease-in-out">
                    Recognize
                </button>
            </div>
            <div class="my-5">
                <a href="sample_face_regist.php" class="text-blue-500 border border-blue-500 p-2 rounded-md mt-4">Register</a>
            </div>
        </div>
    </main>

    <script src="js/env.js" defer></script>
    <script src="js/recognize.js" defer></script>
</body>

</html>