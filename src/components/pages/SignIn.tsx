import { FormEvent, HTMLInputTypeAttribute, InputHTMLAttributes, PropsWithChildren, ReactNode, useState } from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import { FormInputGroup } from "../FormInputGroup";


export function SignIn() {
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');

    const [isLoading, setLoading] = useState(false);

    const { login } = useAuth();

    const onFormSubmit = (ev: FormEvent) => {
        ev.preventDefault();
        (async () => {
            setLoading(true);
            await login(usernameVal, passwordVal);
            setLoading(false);
        })();
    }

    return (
        <>
            <h1 className='mb-8 text-center w-fit mx-auto'>Selamat datang</h1>
            <form onSubmit={onFormSubmit} className='max-w-md mx-auto'>
                <FormInputGroup
                    id='username'
                    autoComplete='username'
                    label='Username'
                    value={usernameVal}
                    onChange={(ev) => {setUsernameVal(ev.target.value)}}
                    required
                    disabled={isLoading}
                    type='text'
                    autoFocus
                />
                <FormInputGroup
                    id='password'
                    type='password'
                    autoComplete='current-password'
                    label='Kata sandi'
                    value={passwordVal}
                    onChange={(ev) => {setPasswordVal(ev.target.value)}}
                    required
                    disabled={isLoading}
                    // className='mb-8'
                    // type='password'
                />
                <button type='submit' className='button w-full mt-8' disabled={isLoading}>{!isLoading ? 'Masuk' : 'Sedang masuk...'}</button>
            </form>
        </>
    );
}
