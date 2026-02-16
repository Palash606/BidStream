import React from 'react';
import { motion } from 'framer-motion';

const AnimatedDiamond = () => {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Diamond Outlines - Lit Sequence */}
                <motion.path
                    d="M12 2L3 9L12 22L21 9L12 2Z" // Outline
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "easeInOut"
                    }}
                />

                {/* Inner Facet Lines */}
                <motion.path
                    d="M3 9H21 M12 22L6 9 M12 22L18 9 M12 2L6 9 M12 2L18 9"
                    stroke="#60A5FA"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "easeInOut",
                        delay: 0.2
                    }}
                />

                {/* Top Part Shine - Triggers after outlines */}
                <motion.path
                    d="M6 9L12 2L18 9H6Z" // Top Triangle
                    fill="#93C5FD"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 1, 0] }} // Fade in at end of cycle
                    transition={{
                        duration: 2, // Total cycle matched to stroke
                        repeat: Infinity,
                        repeatDelay: 0,
                        times: [0, 0.7, 0.85, 1], // Flash near end
                    }}
                    className="drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]"
                />
            </svg>
        </div>
    );
};

export default AnimatedDiamond;
