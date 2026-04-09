import api from './axios';

export const categoryAPI = {
    getCategories: async () => {
        try {
            const response = await api.get('/api/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
