// TODO: Cause the component/pagecomponent to check for existence of the device in the userInfo(?)
// context first before preoceeding/proceeding. If not exists, dump the user back to the devices
// screen (or, in case of haven't been logged in, dump right back into the login/authgate screen).

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// FIXME: Move into some kind of env var later
// const SOCKETSERVERR
const SOCKET_URL_BASE_PATH = 'https://capstone-backend.azurewebsites.net/';

export function DeviceInfo() {
    const [data, setData] = useState(null);

    useEffect(() => {
        // FIXME: Turn this into a Ref later instead?
        const socket = io(SOCKET_URL_BASE_PATH, {
            query: {
                // TODO: Change to using query path/parameter instead of hardcoding it like this
                deviceId: '44:17:93:10:0F:ED'
            }
        });

        socket.on('connect', () => {
            console.log('terkoneksi dengan perangkat.');
        });

        socket.on('dataMasuk', (d) => {
            console.log(d);
            setData(d);
        });

        socket.on('disconnect', () => {
            console.log('koneksi dengan socket.io telah terdiskoneksi.')
        })

        return () => {
            socket.off('dataMasuk');
        };
    }, []);

    return (
        <>
            <p>{JSON.stringify(data)}</p>
        </>
    );
}