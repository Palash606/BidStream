import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, id, type = "text", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="w-full relative">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-bidstream-dark mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    ref={ref}
                    id={id}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={`
            flex h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all duration-200
            placeholder:text-gray-400 
            group-hover:border-gray-300
            focus:border-bidstream-blue focus:ring-4 focus:ring-bidstream-blue/10
            ${error ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200'}
          `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bidstream-blue transition-colors p-1"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {/* Error Message with Slide-down Animation */}
            <div className="min-h-[20px] mt-1 ml-1">
                {error && (
                    <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
});

Input.displayName = "Input";
export default Input;