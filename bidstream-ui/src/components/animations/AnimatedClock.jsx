import React from 'react';
import { motion } from 'framer-motion';

const AnimatedClock = () => {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Hourglass Animation */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-blue-500"
                animate={{ rotate: [0, 0, 180] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    times: [0, 0.8, 1],
                    ease: "easeInOut",
                    repeatDelay: 0.5
                }}
            >
                {/* Hourglass Body */}
                <path d="M6 3H18M6 21H18" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 3V6 C6 8 8 10 10 11 L12 12 L14 11 C16 10 18 8 18 6 V3" stroke="#3B82F6" strokeWidth="2" />
                <path d="M6 21V18 C6 16 8 14 10 13 L12 12 L14 13 C16 14 18 16 18 18 V21" stroke="#3B82F6" strokeWidth="2" />

                {/* Sand Draining (Top) */}
                <motion.path
                    d="M7 6 H17 C17 8 15 10 12 11 C9 10 7 8 7 6 Z"
                    fill="#60A5FA"
                    animate={{ scaleY: [1, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }} // 0.8 * 4s
                    style={{ originY: "11px", originX: "12px" }}
                />

                {/* Sand Stream */}
                <motion.line
                    x1="12" y1="12" x2="12" y2="16"
                    stroke="#60A5FA" strokeWidth="1.5"
                    animate={{ height: [0, 4], opacity: [1, 1, 0] }}
                />

                {/* Sand Accumulating (Bottom) */}
                <motion.path
                    d="M7 18 H17 C17 16 15 14 12 13 C9 14 7 16 7 18 Z"
                    fill="#60A5FA"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: [0, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                    style={{ originY: "18px", originX: "12px" }}
                />
            </motion.svg>
        </div>
    );
};

export default AnimatedClock;
