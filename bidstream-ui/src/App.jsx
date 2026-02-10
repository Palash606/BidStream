import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import {ThemeProvider} from './context/ThemeContext';
import {AuthProvider, useAuth} from './context/AuthContext';
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
import {Toaster} from 'react-hot-toast';

const DashboardRouter = () => {
    const {user} = useAuth();
    // Prevent access to dashboard content if role isn't chosen yet
    if (user?.role === 'ROLE_SELECTION_PENDING') return null;

    return (
        <DashboardLayout>
            {user?.role === 'SELLER' ? <SellerDashboard/> : <BidderDashboard/>}
        </DashboardLayout>
    );
};

const MainContent = () => {
    const {user, loading} = useAuth();
    const navigate = useNavigate();

    // Check if we need to lock the screen
    const isPending = !loading && user && user.role === 'ROLE_SELECTION_PENDING';

    const handleFinishOnboarding = () => {
        // Once done, move them to their new dashboard
        navigate('/dashboard');
    };

    return (
        <>
            <div className={`transition-all duration-700 ${isPending ? 'blur-md pointer-events-none scale-95' : ''}`}>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/verify-otp" element={<VerifyOtpPage/>}/>
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                    <Route path="/reset-password" element={<ResetPasswordPage/>}/>
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter/></ProtectedRoute>}/>
                    <Route path="/product/:id"
                           element={<div className="p-20 text-center font-black">Lot Details</div>}/>
                </Routes>
            </div>

            {/* Modal is rendered at the root level but inside the Router context */}
            {isPending && <OnboardingModal isOpen={true} onClose={handleFinishOnboarding}/>}
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Toaster position="top-right"/>
                    <MainContent/>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;