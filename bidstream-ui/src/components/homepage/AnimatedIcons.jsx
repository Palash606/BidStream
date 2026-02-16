import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Gem, Sparkles, Car } from 'lucide-react';

/**
 * Animated Section Icons - Gorgeous, smooth animations for product row headers
 */

// Trending Now - Animated Fire with Pulse
export const FireIcon = () => (
    <motion.div
        className="relative inline-block"
        animate={{
            scale: [1, 1.05, 1],
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        <Flame
            size={28}
            className="text-blue-500 dark:text-blue-400 drop-shadow-lg"
            fill="currentColor"
        />
        <motion.div
            className="absolute inset-0"
            animate={{
                opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <Flame
                size={28}
                className="text-orange-400 dark:text-orange-300"
                fill="currentColor"
            />
        </motion.div>
    </motion.div>
);

// Ending Soon - Rotating Clock
export const ClockIcon = () => (
    <div className="relative inline-block">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
            <Clock
                size={28}
                className="text-orange-500 dark:text-orange-400 drop-shadow-lg"
            />
        </motion.div>
        <motion.div
            className="absolute inset-0 bg-orange-400 dark:bg-orange-300 rounded-full opacity-20"
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0, 0.2]
            }}
            transition={{
                duration: 2,
                repeat: Infinity
            }}
        />
    </div>
);

// High Value - Shining Diamond
export const DiamondIcon = () => (
    <div className="relative inline-block">
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <Gem
                size={28}
                className="text-purple-600 dark:text-purple-400 drop-shadow-lg"
                fill="currentColor"
            />
        </motion.div>
        {/* Shining effect */}
        <motion.div
            className="absolute top-0 left-0 w-full h-full overflow-hidden"
            initial={{ x: -100 }}
            animate={{ x: 100 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 w-8 h-full skew-x-12" />
        </motion.div>
    </div>
);

// New Listing - Sparkling Stars
export const SparkleIcon = () => (
    <div className="relative inline-block">
        <motion.div
            animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.15, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <Sparkles
                size={28}
                className="text-yellow-500 dark:text-yellow-400 drop-shadow-lg"
                fill="currentColor"
            />
        </motion.div>
        {/* Multiple sparkle particles */}
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
                animate={{
                    x: [0, Math.cos(i * 120 * Math.PI / 180) * 20],
                    y: [0, Math.sin(i * 120 * Math.PI / 180) * 20],
                    opacity: [1, 0],
                    scale: [1, 0]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                }}
            />
        ))}
    </div>
);

// Luxury Cars - Racing Car
export const RacingCarIcon = () => (
    <div className="relative inline-block overflow-visible">
        <motion.div
            animate={{
                x: [-3, 3, -3]
            }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <Car
                size={28}
                className="text-red-600 dark:text-red-500 drop-shadow-lg"
                fill="currentColor"
            />
        </motion.div>
        {/* Speed lines */}
        <motion.div
            className="absolute top-1/2 -left-4 flex gap-1"
            animate={{
                x: [0, -10],
                opacity: [0.6, 0]
            }}
            transition={{
                duration: 0.5,
                repeat: Infinity
            }}
        >
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-0.5 bg-red-400 rounded-full" />
            ))}
        </motion.div>
    </div>
);
