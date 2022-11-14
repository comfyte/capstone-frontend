import { useEffect } from "react"
import { useNavigate } from "react-router-dom";

import Constants from '../../utils/constants.json';
import { useAuth } from "../../utils/hooks/useAuth";

export function SignOut() {
    const { logout } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        // (async () => {
        //     const response = await fetch(Constants.BACKEND_BASE_URL + '/logout', {
        //         method: 'POST'
        //     });

        //     if (!response.ok) {
        //         window.alert('Proses sign-out gagal!');
        //         return;
        //     }

        //     navigate('/');
        // })();
        (async () => {
            await logout();
            navigate('/');
        })();
    }, []);
    return (
        <p>Sedang mengkeluarkan akun Anda. Mohon tunggu sebentar...</p>
    )
}
