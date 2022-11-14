import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/hooks/useAuth";

export function MustNotAuth({ children, to }: { children: any, to?: string }) {
    const { data } = useAuth();

    if (data?.isAuthenticated) {
        return <Navigate to={to ?? '/devices'} />;
    }

    return children;
}
