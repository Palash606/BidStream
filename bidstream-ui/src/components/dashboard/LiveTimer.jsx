// src/components/dashboard/LiveTimer.jsx
import React, { useState, useEffect } from 'react';

const LiveTimer = ({ endTime, initialSeconds, className = "" }) => {
    // Helper to calculate seconds remaining from a future date string
    const calculateSeconds = () => {
        if (initialSeconds) return initialSeconds;
        if (endTime) {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            return diff;
        }
        return 0;
    };

    const [seconds, setSeconds] = useState(calculateSeconds());

    useEffect(() => {
        // Recalculate if props change
        setSeconds(calculateSeconds());
    }, [endTime, initialSeconds]);

    useEffect(() => {
        if (seconds <= 0) return;
        const timerId = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 0) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [seconds]);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        // Pad with zeros for fixed width look if needed, or keep compact
        const pad = (n) => n.toString().padStart(2, '0');
        return `${h}h ${pad(m)}m ${pad(sec)}s`;
    };

    return (
        <span className={`${className} ${seconds < 300 ? 'text-red-500 animate-pulse' : ''} font-mono`}>
            {seconds > 0 ? formatTime(seconds) : "SOLD"}
        </span>
    );
};

export default LiveTimer;