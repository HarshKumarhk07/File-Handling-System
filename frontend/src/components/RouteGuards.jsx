import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Skeleton from './SkeletonLoader';

export const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
    const { user } = useContext(AuthContext);

    // If user is authenticated, redirect to dashboard
    if (user && user.token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export const AdminRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;
    return (user && user.role === 'admin') ? <Outlet /> : <Navigate to="/" replace />;
};
