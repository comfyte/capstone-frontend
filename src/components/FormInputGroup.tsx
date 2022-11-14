import { InputHTMLAttributes, ReactNode } from "react";

export function FormInputGroup({ id, label, type, ...rest }: InputHTMLAttributes<HTMLInputElement> & { id: string, label: ReactNode }) {
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <input id={id} type={type ?? 'text'} {...rest} />
        </>
    );
}
