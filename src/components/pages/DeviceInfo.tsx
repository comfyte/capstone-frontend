// TODO: Cause the component/pagecomponent to check for existence of the device in the userInfo(?)
// context first before preoceeding/proceeding. If not exists, dump the user back to the devices
// screen (or, in case of haven't been logged in, dump right back into the login/authgate screen).

// import { constants } from 'buffer';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import Constants from '../../utils/constants.json';
import { useAuth } from '../../utils/hooks/useAuth';

function DataProperty() {
    return (null);
}

type DataProperties = {
    timestamp: number;
    current: number;
    voltage: number;
    power: number;
}

export function DeviceInfo() {
    const { data: userData } = useAuth();
    const { deviceId } = useParams();
    const navigate = useNavigate();

    // const [adata, setData] = useState(null);
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

    // TODO: Find out why it still pops out the alert box twice
    useEffect(() => {
        if (!deviceId || (deviceId && userData?.isAuthenticated && !(userData.devices.find((item) => item.id_device === deviceId)))) {
            window.alert('You\'re not authorized to access this page');
            navigate('/devices');
            return;
        }

        // Get initial datas

        // FIXME: Turn this into a Ref later instead?
        // const socket = io(Constants.BACKEND_BASE_URL, {
        //     query: { deviceId }
        // });

        // socket.on('connect', () => {
        //     console.log('terkoneksi dengan perangkat.');
        // });

        // socket.on('dataMasuk', (d) => {
        //     console.log(d);
        //     setData(d);
        // });

        // socket.on('disconnect', () => {
        //     console.log('koneksi dengan socket.io telah terdiskoneksi.')
        // })

        // return () => {
        //     socket.off('dataMasuk');
        // };
    }, []);

    // Assuming that every request has at least 1 page to begin with
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
    }, [currentLogPage]);

    return (
        <>
            <div></div>
            <div>
                <h2>Riwayat Pemantauan</h2>
                {logData ? (
                    <>
                        <table>
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
                                            return date.toISOString();
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
                            <ul className='flex flex-wrap'>
                                {(() => {
                                    const pageNumbers = [];
                                    for (let p = 1; p <= logData.data.paginationInfo.total_page; ++p) {
                                        pageNumbers.push(
                                            <li className='block'>
                                                <button
                                                    onClick={() => {setCurrentLogPage(p)}}
                                                    className={'block p-2 rounded transition-colors duration-75 m-1' + (currentLogPage === p ? ' font-bold bg-blue-500 hover:bg-blue-500 text-white' : ' bg-black/5')}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    }
                                    return pageNumbers;
                                })()}
                            </ul>
                        </div>
                    </>
                ) : <p className='font-italic'>Sedang memuat riwayat pemantauan untuk perangkat ini...</p>}
            </div>
        </>
    );
}