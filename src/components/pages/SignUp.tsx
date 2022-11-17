import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import reportWebVitals from "../../utils/reportWebVitals";
import { FormInputGroup } from "../FormInputGroup";

import Constants from '../../utils/constants.json';

export function SignUp() {
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [repeatPasswordVal, setRepeatPasswordVal] = useState('');

    // const [doesPasswordMatch, setPasswordMatch]
    // const [isPasswordsSame]
    const [passwordMatchStatus, setPasswordMatchStatus] = useState(false);

    const [isLoading, setLoading] = useState(false);

    const { login } = useAuth();

    // Logic to check the similarity/sameness between the two password fields
    useEffect(() => {
        setPasswordMatchStatus(passwordVal !== '' && passwordVal === repeatPasswordVal);
    }, [passwordVal, repeatPasswordVal]);

    const onFormSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        (async () => {
            setLoading(true);

            const response = await fetch(Constants.BACKEND_BASE_URL + '/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: usernameVal,
                    password: passwordVal,
                    name: 'Tes nama pertama dulu ya'
                })
            });
            const result = await response.json();
            if (!response.ok) {
                window.alert(result.message);
                // ReadableStreamDefaultController;
                setLoading(false);
                return;
            }

            await login(usernameVal, passwordVal);

            setLoading(false);
        })();
    }

    return (
        <>
            <h1 className='mb-8 text-center w-fit mx-auto'>Registrasi akun</h1>
            <form onSubmit={onFormSubmit} className='max-w-md mx-auto'>
                <FormInputGroup
                    id='username'
                    autoComplete='username'
                    label='Username'
                    value={usernameVal}
                    onChange={(ev) => {setUsernameVal(ev.target.value)}}
                    disabled={isLoading}
                    required
                    type='text'
                    autoFocus
                />
                <FormInputGroup
                    id='password'
                    autoComplete='new-password'
                    label='Kata sandi'
                    value={passwordVal}
                    onChange={(ev) => {setPasswordVal(ev.target.value)}}
                    disabled={isLoading}
                    required
                    type='password'
                />
                <FormInputGroup
                    id='passwordRepeat'
                    autoComplete='new-password'
                    label='Ulangi kata sandi'
                    value={repeatPasswordVal}
                    onChange={(ev) => {setRepeatPasswordVal(ev.target.value)}}
                    disabled={isLoading}
                    required
                    type='password'
                />
                <button type='submit' className='button w-full mt-8' disabled={!passwordMatchStatus || isLoading}>
                    {!isLoading ? 'Daftar' : 'Sedang mendaftarkan Anda...'}
                </button>
            </form>
        </>
    );
}