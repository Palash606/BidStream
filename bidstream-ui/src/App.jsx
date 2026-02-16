import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from './stores';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SellerDashboard from "./components/dashboard/SellerDashboard";
import BidderDashboard from "./components/dashboard/BidderDashboard";
import OnboardingModal from "./components/onboarding/OnboardingModal";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

/**
 * Dashboard Router - Conditionally renders Seller or Bidder dashboard
 * based on user's active role
 */
const DashboardRouter = () => {
    const user = useAuthStore((state) => state.user);
    const isOnboardingPending = useAuthStore((state) => state.isOnboardingPending());

    // Prevent access to dashboard content if role isn't chosen yet
    if (isOnboardingPending) return null;

    return (
        <DashboardLayout>
            {user?.activeRole === 'ROLE_SELLER' ? <SellerDashboard /> : <BidderDashboard />}
        </DashboardLayout>
    );
};

/**
 * Main application content with routing and onboarding logic
 */
const MainContent = () => {
    const user = useAuthStore((state) => state.user);
    const isOnboardingPending = useAuthStore((state) => state.isOnboardingPending());
    const isDark = useUIStore((state) => state.isDark);
    const navigate = useNavigate();

    // Apply theme to DOM on mount and when it changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    const handleFinishOnboarding = () => {
        // Once done, move them to their new dashboard
        navigate('/dashboard');
    };

    return (
        <>
            <div className={`transition-all duration-700 ${isOnboardingPending ? 'blur-md pointer-events-none scale-95' : ''}`}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-otp" element={<VerifyOtpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
                    <Route path="/product/:id"
                        element={<div className="p-20 text-center font-black">Lot Details</div>} />
                </Routes>
            </div>

            {/* Onboarding modal is rendered at the root level */}
            {isOnboardingPending && <OnboardingModal isOpen={true} onClose={handleFinishOnboarding} />}
        </>
    );
}

/**
 * App component - Entry point with Router setup
 * No longer needs Context providers - Zustand manages state globally
 */
function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <MainContent />
        </Router>
    );
}

export default App;