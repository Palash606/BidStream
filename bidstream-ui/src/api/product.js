import api from './axios';

const API_URL = '/api/products';

export const productAPI = {
    /**
     * Add a new product (multipart/form-data)
     */
    addProduct: async (productData, imageFiles) => {
        try {
            const formData = new FormData();

            // Append product request as a JSON blob
            formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

            // Append images
            if (imageFiles && imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });
            }

            const response = await api.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get seller products
     */
    getSellerProducts: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.status && filters.status !== 'All') params.append('status', filters.status);

            const response = await api.get(`${API_URL}/seller?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update product status
     */
    updateStatus: async (productId, status) => {
        try {
            const response = await api.patch(`${API_URL}/${productId}/status?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete product
     */
    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`${API_URL}/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get a single product by ID
     */
    getProduct: async (productId) => {
        try {
            const response = await api.get(`${API_URL}/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update an existing product
     */
    updateProduct: async (productId, productData, imageFiles) => {
        try {
            const formData = new FormData();
            formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
            
            if (imageFiles && imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });
            }

            const response = await api.put(`${API_URL}/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get discovery data (recommended, ending soon, live)
     */
    getDiscoveryData: async () => {
        try {
            const response = await api.get(`${API_URL}/discovery`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Search products
     */
    search: async (query, categoryId = null, signal = null) => {
        try {
            let url = `${API_URL}/search?q=${query}`;
            if (categoryId) url += `&categoryId=${categoryId}`;
            const response = await api.get(url, { signal });
            return response.data;
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                return null;
            }
            throw error.response?.data || error;
        }
    },

    /**
     * Place a bid on a product with distributed idempotency protection
     */
    placeBid: async (productId, amount, idempotencyKey) => {
        try {
            const key = idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);
            const headers = key ? { 'X-Idempotency-Key': key } : {};
            const response = await api.post('/api/bids/place', null, {
                params: { productId, amount },
                headers
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get bid history for a product
     */
    getBidHistory: async (productId) => {
        try {
            const response = await api.get(`/api/bids/history/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get seller dynamic analytics (GMV, platform cut, net earnings, bid velocity, category breakdown)
     */
    getSellerAnalytics: async (period = 'WEEK') => {
        try {
            const response = await api.get(`${API_URL}/seller/analytics`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Process mock card payment settlement
     */
    processMockPayment: async (paymentData) => {
        try {
            const response = await api.post('/api/payments/mock-charge', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
