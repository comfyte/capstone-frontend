import { FormEvent, HTMLInputTypeAttribute, InputHTMLAttributes, PropsWithChildren, ReactNode, useState } from "react";
import { useAuth } from "../../utils/hooks/useAuth";
import { FormInputGroup } from "../FormInputGroup";


export function SignIn() {
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');

    const { login } = useAuth();

    const onFormSubmit = (ev: FormEvent) => {
        ev.preventDefault();
        login(usernameVal, passwordVal);
    }

    return (
        <>
            <h1>Silakan masuk terlebih dahulu</h1>
            <form onSubmit={onFormSubmit}>
                <FormInputGroup
                    id='username'
                    autoComplete='username'
                    label='Username/email?'
                    value={usernameVal}
                    onChange={(ev) => {setUsernameVal(ev.target.value)}}
                />
                <FormInputGroup
                    id='password'
                    type='password'
                    autoComplete='current-password'
                    label='Kata sandi'
                    value={passwordVal}
                    onChange={(ev) => {setPasswordVal(ev.target.value)}}
                />
                <button type='submit' className='button'>Masuk</button>
            </form>
        </>
    );
}
