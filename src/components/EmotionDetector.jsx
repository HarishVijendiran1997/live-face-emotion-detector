import React, { useEffect, useRef } from 'react'

const EmotionDetector = () => {

    const videoRef = useRef(null)

    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                videoRef.current.srcObject = stream
            } catch (error) {
                console.error("Error accessing webcam", error);
            }
        }

        startVideo()
    }, [])



    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded-lg shadow-lg border-4 border-white"
                width="640"
                height="480"
            />
        </div>
    );
}

export default EmotionDetector