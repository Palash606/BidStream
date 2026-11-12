import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300 flex flex-col relative">
            {/* Top Navigation Bar with Theme Switcher at Top-Left */}
            <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    {/* Top-Left Theme Switcher */}
                    <ThemeToggle variant="switch" />
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} /> Back to BidStream
                    </Link>
                </div>

                <Link to="/" className="flex items-center gap-1">
                    <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                        <span className="text-slate-900 dark:text-white">Stream</span>
                    </span>
                </Link>
            </header>

            <div className="flex flex-1 w-full">
                {/* Left Side - Branding (Hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 bg-slate-100/70 dark:bg-slate-950 items-center justify-center p-12 relative overflow-hidden border-r border-slate-200 dark:border-slate-800">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-blue-900)_0%,_transparent_40%)] opacity-20 dark:opacity-40 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-purple-900)_0%,_transparent_40%)] opacity-15 dark:opacity-30 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 max-w-lg text-center lg:text-left">
                        <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                            <div className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                                <span className="text-slate-900 dark:text-white">Stream</span>
                            </div>
                        </div>

                        <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight text-slate-900 dark:text-white">
                            Where Value Meets <br />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Velocity.</span>
                        </h2>

                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Join the world's most premium real-time auction platform. Secure, fast, and exclusive.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form Container */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                    <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                                <span className="text-slate-900 dark:text-white">Stream</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
