import React from 'react'

export default function HeroSection({ onStartListening }) {
    return (
        <div className="relative overflow-hidden rounded-lg sm:rounded-2xl min-h-[300px] sm:min-h-[350px] flex items-center p-6 sm:p-10 lg:p-12 text-white mb-6 sm:mb-8 group">
            {/* Aurora Mesh Background */}
            <div className="absolute inset-0 bg-[#0f0c29] overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-purple-600/80 rounded-full mix-blend-screen blur-[100px] animate-blob"></div>
                <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] bg-cyan-500/80 rounded-full mix-blend-screen blur-[100px] animate-blob delay-animation"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] bg-pink-600/80 rounded-full mix-blend-screen blur-[100px] animate-blob delay-animation-2"></div>
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-5 tracking-tight drop-shadow-md">
                    Welcome to StreamFlow
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-lg leading-relaxed font-medium">
                    Discover, upload, and stream your favorite music with our hyper-modern platform.
                </p>
                <button 
                    onClick={onStartListening}
                    className="bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-105 hover:from-purple-500 hover:via-purple-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95 text-base sm:text-lg border border-white/10"
                >
                    Start Listening
                </button>
            </div>
        </div>
    )
}
