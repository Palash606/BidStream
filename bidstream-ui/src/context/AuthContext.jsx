import React, {createContext, useState, useContext, useCallback} from 'react';

const AuthContext = createContext(null);

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token:", e);
        return null;
    }
};

const getUserFromToken = (token) => {
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded) return null;
    
    return {
        isAuthenticated: true,
        role: decoded?.roles?.[0] || 'ROLE_SELECTION_PENDING',
        email: decoded?.sub,
        firstName: decoded?.firstName || decoded?.sub?.split('@')[0]
    };
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('accessToken');
        return getUserFromToken(token);
    });

    const login = useCallback((data) => {
        const token = data.accessToken || data.token;
        localStorage.setItem('accessToken', token);
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }
        setUser(getUserFromToken(token));
    }, []);
    
    const updateUserRole = (newRole) => {
        setUser(prev => ({...prev, role: newRole}));
    };

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{user, login, logout, updateUserRole}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);