import { FormEvent, useState } from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import reportWebVitals from "../../utils/reportWebVitals";
import { FormInputGroup } from "../FormInputGroup";

import Constants from '../../utils/constants.json';

export function SignUp() {
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [repeatPasswordVal, setRepeatPasswordVal] = useState('');

    const { login } = useAuth();

    console.log(usernameVal);

    const onFormSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        (async () => {
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
                return;
            }

            login(usernameVal, passwordVal);
        })();
    }

    return (
        <>
            <h1>Daftarkan diri Anda terlebih dahulu</h1>
            <form onSubmit={onFormSubmit}>
                <FormInputGroup
                    id='username'
                    autoComplete='username'
                    label='Uswername'
                    value={usernameVal}
                    onChange={(ev) => { setUsernameVal(ev.target.value) }}
                />
                <FormInputGroup
                    id='password'
                    autoComplete='new-password'
                    label='Password'
                    value={passwordVal}
                    onChange={(ev) => { setPasswordVal(ev.target.value) }}
                />
                <FormInputGroup
                    id='passwordRepeat'
                    autoComplete='new-password'
                    label='Ulangi pemasukan password Anda'
                    value={repeatPasswordVal}
                    onChange={(ev) => { setRepeatPasswordVal(ev.target.value) }}
                />
                <button type='submit' className='button'>Daftar</button>
            </form>
        </>
    );
}