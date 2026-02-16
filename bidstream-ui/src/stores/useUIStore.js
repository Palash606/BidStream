import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * UI Store
 * HARD-SWITCH Theme Engine (GeeksforGeeks Style)
 * Uses .dark class on html element for instant, total UI control
 */
export const useUIStore = create(
    persist(
        (set, get) => ({
            // State
            isDark: false,
            isOnboardingModalOpen: false,
            sidebarCollapsed: false,

            /**
             * HARD-SWITCH Theme Toggle (GeeksforGeeks Style)
             * Adds/removes .dark class on <html> for instant 100% UI repaint
             */
            toggleTheme: () => {
                const { isDark } = get();
                const newTheme = !isDark;

                const root = window.document.documentElement;

                // HARD-SWITCH: Add/remove .dark class (GeeksforGeeks style)
                if (newTheme) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                }

                set({ isDark: newTheme });
            },

            /**
             * Set theme explicitly with HARD-SWITCH
             * @param {boolean} dark - true for dark mode, false for light
             */
            setTheme: (dark) => {
                const root = window.document.documentElement;

                // HARD-SWITCH: Add/remove .dark class
                if (dark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                }

                set({ isDark: dark });
            },

            /**
             * Get role-based theme color
             * @param {string} activeRole - 'ROLE_SELLER' or 'ROLE_BIDDER'
             * @returns {object} Color configuration for the role
             */
            getRoleTheme: (activeRole) => {
                if (activeRole === 'ROLE_SELLER') {
                    return {
                        primary: 'indigo',
                        accent: '#6366F1', // Indigo-500
                        gradient: 'from-indigo-600 to-slate-700',
                        textClass: 'text-indigo-600 dark:text-indigo-400'
                    };
                } else {
                    return {
                        primary: 'blue',
                        accent: '#3B82F6', // Blue-500
                        gradient: 'from-blue-600 to-cyan-500',
                        textClass: 'text-blue-600 dark:text-blue-400'
                    };
                }
            },

            /**
             * Open onboarding modal
             */
            openOnboardingModal: () => set({ isOnboardingModalOpen: true }),

            /**
             * Close onboarding modal
             */
            closeOnboardingModal: () => set({ isOnboardingModalOpen: false }),

            /**
             * Toggle sidebar collapse state
             */
            toggleSidebar: () => {
                const { sidebarCollapsed } = get();
                set({ sidebarCollapsed: !sidebarCollapsed });
            },

            /**
             * Set sidebar state explicitly
             * @param {boolean} collapsed
             */
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isDark: state.isDark,
                sidebarCollapsed: state.sidebarCollapsed
            }),
            onRehydrateStorage: () => (state) => {
                // HARD-SWITCH: Apply .dark class on hydration (page load)
                const root = window.document.documentElement;

                if (state?.isDark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                }
            }
        }
    )
);

/**
 * Get profile color based on username (migrated from ThemeContext)
 * @param {string} username
 * @returns {string} Hex color code
 */
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
