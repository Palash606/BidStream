import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import SellerVerification from "./components/dashboard/SellerVerification";
import AddProductPage from "./pages/AddProductPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProductsPage from "./components/dashboard/seller/ProductsPage";
import AnalyticsPage from "./components/dashboard/seller/AnalyticsPage";
import OrdersPage from "./components/dashboard/seller/OrdersPage";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

/**
 * Dashboard Router - Generic dashboard redirect based on role
 */
const DashboardRouter = () => {
    const user = useAuthStore((state) => state.user);
    if (user?.activeRole === 'SELLER' || user?.activeRole === 'ROLE_SELLER') {
        return <Navigate to="/seller" replace />;
    }
    return <Navigate to="/" replace />;
};

/**
 * Main application content with STRICT onboarding logic
 */
const MainContent = () => {
    const isOnboardingPending = useAuthStore((state) => state.isOnboardingPending());
    const isDark = useUIStore((state) => state.isDark);
    const user = useAuthStore((state) => state.user);
    const location = useLocation();

    // Apply theme to DOM on mount and when it changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    // THE GATEKEEPER logic
    // If onboarding is pending, and they are not on /onboarding (and not on public auth pages), redirect them
    const publicRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
    if (isOnboardingPending && !publicRoutes.includes(location.pathname) && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <Routes>
            {/* Public / Generic Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* The Strict Onboarding Route */}
            <Route path="/onboarding" element={
                <ProtectedRoute>
                    {isOnboardingPending ? <OnboardingPage /> : <DashboardRouter />}
                </ProtectedRoute>
            } />

            {/* Seller Experience */}
            <Route path="/seller" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <SellerDashboard />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/seller/verify" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <SellerVerification />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/products" element={
                <ProtectedRoute>
                    {user?.isVerifiedSeller ? (
                        <DashboardLayout fullWidth>
                            <ProductsPage />
                        </DashboardLayout>
                    ) : <Navigate to="/seller" replace />}
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute>
                    {user?.isVerifiedSeller ? (
                        <DashboardLayout fullWidth>
                            <AnalyticsPage />
                        </DashboardLayout>
                    ) : <Navigate to="/seller" replace />}
                </ProtectedRoute>
            } />
            <Route path="/orders" element={
                <ProtectedRoute>
                    {user?.isVerifiedSeller ? (
                        <DashboardLayout fullWidth>
                            <OrdersPage />
                        </DashboardLayout>
                    ) : <Navigate to="/seller" replace />}
                </ProtectedRoute>
            } />
            <Route path="/product/add" element={
                <ProtectedRoute>
                    {user?.isVerifiedSeller ? <AddProductPage /> : <Navigate to="/seller" replace />}
                </ProtectedRoute>
            } />

            {/* Bidder Experience (Maps to / for now as requested) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/bidder" element={<Navigate to="/" replace />} />

            {/* Generic Dashboard Redirect */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/**
 * App component - Entry point with Router setup
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