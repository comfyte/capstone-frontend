// TODO: Cause the component/pagecomponent to check for existence of the device in the userInfo(?)
// context first before preoceeding/proceeding. If not exists, dump the user back to the devices
// screen (or, in case of haven't been logged in, dump right back into the login/authgate screen).

// import { constants } from 'buffer';
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import Constants from '../../utils/constants.json';
import { useAuth } from '../../utils/hooks/useAuth';

import Styles from './DeviceInfo.module.css';

type DataProperties = {
    timestamp: number;
    current: number;
    voltage: number;
    power: number;
}

const DataProperty = ({ title, children }: PropsWithChildren<{ title: string }>) => {
    return (
        <p>
            <span className='block text-sm text-gray-600 mb-1'>{title}</span>
            <span className='sr-only'>: </span>
            <span className='block text-xl font-semibold'>{children || '-'}</span>
        </p>
    );
}

export function DeviceInfo() {
    const { data: userData } = useAuth();
    const { deviceId } = useParams();
    const navigate = useNavigate();

    // const [adata, setData] = useState(null);
    const [realTimeData, setRealTimeData] = useState<DataProperties | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'unknown'>('disconnected');

    const [logData, setLogData] = useState<{
        // success: ConstrainBooleanParameters,
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

    // const deviceData = useRef() || null);
    // const [deviceData, setDeviceData] = useState();

    // TODO: Find out why it still pops out the alert box twice
    // The real-time part (powered by socket.io)
    // One-time-called useEffect callback function
    useEffect(() => {
        // setDeviceData() here?
        // if (!deviceId || !(deviceData.current)) {
            if (!deviceId || !(userData?.isAuthenticated && userData.devices.find((item) => item.id_device === deviceId))) {
            window.alert('You\'re not authorized to access this page');
            navigate('/devices');
            return;
        }

        setDeviceStatus('connecting');

        // Get initial datas

        // FIXME: Turn this into a Ref later instead?
        const socket = io(Constants.BACKEND_BASE_URL, {
            query: { deviceId }
        });

        socket.on('connect', () => {
            // console.log('terkoneksi dengan perangkat.');
            // TODO: Put the device status here
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
                // ReadableStreamDefaultController;
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

    // if (!(deviceData.current)) {
    //     window.alert('Terjadi sebuah kesalahan!');
    //     return null;
    // }

    const DeviceConnectionStatus = () => {
        // switch (deviceStatus) {
        //     case 'disconnected':
        //         return ()
        // }
        // const 
    
        const [text, classNames]: [ReactNode, string] = ((ds) => {
            switch (ds) {
                case 'disconnected':
                    return ['Tidak terhubung', 'bg-black/20 text-black']
                case 'connecting':
                    return ['Sedang menyambungkan', ' bg-black/20 text-black'];
                case 'connected':
                    return ['Terhubung', 'bg-green-500/20 text-green-500'];
                case 'unknown':
                    return ['Status perangkat tidak diketahui', 'bg-red-500/20 text-red'];
            }
        })(deviceStatus);

        return (
            <div className={Styles.deviceStatus + ' flex items-center uppercase font-bold p-2 leading-none rounded-md text-sm ' + classNames}>
                {text}
            </div>
        )
    }
    

    return (
        <>
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
                    <DataProperty title='Waktu terakhir diperbarui'>{realTimeData && new Date(realTimeData.timestamp).toString()}</DataProperty>
                    <DataProperty title='Arus'>{realTimeData?.current}</DataProperty>
                    <DataProperty title='Daya'>{realTimeData?.power}</DataProperty>
                    <DataProperty title='Voltase'>{realTimeData?.voltage}</DataProperty>
                </div>
            </div>
            <div>
                <h2>Riwayat Pemantauan</h2>
                {logData ? (
                    <>
                        <table className='table-fixed w-full'>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Arus</th>
                                    <th>Daya</th>
                                    <th>Voltase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logData.data.items.map(({ timestamp, current, power, voltage }) => (
                                    <tr key={timestamp}>
                                        <td>{(() => {
                                            const date = new Date(timestamp);
                                            return date.toString();
                                        })()}</td>
                                        <td>{current} A</td>
                                        <td>{power} (satuan?)</td>
                                        <td>{voltage} V</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div>
                            <p>Pilih halaman:</p>
                            <button disabled={currentLogPage <= 1} onClick={() => {setCurrentLogPage((prev) => --prev)}}>&larr;</button>
                            <div>
                                <p>Halaman </p>
                                <input type='number' min={1} max={logData.data.paginationInfo.total_page} value={currentLogPage} onChange={(ev) => {setCurrentLogPage(parseInt(ev.target.value))}} />
                                <p>dari {logData.data.paginationInfo.total_page} halaman</p>
                            </div>
                            <button disabled={currentLogPage >= logData.data.paginationInfo.total_page} onClick={() => {setCurrentLogPage((prev) => ++prev)}}>&rarr;</button>
                        </div>
                    </>
                ) : <p className='font-italic'>Sedang memuat riwayat pemantauan untuk perangkat ini...</p>}
            </div>
        </>
    );
}