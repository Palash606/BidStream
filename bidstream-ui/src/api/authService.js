import api from './axios';

export const authService = {
    // 1. Send OTP for Registration
    sendOtp: async (email) => {
        return await api.post(`/auth/send-otp?email=${email}`);
    },

    // 2. Register New User
    register: async (email, otp, registrationData) => {
        // Matches the @PostMapping("/register") in your AuthController
        return await api.post(`/auth/register?email=${email}&otp=${otp}`, registrationData);
    },

    initiateRegistration: async (email, registrationData) => {
        return await api.post(`/auth/initiate-registration?email=${email}`, registrationData);
    },

    // 3. Login
    login: async (email, password) => {
        // Triggers the 2FA flow in your RegistrationService
        return await api.post(`/auth/login?email=${email}&password=${password}`);
    },

    // 4. Final 2FA Verification
    verifyFinal: async (email, otp) => {
        // Matches verifyAndGenerateToken in your backend
        return await api.post(`/auth/verify-final?email=${email}&otp=${otp}`);
    },

    // 5. Check Username Availability
    checkUsername: async (username) => {
        return await api.get(`/auth/check-username?username=${username}&_t=${Date.now()}`);
    },
    verifySocialLogin: async (email, otp) => {
        // Matches verify-2fa endpoint in your AuthController
        return await api.post(`/auth/verify-2fa?email=${email}&otp=${otp}`);
    },

    forgotPassword: async (email) => {
        return await api.post(`/auth/forgot-password?email=${email}`);
    },

    resetPassword: async (token, newPassword) => {
        return await api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`);
    },

    switchRole: async (email, role, interests = []) => {
        const interestsParam = interests.length > 0 ? `&interests=${interests.join(',')}` : '';
        return await api.post(`/auth/switch-role?email=${email}&role=${role}${interestsParam}`);
    },

    updateRole: async (role) => {
        return await api.post('/user/update-role', { role });
    },

};