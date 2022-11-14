import { PropsWithChildren, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/hooks/useAuth';

export function MustAuth({ children }: { children: any }) {
    const { data } = useAuth();

    if (!data) {
        return 'Please wait while we\'re logging you in...';
    }

    if (!data.isAuthenticated) {
        return <Navigate to='/' />;
    }

    return children;
}
