import React from 'react';
import {BidStreamLogo} from "../components/ui/Logo"; // Use the fixed name

const AuthLayout = ({children, title, subtitle}) => {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Branding */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-bidstream-dark items-center justify-center p-12 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-bidstream-blue)_0%,_transparent_50%)]"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <BidStreamLogo className="mb-8 h-16"/> {/* Updated here */}
                    <h2 className="text-4xl font-bold mb-4">Where Value Meets Velocity.</h2>
                    <p className="text-lg text-gray-300">
                        Join the world's most premium real-time auction platform. Secure, fast, and exclusive.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="lg:hidden flex justify-center mb-6">
                        <BidStreamLogo className="h-10"/>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-bidstream-dark tracking-tight">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
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