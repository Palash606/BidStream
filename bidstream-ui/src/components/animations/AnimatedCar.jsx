import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCar = () => {
    return (
        <div className="relative w-28 h-12 flex items-center justify-center overflow-hidden">
            <svg
                viewBox="0 0 140 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            >
                {/* Car Container - Moving Left to Right */}
                <motion.g
                    initial={{ x: -140 }}
                    animate={{ x: 140 }}
                    transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 0.1
                    }}
                >
                    {/* Car Group Flipped to Face RIGHT if path was Left-facing */}
                    <g transform="scale(-1, 1) translate(-140, 0)">
                        {/* Neon Supercar Outline (McLaren P1 Style) */}
                        {/* Original Path was detected as facing Left. Flipping it. */}
                        <path
                            d="M125 32 Q135 34 138 38 L135 42 H115 Q110 42 108 38 Q105 32 100 32 H40 Q35 32 32 38 Q30 42 25 42 H5 L2 35 Q5 25 15 22 L35 18 Q50 8 70 8 H90 Q110 10 125 25 Z"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="filter drop-shadow-[0_0_5px_#60A5FA]"
                        />

                        {/* Roof/Cockpit Line */}
                        <path d="M35 18 Q50 8 70 8 H90 Q105 10 115 22" stroke="#3B82F6" strokeWidth="1.5" fill="none" />

                        {/* Side Air Intake / Door Sculpting */}
                        <path d="M45 25 Q60 25 70 32 H95" stroke="#3B82F6" strokeWidth="1.5" />

                        {/* Wheels - Glowing Neon Circles */}
                        <circle cx="28" cy="38" r="8" stroke="#60A5FA" strokeWidth="2" fill="none" />
                        <circle cx="112" cy="38" r="8" stroke="#60A5FA" strokeWidth="2" fill="none" />

                        {/* Wheel Spokes/Motion Blur */}
                        <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }} style={{ originX: "28px", originY: "38px" }}>
                            <path d="M28 30 V46 M20 38 H36" stroke="#3B82F6" strokeWidth="1" opacity="0.7" />
                        </motion.g>
                        <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }} style={{ originX: "112px", originY: "38px" }}>
                            <path d="M112 30 V46 M104 38 H120" stroke="#3B82F6" strokeWidth="1" opacity="0.7" />
                        </motion.g>
                    </g>

                </motion.g>

                {/* Speed Lines / Neon Streaks - Enhanced */}
                <motion.path
                    d="M140 45 H110 M140 20 H120 M140 10 H130"
                    stroke="#93C5FD"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{ x: [-50, -150], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
    );
};

export default AnimatedCar;
