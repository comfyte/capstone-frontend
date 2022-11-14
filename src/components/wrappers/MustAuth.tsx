import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/hooks/useAuth';

export function MustAuth({ children }: PropsWithChildren) {
    const { data } = useAuth();

    if (!data?.isAuthenticated) {
        return <Navigate to='/' />;
    }

    return children;
}
