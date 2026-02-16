import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';

/**
 * ProtectedRoute - Redirects to login if user is not authenticated
 * Uses Zustand store instead of Context API
 */
const ProtectedRoute = ({ children }) => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        // Redirect them to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;