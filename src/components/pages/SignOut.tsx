import { useEffect } from "react"
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../utils/hooks/useAuth";

export function SignOut() {
    const { logout } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await logout();
            navigate('/');
        })();
    }, []);
    return (
        <p>Sedang mengkeluarkan akun Anda. Mohon tunggu sebentar...</p>
    )
}
