import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Constants from '../../utils/constants.json';
import { useAuth } from "../../utils/hooks/useAuth";
import { FormInputGroup } from "../FormInputGroup";

// import Constants from '../../utils/constants.json';

export function DeviceList() {
    const { data, refreshAuthContext } = useAuth();
    // const [additionalData, setAdditionalData] = useState<{
    //     deviceId: string,
    //     lastActiveTime: string | null
    // }[] | null>(null);
    const [lastActiveData, setLastActiveData] = useState<{ [key: string]: string | null } | null>(null);

    const [isAddingNew, setAddingNew] = useState(false);

    const [deviceIdVal, setDeviceIdVal] = useState('');
    const [deviceNameVal, setDeviceNameVal] = useState('');

    // useEffect(() => {
    //     refreshAuthContext();
    // }, []);

    useEffect(() => {
        if (!(data?.isAuthenticated)) {
            // setAddingNew
            // setAdditionalData(null);
            setLastActiveData(null);
            return;
        }
        // make a const of an blank/emptya rray first?

        // for (const { id_device } of data.devices) {}

        (async () => {
            for (const { id_device } of data.devices) {
                // const lastUpdate
                // const lastActiveTime = 
                const response = await fetch(`${Constants.BACKEND_BASE_URL}/ruangan/${id_device}?volume=1&page=1`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    continue;
                }
                const jsonResult = await response.json();
                // setAdditionalData((previousData) => [
                //     ...(previousData ?? []),
                // ]);
                // setLastActiveData((previousData) => [
                //     // ...(previousData ?? [])
                //     previousData ? ...previousData : ''
                // ]);
                // setLastActiveData((previousData) => {
                //     // previousData[]
                //     const newData = previousData ?? [];
                //     newData[id_device] = jsonResult.data.items[0]
                // })
                setLastActiveData((previousData) => ({
                    ...previousData,
                    [id_device]: new Date(jsonResult.data.items[0].timestamp).toString()
                }));
            }
        })();
    }, [data]);

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
            <ul className='peer'>
                {data?.isAuthenticated ? data.devices.map(({ id_device, name }) => (
                    <li key={id_device} className='block first:rounded-t-lg bg-black bg-opacity-5 hover:bg-opacity-10 mb-1'>
                        <Link to={`/devices/${id_device}`} className='flex justify-between items-center p-4'>
                            <div className='flex-shrink-0'>
                                <p className='font-bold mb-1'>{name}</p>
                                <p>{id_device}</p>
                            </div>
                            {/* <p>{lastActiveData}</p> */}
                            <p className='text-xs italic opacity-50'>
                                {lastActiveData?.[id_device] ? `Terakhir aktif pada ${lastActiveData[id_device]}` : ''}
                            </p>
                        </Link>
                    </li>
                )) : 'Some unknown error happened in our end and we don\'t know why (?)'}
            </ul>
            <div className='block rounded-b-lg peer-empty:rounded-t-lg bg-black bg-opacity-5 hover:bg-opacity-10'>
                {isAddingNew ? (
                    <form className='flex justify-between items-center p-4' onSubmit={onAddNew}>
                        <div className='flex'>
                            <FormInputGroup
                                id='deviceId'
                                label='ID Perangkat'
                                type='text' pattern='(?:\w\w:){5}\w\w'
                                required
                                value={deviceIdVal}
                                onChange={(ev) => {setDeviceIdVal(ev.target.value)}}
                                className='mb-0 mr-4'
                                autoFocus
                            />
                            <FormInputGroup
                                id='deviceName'
                                label='Nama'
                                type='text'
                                required
                                value={deviceNameVal}
                                onChange={(ev) => {setDeviceNameVal(ev.target.value)}}
                                className='mb-0'
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
                    <button className='p-4 block w-full text-left' onClick={() => {setAddingNew(true)}}>
                        <span role='presentation'>+ </span>Tambah perangkat baru...
                    </button>
                )}
            </div>
        </>
    );
}
