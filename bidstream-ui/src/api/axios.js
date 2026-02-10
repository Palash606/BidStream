import axios from 'axios';

// The Base URL points to your API Gateway (likely 8080)
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Accept': 'application/json, text/plain, */*',
    }
});

// Interceptor to add the Access Token to every outgoing request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized and Refresh Token logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If backend returns 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Call the identity-service refresh endpoint directly
                const response = await axios.post('http://localhost:8081/auth/refresh-token', {}, {
                    headers: {Authorization: `Bearer ${refreshToken}`}
                });

                if (response.status === 200) {
                    const {accessToken, refreshToken: newRefreshToken} = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear storage and send to login
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;