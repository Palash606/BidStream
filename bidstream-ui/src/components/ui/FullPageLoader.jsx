import React from 'react';
import { motion } from 'framer-motion';

const FullPageLoader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white fixed inset-0 z-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full mb-6"
            />
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
                className="text-slate-400 font-medium tracking-wide"
            >
                {message}
            </motion.p>
        </div>
    );
};

export default FullPageLoader;
