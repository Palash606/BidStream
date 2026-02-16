import { create } from 'zustand';

/**
 * Auction Store
 * Manages real-time auction data synchronized via WebSocket
 */
export const useAuctionStore = create((set, get) => ({
    // State
    lots: {}, // Map of lotId -> lot data
    isConnected: false,
    serverTimeOffset: 0, // Difference between server and client time
    lastSyncTime: null,

    /**
     * Update or add a lot
     * @param {object} lot - Lot data from WebSocket or API
     */
    updateLot: (lot) => {
        set((state) => ({
            lots: {
                ...state.lots,
                [lot.id]: {
                    ...state.lots[lot.id],
                    ...lot,
                    lastUpdated: Date.now()
                }
            }
        }));
    },

    /**
     * Update multiple lots at once
     * @param {array} lotArray - Array of lot objects
     */
    updateLots: (lotArray) => {
        const lotsMap = {};
        lotArray.forEach(lot => {
            lotsMap[lot.id] = {
                ...lot,
                lastUpdated: Date.now()
            };
        });

        set((state) => ({
            lots: {
                ...state.lots,
                ...lotsMap
            }
        }));
    },

    /**
     * Get a specific lot by ID
     * @param {string|number} lotId
     * @returns {object|null}
     */
    getLot: (lotId) => {
        const { lots } = get();
        return lots[lotId] || null;
    },

    /**
     * Remove lot from store (auction ended)
     * @param {string|number} lotId
     */
    removeLot: (lotId) => {
        set((state) => {
            const { [lotId]: removed, ...remaining } = state.lots;
            return { lots: remaining };
        });
    },

    /**
     * Sync master clock with server
     * @param {number} serverTime - Timestamp from server
     */
    syncClock: (serverTime) => {
        const clientTime = Date.now();
        const offset = serverTime - clientTime;

        set({
            serverTimeOffset: offset,
            lastSyncTime: clientTime
        });
    },

    /**
     * Get current server time (adjusted for offset)
     * @returns {number} Timestamp
     */
    getServerTime: () => {
        const { serverTimeOffset } = get();
        return Date.now() + serverTimeOffset;
    },

    /**
     * Set WebSocket connection status
     * @param {boolean} connected
     */
    setConnectionStatus: (connected) => set({ isConnected: connected }),

    /**
     * Clear all lots (on logout or reconnect)
     */
    clearLots: () => set({ lots: {} }),

    /**
     * Get active lots (auction not ended)
     * @returns {array} Array of active lot objects
     */
    getActiveLots: () => {
        const { lots } = get();
        const now = get().getServerTime();

        return Object.values(lots).filter(lot => {
            return lot.auctionEndTime > now && lot.status === 'ACTIVE';
        });
    },

    /**
     * Get lots ending soon (within next hour)
     * @returns {array} Array of lot objects sorted by end time
     */
    getLotsEndingSoon: () => {
        const { lots } = get();
        const now = get().getServerTime();
        const oneHourFromNow = now + (60 * 60 * 1000);

        return Object.values(lots)
            .filter(lot => {
                return lot.auctionEndTime > now &&
                    lot.auctionEndTime <= oneHourFromNow &&
                    lot.status === 'ACTIVE';
            })
            .sort((a, b) => a.auctionEndTime - b.auctionEndTime);
    },

    /**
     * Get hot lots (high bidding velocity)
     * @returns {array} Array of trending lot objects
     */
    getHotLots: () => {
        const { lots } = get();

        return Object.values(lots)
            .filter(lot => lot.bidVelocity > 5) // More than 5 bids in last 10 mins
            .sort((a, b) => b.bidVelocity - a.bidVelocity)
            .slice(0, 10);
    }
}));
