import { create } from 'zustand';

/**
 * Inventory Store (Seller-specific)
 * Manages seller's lot inventory, revenue analytics, and payout tracking
 */
export const useInventoryStore = create((set, get) => ({
    // State
    lots: {
        active: [],
        sold: [],
        drafts: [],
        archived: []
    },
    revenueData: {
        total: 0,
        pending: 0,
        completed: 0,
        chartData: [] // For revenue analytics charts
    },
    payouts: [],
    isLoading: false,

    /**
     * Set lots by status
     * @param {string} status - 'active', 'sold', 'drafts', 'archived'
     * @param {array} lots - Array of lot objects
     */
    setLots: (status, lots) => {
        set((state) => ({
            lots: {
                ...state.lots,
                [status]: lots
            }
        }));
    },

    /**
     * Add a lot to a specific category
     * @param {string} status - Category name
     * @param {object} lot - Lot object
     */
    addLot: (status, lot) => {
        set((state) => ({
            lots: {
                ...state.lots,
                [status]: [...state.lots[status], lot]
            }
        }));
    },

    /**
     * Move lot from one status to another (e.g., draft -> active)
     * @param {string|number} lotId
     * @param {string} fromStatus
     * @param {string} toStatus
     */
    moveLot: (lotId, fromStatus, toStatus) => {
        set((state) => {
            const lot = state.lots[fromStatus].find(l => l.id === lotId);
            if (!lot) return state;

            return {
                lots: {
                    ...state.lots,
                    [fromStatus]: state.lots[fromStatus].filter(l => l.id !== lotId),
                    [toStatus]: [...state.lots[toStatus], { ...lot, status: toStatus.toUpperCase() }]
                }
            };
        });
    },

    /**
     * Update revenue data
     * @param {object} data - { total, pending, completed, chartData }
     */
    setRevenueData: (data) => {
        set({ revenueData: data });
    },

    /**
     * Set payouts
     * @param {array} payouts - Array of payout objects
     */
    setPayouts: (payouts) => set({ payouts }),

    /**
     * Get total active lots count
     * @returns {number}
     */
    getActiveLotCount: () => {
        const { lots } = get();
        return lots.active.length;
    },

    /**
     * Get total sold lots count
     * @returns {number}
     */
    getSoldLotCount: () => {
        const { lots } = get();
        return lots.sold.length;
    },

    /**
     * Clear all inventory data (on logout)
     */
    clearInventory: () => {
        set({
            lots: {
                active: [],
                sold: [],
                drafts: [],
                archived: []
            },
            revenueData: {
                total: 0,
                pending: 0,
                completed: 0,
                chartData: []
            },
            payouts: []
        });
    },

    /**
     * Set loading state
     * @param {boolean} loading
     */
    setLoading: (loading) => set({ isLoading: loading })
}));
