import React from 'react';
import { motion } from 'framer-motion';

const AnimatedFire = () => {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]"
            >
                {/* Base Fire (Darker Blue) */}
                <motion.path
                    d="M16 2C16 2 10 10 10 16.5C10 21.5 13.5 25.5 16 25.5C18.5 25.5 22 21.5 22 16.5C22 13 20 10.5 19 9C21 11 24 14 24 18C24 23.5 19.5 28.5 16 28.5C12.5 28.5 8 23.5 8 18C8 12 12 7 13 6"
                    fill="#1E3A8A"
                    animate={{ scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />

                {/* Raging Flames (Mid Blue) - Rising Upwards */}
                <motion.path
                    d="M16 4C16 4 12 12 12 17C12 21 14 24 16 24C18 24 20 21 20 17C20 14 18 10 17 8"
                    fill="#3B82F6"
                    animate={{
                        d: [
                            "M16 4C16 4 12 12 12 17C12 21 14 24 16 24C18 24 20 21 20 17C20 14 18 10 17 8",
                            "M16 2C16 2 11 11 11 17C11 21 14.5 25 16 25C17.5 25 21 21 21 17C21 11 18 8 17 6",
                            "M16 4C16 4 12 12 12 17C12 21 14 24 16 24C18 24 20 21 20 17C20 14 18 10 17 8"
                        ],
                        y: [0, -2, 0]
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Core Heat (Cyan/White) - Flickering rapidly at bottom then rising */}
                <motion.path
                    d="M16 14C16 14 14 18 14 20C14 22 15 23 16 23C17 23 18 22 18 20C18 18 16 14 16 14"
                    fill="#93C5FD"
                    animate={{
                        y: [0, -5, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeOut" }}
                />
            </svg>
        </div>
    );
};

export default AnimatedFire;
