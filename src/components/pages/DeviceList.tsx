import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Constants from '../../utils/constants.json';
import { useAuth } from "../../utils/hooks/useAuth";
import { FormInputGroup } from "../FormInputGroup";

export function DeviceList() {
    const { data, refreshAuthContext } = useAuth();

    const [isAddingNew, setAddingNew] = useState(false);

    const [deviceIdVal, setDeviceIdVal] = useState('');
    const [deviceNameVal, setDeviceNameVal] = useState('');

    // useEffect(() => {
    //     refreshAuthContext();
    // }, []);

    const onAddNew = (ev: FormEvent) => {
        ev.preventDefault();

        (async () => {
            const response = await fetch(Constants.BACKEND_BASE_URL + '/device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_device: deviceIdVal,
                    name: deviceNameVal
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                window.alert(`Gagal menambahkan perangkat! (HTTP error code ${response.status})`);
                return;
            }

            // Reset those textbox values back to a blank string
            setDeviceIdVal('');
            setDeviceNameVal('');

            setAddingNew(false);

            refreshAuthContext();
        })();
    }

    // Just a simple type guard to avoid typescript being whining too much
    // Because this logic is already handled (supposedly?) in the routes definition
    // (I.e. this particular component is wrapped by a MustAuth component)
    // if (!data?.isAuthenticated) {
    //     return;
    // }

    return (
        <>
            <h1>Daftar perangkat</h1>
            <ul>
                {data?.isAuthenticated ? data.devices.map(({ id_device, name }) => (
                    <li key={id_device} className='block shadow-md first:rounded-t-lg'>
                        <Link to={`/devices/${id_device}`} className='block p-4'>
                            <p className='font-bold mb-1'>{name}</p>
                            <p>{id_device}</p>
                        </Link>
                    </li>
                )) : 'Some unknown error happened in our end and we don\'t know why (?)'}
            </ul>
            <div className='block shadow-md rounded-b-lg'>
                {isAddingNew ? (
                    <form className='flex justify-between p-4' onSubmit={onAddNew}>
                        <div>
                            <FormInputGroup
                                id='deviceId'
                                label='ID Perangkat'
                                type='text' pattern='(?:\w\w:){5}\w\w'
                                required
                                value={deviceIdVal}
                                onChange={(ev) => {setDeviceIdVal(ev.target.value)}}
                            />
                            <FormInputGroup
                                id='deviceName'
                                label='Nama'
                                type='text'
                                required
                                value={deviceNameVal}
                                onChange={(ev) => {setDeviceNameVal(ev.target.value)}}
                            />
                        </div>
                        <div>
                            <button type='submit' className='button w-full mb-2 bg-green-500'>Tambahkan</button>
                            <button type='button' className='button w-full bg-red-500' onClick={() => {
                                setDeviceIdVal('');
                                setDeviceNameVal('');
                                setAddingNew(false);
                            }}>Batal</button>
                        </div>
                    </form>
                ) : (
                    <button className='p-4 block w-full text-left' onClick={() => {setAddingNew(true)}}>Tambah perangkat baru...</button>
                )}
            </div>
        </>
    );
}
