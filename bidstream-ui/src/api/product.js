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
    }
};
