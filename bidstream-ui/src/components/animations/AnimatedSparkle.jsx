import React from 'react';
import { motion } from 'framer-motion';

const AnimatedSparkle = () => {
    return (
        <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            >
                {/* 4-Point Star Outline */}
                <motion.path
                    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                    stroke="#60A5FA" // Light Blue
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.5 }}
                    animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0.5, 1, 1, 0.5],
                        stroke: ["#3B82F6", "#93C5FD", "#3B82F6"]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Center Fill Pulse */}
                <motion.path
                    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                    fill="#3B82F6"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 0.5, 0], opacity: [0, 0.3, 0] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </svg>
        </div>
    );
};

export default AnimatedSparkle;
