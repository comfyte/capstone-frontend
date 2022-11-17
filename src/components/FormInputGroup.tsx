import { InputHTMLAttributes, ReactNode } from "react";

export function FormInputGroup({ id, label, type, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { id: string, label: ReactNode }) {
    return (
        <div className={'mb-4 last-of-type:mb-0 ' + (className || '')}>
            <label htmlFor={id} className='block mb-1'>{label}</label>
            <input id={id} type={type ?? 'text'} className='w-full' {...rest} />
        </div>
    );
}
