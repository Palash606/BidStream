import React, { useState } from 'react';
import { useAuthStore } from '../../stores';
import { authService } from '../../api/authService';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { UserCircle, Store, Gavel } from 'lucide-react';

/**
 * OnboardingModal - Role selection for first-time users
 * Migrated to Zustand from Context API
 */
const OnboardingModal = () => {
    const user = useAuthStore((state) => state.user);
    const updateUserRole = useAuthStore((state) => state.updateUserRole);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRoleSelection = async (role) => {
        setLoading(true);
        try {
            const response = await authService.updateRole(role);

            // Update Zustand store with new role
            updateUserRole(role);

            toast.success(`Welcome as a ${role === 'ROLE_SELLER' ? 'Seller' : 'Bidder'}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to update role. Please try again.');
            console.error('Role update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <UserCircle className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome to BidStream!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Choose your role to get started
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Seller Card */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRoleSelection('ROLE_SELLER')}
                        disabled={loading}
                        className="group relative p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Store className="w-12 h-12 mx-auto mb-3" />
                        <h3 className="text-xl font-bold">Seller</h3>
                        <p className="text-sm text-indigo-100 mt-2">
                            List and sell your items
                        </p>
                    </motion.button>

                    {/* Bidder Card */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRoleSelection('ROLE_BIDDER')}
                        disabled={loading}
                        className="group relative p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Gavel className="w-12 h-12 mx-auto mb-3" />
                        <h3 className="text-xl font-bold">Bidder</h3>
                        <p className="text-sm text-blue-100 mt-2">
                            Discover and bid on items
                        </p>
                    </motion.button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mt-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Setting up your account...</p>
                    </div>
                )}

                {/* Info Text */}
                <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    💡 You can switch roles anytime from your dashboard
                </p>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;