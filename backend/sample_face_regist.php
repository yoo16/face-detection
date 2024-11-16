<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evacuation Face Recognition</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

    <style>
        .loader div:nth-child(1) {
            animation-delay: 0.1s;
        }

        .loader div:nth-child(2) {
            animation-delay: 0.3s;
        }

        .loader div:nth-child(3) {
            animation-delay: 0.5s;
        }
    </style>
</head>

<body>

    <div id="loading" class="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center hidden">
        <div class="loader bg-white p-3 rounded-full flex space-x-3">
            <div class="w-3 h-3 bg-gray-800 rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-gray-800 rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-gray-800 rounded-full animate-bounce"></div>
        </div>
    </div>

    <div class="container max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg bg-opacity-90">
        <h1 class="text-2xl font-bold text-center mb-6">Regist faces</h1>

        <div id="message" class="mt-4"></div>

        <div>
            <input type="file" id="photo">
            <video id="video" width="320" height="240" autoplay style="display:none;" class="mt-4"></video>
            <button onclick="onCapture()" type="button" id="captureBtn" class="bg-purple-500 text-white px-3 py-2 rounded-md mt-4">Capture Image</button>
            <canvas id="canvas" width="320" height="240"></canvas>
        </div>
        <div id="regist-area">
            <label for="">
                Input user id
            </label>
            <input class="border border-gray-300 p-2" type="number" name="user_id" id="user-id">
            <button onclick="regist()" type="button" id="captureBtn" class="bg-purple-500 text-white px-3 py-2 rounded-md mt-4">Regist Images</button>
        </div>
        <div class="my-5">
            <a href="sample_face_recognize.php" class="text-blue-500 border border-blue-500 p-2 rounded-md mt-4">Recept</a>
        </div>
    </div>

    <script src="js/env.js" defer></script>
    <script src="js/regist.js" defer></script>
</body>

</html>