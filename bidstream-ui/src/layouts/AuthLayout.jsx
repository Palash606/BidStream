import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="flex min-h-screen w-full bg-slate-950 font-sans text-white">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-slate-950 items-center justify-center p-12 relative overflow-hidden border-r border-slate-800">

                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-blue-900)_0%,_transparent_40%)] opacity-40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-purple-900)_0%,_transparent_40%)] opacity-30"></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg text-center lg:text-left">
                    <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                        <div className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                            <span className="text-white">Stream</span>
                        </div>
                    </div>

                    <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight">
                        Where Value Meets <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Velocity.</span>
                    </h2>

                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                        Join the world's most premium real-time auction platform. Secure, fast, and exclusive.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                <div className="w-full max-w-md space-y-8 bg-slate-900/50 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bid</span>
                            <span className="text-white">Stream</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {title}
                        </h2>
                        <p className="mt-3 text-sm text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;