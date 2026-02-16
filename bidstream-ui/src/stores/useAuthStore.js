import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Parse JWT token to extract user information
 * @param {string} token - JWT access token
 * @returns {object|null} Decoded payload or null if invalid
 */
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token:', e);
        return null;
    }
};

/**
 * Extract user object from JWT token
 * @param {string} token - JWT access token
 * @returns {object|null} User object with roles and activeRole
 */
const getUserFromToken = (token) => {
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded) return null;

    const roles = decoded?.roles || ['ROLE_SELECTION_PENDING'];
    
    return {
        isAuthenticated: true,
        email: decoded?.sub,
        firstName: decoded?.firstName || decoded?.sub?.split('@')[0],
        roles: roles, // Array of roles: ['ROLE_SELLER', 'ROLE_BIDDER']
        activeRole: roles[0], // Current active role
        userId: decoded?.userId || decoded?.sub
    };
};

/**
 * Authentication Store 
 * Manages user authentication state, JWT tokens, and dual-role support
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,

            /**
             * Initialize auth state from stored tokens
             */
            initialize: () => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const user = getUserFromToken(token);
                    set({
                        user,
                        accessToken: token,
                        refreshToken: localStorage.getItem('refreshToken')
                    });
                }
            },

            /**
             * Login action - stores tokens and sets user
             * @param {object} data - Login response with accessToken and refreshToken
             */
            login: (data) => {
                const token = data.accessToken || data.token;
                const refreshToken = data.refreshToken;

                localStorage.setItem('accessToken', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                const user = getUserFromToken(token);
                set({
                    user,
                    accessToken: token,
                    refreshToken,
                    isLoading: false
                });
            },

            /**
             * Logout action - clears all auth data
             */
            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null
                });
            },

            /**
             * Switch active role (Seller ↔ Bidder)
             * @param {string} newRole - 'ROLE_SELLER' or 'ROLE_BIDDER'
             */
            switchRole: (newRole) => {
                const { user } = get();
                if (!user || !user.roles.includes(newRole)) {
                    console.error('Cannot switch to role:', newRole);
                    return;
                }

                set({
                    user: {
                        ...user,
                        activeRole: newRole
                    }
                });
            },

            /**
             * Update user role after onboarding (ROLE_SELECTION_PENDING -> actual role)
             * @param {string} newRole - Selected role from onboarding
             */
            updateUserRole: (newRole) => {
                const { user } = get();
                if (!user) return;

                // If user is pending, set both roles and activeRole
                if (user.activeRole === 'ROLE_SELECTION_PENDING') {
                    set({
                        user: {
                            ...user,
                            roles: [newRole],
                            activeRole: newRole
                        }
                    });
                } else {
                    // Add new role if not already present
                    const roles = user.roles.includes(newRole) 
                        ? user.roles 
                        : [...user.roles, newRole];
                    
                    set({
                        user: {
                            ...user,
                            roles
                        }
                    });
                }
            },

            /**
             * Update user profile data (firstName, etc.)
             * @param {object} updates - User fields to update
             */
            updateUser: (updates) => {
                const { user } = get();
                if (!user) return;

                set({
                    user: {
                        ...user,
                        ...updates
                    }
                });
            },

            /**
             * Check if user has a specific role
             * @param {string} role - Role to check
             * @returns {boolean}
             */
            hasRole: (role) => {
                const { user } = get();
                return user?.roles?.includes(role) || false;
            },

            /**
             * Check if user is currently a seller
             * @returns {boolean}
             */
            isSeller: () => {
                const { user } = get();
                return user?.activeRole === 'ROLE_SELLER';
            },

            /**
             * Check if user is currently a bidder
             * @returns {boolean}
             */
            isBidder: () => {
                const { user } = get();
                return user?.activeRole === 'ROLE_BIDDER';
            },

            /**
             * Check if user needs to complete onboarding
             * @returns {boolean}
             */
            isOnboardingPending: () => {
                const { user } = get();
                return user?.activeRole === 'ROLE_SELECTION_PENDING';
            }
        }),
        {
            name: 'auth-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist user data, not tokens (tokens in separate localStorage keys)
                user: state.user
            })
        }
    )
);

// Initialize on app load
if (typeof window !== 'undefined') {
    useAuthStore.getState().initialize();
}
