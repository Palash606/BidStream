// src/components/dashboard/LiveTimer.jsx
import React, {useState, useEffect} from 'react';

export const LiveTimer = ({initialSeconds}) => {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) return;
        const timerId = setInterval(() => setSeconds(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [seconds]);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    };

    return (
        <p className={`text-lg font-mono font-bold ${seconds < 300 ? 'text-red-500 animate-pulse' : 'text-bidstream-dark'}`}>
            {seconds > 0 ? formatTime(seconds) : "SOLD"}
        </p>
    );
};