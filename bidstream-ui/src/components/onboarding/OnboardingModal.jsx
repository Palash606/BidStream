import React, {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {authService} from '../../api/authService';
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

const OnboardingModal = () => {
    const {user, setUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRoleSelection = async (role) => {
        setLoading(true);
        try {
            const response = await authService.updateRole(role);
            // Assuming the backend returns the updated user object
            setUser(response.data);
            toast.success(`Role updated to ${role}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to update role. Please try again.');
            console.error('Role update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Welcome, {user?.username}!</h2>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-8">To get started, please select your primary role.</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => handleRoleSelection('SELLER')}
                        disabled={loading}
                        className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        I'm a Seller
                    </button>
                    <button
                        onClick={() => handleRoleSelection('BIDDER')}
                        disabled={loading}
                        className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                    >
                        I'm a Bidder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;