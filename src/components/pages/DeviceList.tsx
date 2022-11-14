import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Constants from '../../utils/constants.json';
import { FormInputGroup } from "../FormInputGroup";

export function DeviceList() {
    const [data, setData] = useState([]);
    const [isAddingNew, setAddingNew] = useState(false);

    const [deviceIdVal, setDeviceIdVal] = useState('');
    const [deviceNameVal, setDeviceNameVal] = useState('');

    const refreshDeviceList = async () => {
        const response = await fetch(Constants.BACKEND_BASE_URL + '/device', {
            credentials: 'include'
        });
        if (!response.ok) {
            window.alert('Error!');
            return;
        }
        const result = await response.json();
        setData(result.data);
    }

    useEffect(() => {
        refreshDeviceList();
    }, []);

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

            refreshDeviceList();
        })();
    }

    return (
        <>
            <h1>Daftar perangkat</h1>
            <ul>
                {data.map(({ id_device, name }) => (
                    <li key={id_device} className='block shadow-md first:rounded-t-lg'>
                        <Link to={`/devices/${id_device}`} className='block p-4'>
                            <p className='font-bold mb-1'>{name}</p>
                            <p>{id_device}</p>
                        </Link>
                    </li>
                ))}
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
