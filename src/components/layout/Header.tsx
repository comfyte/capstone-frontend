import { Link } from "react-router-dom";
import { useAuth } from "../../utils/hooks/useAuth";

export function Header() {
    const { data } = useAuth();
    console.log(data);

    return (
        <header className='flex justify-between mx-3 mb-4'>
            <div>
                <p>Portal Pemantauan</p>
            </div>
            <div>
                {!data ? 'Sedang memuat informasi akun...' : data.isAuthenticated ? (
                    <>
                        <p className='inline'>Anda sedang masuk sebagai <span className='font-bold mr-6'>{data.username}</span></p>
                        <Link to='/devices' className='hover:underline mr-6'>Perangkat Anda</Link>
                        <Link to='/sign-out' className='hover:underline'>Keluar</Link>
                    </>
                ) : (
                    <>
                        <Link to='/sign-up' className='hover:underline mr-6'>Daftar</Link>
                        <Link to='/' className='hover:underline'>Masuk</Link>
                    </>
                )}
            </div>
        </header>
    );
}