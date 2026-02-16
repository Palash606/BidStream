import { create } from 'zustand';

/**
 * Watchlist Store (Bidder-specific)
 * Manages user's favorited/watched auction lots
 */
export const useWatchlistStore = create((set, get) => ({
    // State
    watchedLotIds: [],
    isLoading: false,

    /**
     * Add a lot to watchlist
     * @param {string|number} lotId
     */
    addToWatchlist: (lotId) => {
        set((state) => ({
            watchedLotIds: state.watchedLotIds.includes(lotId)
                ? state.watchedLotIds
                : [...state.watchedLotIds, lotId]
        }));
    },

    /**
     * Remove a lot from watchlist
     * @param {string|number} lotId
     */
    removeFromWatchlist: (lotId) => {
        set((state) => ({
            watchedLotIds: state.watchedLotIds.filter(id => id !== lotId)
        }));
    },

    /**
     * Toggle lot in/out of watchlist
     * @param {string|number} lotId
     */
    toggleWatchlist: (lotId) => {
        const { watchedLotIds } = get();
        if (watchedLotIds.includes(lotId)) {
            get().removeFromWatchlist(lotId);
        } else {
            get().addToWatchlist(lotId);
        }
    },

    /**
     * Check if lot is watched
     * @param {string|number} lotId
     * @returns {boolean}
     */
    isWatched: (lotId) => {
        const { watchedLotIds } = get();
        return watchedLotIds.includes(lotId);
    },

    /**
     * Set entire watchlist (on sync with backend)
     * @param {array} lotIds - Array of lot IDs
     */
    setWatchlist: (lotIds) => set({ watchedLotIds: lotIds }),

    /**
     * Clear watchlist
     */
    clearWatchlist: () => set({ watchedLotIds: [] }),

    /**
     * Set loading state
     * @param {boolean} loading
     */
    setLoading: (loading) => set({ isLoading: loading })
}));
