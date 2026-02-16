import React from 'react';
import { motion } from 'framer-motion';

const AnimatedWatch = () => {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-blue-500"
            >
                {/* Watch Strap */}
                <path d="M30 0 V20 H70 V0 H30 Z" fill="#1E3A8A" />
                <path d="M30 80 V100 H70 V80 H30 Z" fill="#1E3A8A" />

                {/* Watch Case */}
                <circle cx="50" cy="50" r="35" stroke="#3B82F6" strokeWidth="4" fill="none" />
                <circle cx="50" cy="50" r="28" stroke="#93C5FD" strokeWidth="1" fill="none" />

                {/* Quarter Markers */}
                <line x1="50" y1="22" x2="50" y2="28" stroke="#3B82F6" strokeWidth="3" />
                <line x1="78" y1="50" x2="72" y2="50" stroke="#3B82F6" strokeWidth="3" />
                <line x1="50" y1="78" x2="50" y2="72" stroke="#3B82F6" strokeWidth="3" />
                <line x1="22" y1="50" x2="28" y2="50" stroke="#3B82F6" strokeWidth="3" />

                {/* Rotating Needle */}
                <motion.g
                    style={{ originX: "50px", originY: "50px" }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "linear"
                    }}
                >
                    <line x1="50" y1="50" x2="50" y2="25" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                </motion.g>

                {/* Shine Overlay - Triggered at end of cycle */}
                <motion.circle
                    cx="50" cy="50" r="35"
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 0.8, 0] }}
                    transition={{
                        duration: 2.5, // 2s spin + 0.5s delay
                        repeat: Infinity,
                        times: [0, 0.8, 0.9, 1],
                        ease: "linear"
                    }}
                    className="mix-blend-overlay pointer-events-none"
                />
            </svg>
        </div>
    );
};

export default AnimatedWatch;
