import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Constants from '../../utils/constants.json';
import { useAuth } from "../../utils/hooks/useAuth";
import { FormInputGroup } from "../FormInputGroup";

// For id-ID region
// Logic is from big to small
function relativeTime(msOfDifference: number, advance: number = 0): string {
    const orderOfMultipliers = [1000, 60, 60, 24];
    const unitStrings = ['detik', 'menit', 'jam', 'hari'];

    // Just some basic type guarding/checking
    if (orderOfMultipliers.length !== unitStrings.length) {
        throw new ReferenceError();
    }

    for (let i = 0; i < advance; ++i) {
        orderOfMultipliers.pop();
        unitStrings.pop();
    }

    const divisor = orderOfMultipliers.reduce((prevVal, curVal) => prevVal * curVal);

    if (msOfDifference < divisor) {
        if (orderOfMultipliers.length <= 1) {
            return 'baru saja';
        }
        return relativeTime(msOfDifference, ++advance);
    }
    return `${Math.floor(msOfDifference / divisor)} ${unitStrings[unitStrings.length - 1]} yang lalu`
}

export function DeviceList() {
    const { data, refreshAuthContext } = useAuth();
    const [lastActiveData, setLastActiveData] = useState<{ [key: string]: string | null } | null>(null);

    const [isAddingNew, setAddingNew] = useState(false);

    const [deviceIdVal, setDeviceIdVal] = useState('');
    const [deviceNameVal, setDeviceNameVal] = useState('');

    useEffect(() => {
        if (!(data?.isAuthenticated)) {
            setLastActiveData(null);
            return;
        }

        (async () => {
            for (const { id_device } of data.devices) {
                const response = await fetch(`${Constants.BACKEND_BASE_URL}/ruangan/${id_device}?volume=1&page=1`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    continue;
                }
                const jsonResult = await response.json();
                setLastActiveData((previousData) => ({
                    ...previousData,
                    [id_device]: relativeTime(Date.now() - jsonResult.data.items[0].timestamp)
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

    const entryCommonClassNames = 'block bg-black bg-opacity-5';

    return (
        <>
            <h1>Daftar perangkat</h1>
            <ul className='peer'>
                {data?.isAuthenticated ? data.devices.map(({ id_device, name }) => (
                    <li key={id_device} className={entryCommonClassNames + ' first:rounded-t-lg mb-1 hover:bg-opacity-10 active:bg-opacity-[0.2]'}>
                        <Link to={`/devices/${id_device}`} className='flex justify-between items-center p-4 cursor-default'>
                            <div className='flex-shrink-0'>
                                <p className='font-bold mb-1'>{name}</p>
                                <p>{id_device}</p>
                            </div>
                            <p className='text-xs italic opacity-50'>
                                {lastActiveData?.[id_device] ? `Terakhir aktif ${lastActiveData[id_device]}` : ''}
                            </p>
                        </Link>
                    </li>
                )) : 'Some unknown error happened in our end and we don\'t know why (?)'}
            </ul>
            <div className={entryCommonClassNames + ' rounded-b-lg peer-empty:rounded-t-lg ' + (isAddingNew ? '' : 'hover:bg-opacity-10 active:bg-opacity-[0.2]')}>
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
                    <button className='p-4 block w-full text-left cursor-default' onClick={() => {setAddingNew(true)}}>
                        <span role='presentation'>+ </span>Tambah perangkat baru...
                    </button>
                )}
            </div>
        </>
    );
}
