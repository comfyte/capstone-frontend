import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import Constants from '../../utils/constants.json';
import { useAuth } from '../../utils/hooks/useAuth';

import styles from './DeviceInfo.module.css';

type DataProperties = {
    timestamp: number;
    current: number;
    voltage: number;
    power: number;
}

const DataProperty = ({ title, children, unitSuffix }: PropsWithChildren<{ title: string, unitSuffix?: string }>) => {
    return (
        <p>
            <span className='block text-sm text-gray-600 mb-1'>{title}</span>
            <span className='sr-only'>: </span>
            <span className='block text-xl font-semibold'>{children || '-'}{children && unitSuffix && (' ' + unitSuffix)}</span>
        </p>
    );
}

export function DeviceInfo() {
    const { data: userData } = useAuth();
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const [realTimeData, setRealTimeData] = useState<DataProperties | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'unknown'>('disconnected');

    const [logData, setLogData] = useState<{
        success: boolean,
        data: {
            items: DataProperties[],
            paginationInfo: {
                current_page: number,
                total_page: number
            }
        }
    } | null>(null);
    const [currentLogPage, setCurrentLogPage] = useState(1);

    const [updateRate, setUpdateRate] = useState<number | null>(null); // in seconds
    const updateRateRefreshTimeout = useRef<NodeJS.Timeout>();
    useEffect(() => {
        if (updateRate === null) {
            return;
        }

        clearTimeout(updateRateRefreshTimeout.current);

        updateRateRefreshTimeout.current = setTimeout(() => {
            setUpdateRate(null);
        }, updateRate);
    }, [updateRate]);

    // TODO: Find out why it still pops out the alert box twice
    // The real-time part (powered by socket.io)
    // One-time-called useEffect callback function
    useEffect(() => {
            if (!deviceId || !(userData?.isAuthenticated && userData.devices.find((item) => item.id_device === deviceId))) {
            window.alert('You\'re not authorized to access this page');
            navigate('/devices');
            return;
        }

        setDeviceStatus('connecting');

        const socket = io(Constants.BACKEND_BASE_URL, {
            query: { deviceId }
        });

        socket.on('connect', () => {
            setDeviceStatus('connected');
        });

        socket.on('dataMasuk', (data) => {
            console.log(data);
            setRealTimeData(data);
        });

        socket.on('disconnect', () => {
            setDeviceStatus('disconnected');
        })

        return () => {
            socket.removeAllListeners();
        };
    }, []);

    // Assuming that every request has at least 1 page to begin with
    // (This useEffect function is called everytime the data/variable/value as listed in the dependency list are changed)
    useEffect(() => {
        (async () => {
            const response = await fetch(`${Constants.BACKEND_BASE_URL}/ruangan/${deviceId}?volume=25&page=${currentLogPage}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                window.alert('Terjadi sebuah kesalahan! Mohon maaf atas ketidaknyamanan Anda.');
                navigate('/devices');
                return;
            }

            const result = await response.json();
            setLogData(result);
        })();
    }, [currentLogPage, realTimeData]);

    // FIXME: This currently only uses the two topmost data of THE CURRENT PAGE, not out of the all datas.
    useEffect(() => {
        const timestampDifference = logData && logData.data.items.length >= 2 && logData.data.items[1].timestamp - logData.data.items[0].timestamp;
        setUpdateRate(timestampDifference ? new Date(timestampDifference).getSeconds() : null)
    }, [realTimeData]);
    // do we need to also include currentLogPage here in the dependencies list?

    const DeviceConnectionStatus = () => {    
        const [text, classNames]: [ReactNode, string] = ((ds) => {
            switch (ds) {
                case 'disconnected':
                    return ['Koneksi terputus', 'bg-black/20 text-black']
                case 'connecting':
                    return ['Sedang menyambungkan', ' bg-yellow-500/20 text-yellow-500'];
                case 'connected':
                    return ['Terhubung', 'bg-green-500/20 text-green-500'];
                case 'unknown':
                    return ['Status perangkat tidak diketahui', 'bg-red-500/20 text-red'];
            }
        })(deviceStatus);

        return (
            <div className={styles.deviceStatus + ' flex items-center uppercase font-bold p-2 leading-none rounded-md text-sm ' + classNames}>
                {text}
            </div>
        )
    }
    

    return (
        <>
            <div className='mb-6'>
                <Link to='/devices' className='block w-fit text-blue-700 hover:underline'>&larr; Kembali ke daftar perangkat</Link>
            </div>
            <div className='mb-8'>
                {/* <h1>{deviceData.current.name}</h1> */}
                <div className='flex justify-between items-center mb-8'>
                    <div className='flex items-center'>
                        <h1 className='mb-0 mr-4'>{userData ? (userData.isAuthenticated && userData.devices.find((item) => item.id_device === deviceId)?.name) : 'Memuat...'}</h1>
                        <DeviceConnectionStatus />
                    </div>
                    <p className='text-sm italic'>{
                        updateRate
                            ? `Data diperbarui setiap ${updateRate} detik`
                            : '(interval pembaruan data belum tersedia)'
                    }</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-none gap-8'>
                    <DataProperty title='ID perangkat'>{deviceId}</DataProperty>
                    <DataProperty title='Waktu terakhir diperbarui'>{realTimeData && new Date(realTimeData.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'long' })}</DataProperty>
                    <DataProperty title='Arus' unitSuffix='A'>{realTimeData?.current}</DataProperty>
                    <DataProperty title='Daya' unitSuffix='W'>{realTimeData?.power}</DataProperty>
                    <DataProperty title='Voltase' unitSuffix='V'>{realTimeData?.voltage}</DataProperty>
                </div>
            </div>
            <div>
                <h2>Riwayat Pemantauan</h2>
                {logData ? (
                    <>
                        <table className='table-fixed w-full'>
                            <thead>
                                <tr className='bg-gray-200'>
                                    <th className='rounded-tl-lg'>Waktu</th>
                                    <th>Arus</th>
                                    <th>Daya</th>
                                    <th className='rounded-tr-lg'>Voltase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logData.data.items.map(({ timestamp, current, power, voltage }) => (
                                    <tr key={timestamp} className='even:bg-gray-200 odd:bg-gray-100 group'>
                                        <td className='group-last:rounded-bl-lg'>{(() => {
                                            const date = new Date(timestamp);
                                            return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'long' })
                                        })()}</td>
                                        <td>{current} A</td>
                                        <td>{power} W</td>
                                        <td className='group-last:rounded-br-lg'>{voltage} V</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='flex w-fit mx-auto items-center mt-4'>
                            <button disabled={currentLogPage <= 1} onClick={() => {setCurrentLogPage((prev) => --prev)}} className='text-blue-700 hover:underline text-xl mr-4'>&larr;</button>
                            <div className='flex items-center'>
                                <p>Halaman </p>
                                <input
                                    type='number'
                                    min={1}
                                    max={logData.data.paginationInfo.total_page}
                                    value={currentLogPage}
                                    onChange={(ev) => {
                                        if (ev.target.value) {
                                            const intValue = parseInt(ev.target.value);

                                            const min = parseInt(ev.target.min);
                                            const max = parseInt(ev.target.max);

                                            if (intValue < min) {
                                                setCurrentLogPage(min);
                                                return;
                                            }

                                            if (intValue > max) {
                                                setCurrentLogPage(max);
                                                return;
                                            }
                                            
                                            setCurrentLogPage(intValue);
                                        }
                                    }}
                                    className='block mx-2 text-center p-1'
                                    size={4}
                                />
                                <p>dari {logData.data.paginationInfo.total_page} halaman</p>
                            </div>
                            <button disabled={currentLogPage >= logData.data.paginationInfo.total_page} onClick={() => {setCurrentLogPage((prev) => ++prev)}} className='text-blue-700 hover:underline text-xl ml-4'>&rarr;</button>
                        </div>
                    </>
                ) : <p className='font-italic'>Sedang memuat riwayat pemantauan untuk perangkat ini...</p>}
            </div>
        </>
    );
}