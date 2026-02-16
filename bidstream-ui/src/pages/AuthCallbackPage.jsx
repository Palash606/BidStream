import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

const AuthCallbackPage = () => {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Prioritize the role passed directly in the navigation state
        const explicitRole = location.state?.role;

        if (explicitRole) {
            // If role is passed, make an immediate decision
            if (explicitRole === 'ROLE_SELECTION_PENDING') {
                navigate('/', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else if (user) {
            // Fallback to the user context if no state is passed
            if (user.role === 'ROLE_SELECTION_PENDING') {
                navigate('/', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
        // This effect runs when the component mounts and if the user context changes.
    }, [user, navigate, location.state]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-4">Finalizing session...</p>
        </div>
    );
};

export default AuthCallbackPage;