import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../stores';

/**
 * Modern, Lightweight Theme Toggle Switch
 * Provides fluid micro-animations with Framer Motion spring physics.
 * Adheres to modern design standards (Linear, Raycast, Vercel).
 *
 * @param {string} variant - 'switch' (default pill toggle) | 'compact' (single circular button)
 * @param {string} className - Additional CSS classes
 */
const ThemeToggle = ({ variant = 'switch', className = '' }) => {
    const isDark = useUIStore((state) => state.isDark);
    const toggleTheme = useUIStore((state) => state.toggleTheme);

    if (variant === 'compact') {
        return (
            <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className={`relative p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                    isDark
                        ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
                        : 'bg-white/90 border-slate-200 shadow-sm text-indigo-600 hover:bg-slate-100 hover:text-indigo-700'
                } ${className}`}
            >
                <motion.div
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    {isDark ? <Moon size={16} className="fill-amber-400/20" /> : <Sun size={16} className="fill-amber-500/20 text-amber-500" />}
                </motion.div>
            </motion.button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`group relative flex items-center h-8 w-16 px-1 rounded-full cursor-pointer transition-all duration-300 border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isDark
                    ? 'bg-slate-900 border-slate-700/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                    : 'bg-slate-100 border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
            } ${className}`}
        >
            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
                <Sun size={12} className={`transition-opacity duration-200 ${isDark ? 'opacity-40 text-slate-500' : 'opacity-0'}`} />
                <Moon size={12} className={`transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-40 text-slate-400'}`} />
            </div>

            {/* Sliding Thumb */}
            <motion.div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 ${
                    isDark
                        ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-slate-950/50'
                        : 'bg-white text-amber-500 border border-slate-200/80 shadow-slate-400/20'
                }`}
                animate={{
                    x: isDark ? 32 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
            >
                <motion.div
                    key={isDark ? 'dark-icon' : 'light-icon'}
                    initial={{ rotate: isDark ? -180 : 180, scale: 0.6 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                >
                    {isDark ? (
                        <Moon size={13} className="fill-amber-300/30 text-amber-300" />
                    ) : (
                        <Sun size={13} className="fill-amber-500/30 text-amber-500" />
                    )}
                </motion.div>
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
