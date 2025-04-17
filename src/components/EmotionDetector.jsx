import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';

const EmotionDetector = () => {

    const videoRef = useRef(null)
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState(null)

    //Starting webcam
    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            videoRef.current.srcObject = stream
        } catch (error) {
            console.error("Error accessing webcam", error);
        }
    }

    //loading the face detection models
    const loadModels = async () => {
        const MODEL_URL = '/models';

        try {
            console.log("📦 Loading models...");
            await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)])
            console.log("✅ All models loaded successfully");
        } catch (error) {
            console.error("❌ Error loading models:", err);
        }
    }

    //Detect faces and emotions in the webcam stream
    const detectFacesAndEmotions = async () => {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
        console.log("😊 Detected Faces & Emotions:");
        if (detections.length > 0) {
            detections.forEach((detection, i) => {
                const { expressions } = detection;
                console.log(expressions);
                const Emotions = Object.keys(expressions)
                console.log(Emotions);
                const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b)
                console.log(dominantEmotion);
                console.log(`Face : ${dominantEmotion} (${(expressions[dominantEmotion] * 100).toFixed(2)}%)`);
                setEmotion({
                    name: dominantEmotion,
                    confidence: (expressions[dominantEmotion]*100).toFixed(2)
                })
            });
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
        }, 2000)

        return () => clearInterval(interval)
    }, [])



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl mb-4">🎥 Live Face Emotion Detector</h1>
            <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded-lg shadow-lg border-4 border-white"
                width="640"
                height="480"
            />
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0 }}
            />
        </div>
    );
}

export default EmotionDetector