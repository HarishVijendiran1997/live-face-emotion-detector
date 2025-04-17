import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';

const EmotionDetector = () => {

    const videoRef = useRef(null)
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState(null)
    const emotionEmojis = {
        happy: "😊",
        sad: "😢",
        angry: "😠",
        fearful: "😨",
        disgusted: "🤢",
        surprised: "😲",
        neutral: "😐",
    };

    //Starting webcam
    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            videoRef.current.srcObject = stream
        } catch (error) {
            console.error("Error accessing webcam", error);
            alert("Camera access denied or not supported in this environment.");
        }
    }

    //loading the face detection models
    const loadModels = async () => {
        const MODEL_URL = '/models';

        try {
            // console.log(" Loading models...");
            await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)])
            // console.log("All models loaded successfully");
        } catch (error) {
            console.error("Error loading models:", error);
        }
    }

    //Detect faces and emotions in the webcam stream
    const detectFacesAndEmotions = async () => {

        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()


        const canvas = canvasRef.current
        faceapi.matchDimensions(canvas, videoRef.current)

        // console.log("😊 Detected Faces & Emotions:");
        if (detections && detections.expressions) {
            faceapi.draw.drawDetections(canvas, detections)
            const { expressions } = detections;
            // console.log(expressions);
            const Emotions = Object.keys(expressions)
            // console.log(Emotions);
            const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b)
            // console.log(dominantEmotion);
            // console.log(`Face : ${dominantEmotion} (${(expressions[dominantEmotion] * 100).toFixed(2)}%)`);
            setEmotion({
                name: dominantEmotion,
                confidence: (expressions[dominantEmotion] * 100).toFixed(2)
            })
        } else {
            console.log("😔 No faces detected.");
            setEmotion(null)
        }
    }


    useEffect(() => {
        loadModels()
        startVideo()
        const interval = setInterval(() => {
            detectFacesAndEmotions()
        }, 200)

        return () => clearInterval(interval)
    }, [])



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white">
            <h1 className="text-2xl mb-4">Live Face Emotion Detector</h1>
            <div className='relative'>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="rounded-lg shadow-lg border-2 border-white"
                    width="640"
                    height="480"
                />
                <canvas
                    ref={canvasRef}
                    className='absolute top-0 left-0 hidden sm:block'
                    width="640"
                    height="480"
                />
            </div>
            <div className="mt-4">
                {emotion ? (
                    <div className="text-xl font-semibold text-green-400">
                        {emotionEmojis[emotion.name]} Emotion: {emotion.name} ({emotion.confidence}%)
                    </div>

                ) : (
                    <div className="text-gray-500">No face detected</div>
                )}
            </div>
        </div>
    );
}

export default EmotionDetector