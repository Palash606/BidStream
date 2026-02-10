import React from 'react';

export const BidStreamLogo = ({className = ""}) => (
    <div className={`flex items-center gap-1 cursor-pointer select-none ${className}`}>
        <span className="text-2xl font-black tracking-tighter italic text-slate-900 dark:text-white transition-colors">
            Bid<span className="text-blue-600">Stream</span>
        </span>
    </div>
);

export const BidStreamLogoWithText = BidStreamLogo;