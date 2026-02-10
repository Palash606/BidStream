import React, {createContext, useContext, useState, useEffect} from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{isDark, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export const getProfileColor = (username) => {
    if (!username) return '#3B82F6';
    const firstChar = username.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);

    const palette = [
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
        '#06B6D4', '#84CC16', '#F97316', '#0EA5E9', '#D946EF', '#F43F5E', '#14B8A6',
        '#64748B', '#BE185D', '#4338CA', '#15803D', '#B45309', '#0369A1', '#701A75',
        '#4D7C0F', '#0F766E', '#7C2D12', '#4C1D95', '#1E293B'
    ];

    const index = Math.max(0, Math.min(25, charCode - 65));
    return palette[index];
};