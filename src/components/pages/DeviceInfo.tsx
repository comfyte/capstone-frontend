// TODO: Cause the component/pagecomponent to check for existence of the device in the userInfo(?)
// context first before preoceeding/proceeding. If not exists, dump the user back to the devices
// screen (or, in case of haven't been logged in, dump right back into the login/authgate screen).

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import Constants from '../../utils/constants.json';
import { useAuth } from '../../utils/hooks/useAuth';

export function DeviceInfo() {
    const { data } = useAuth();
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const [adata, setData] = useState(null);

    // TODO: Find out why it still pops out the alert box twice
    useEffect(() => {
        if (deviceId && data?.isAuthenticated && !(data.devices.find((item) => item.id_device === deviceId))) {
            window.alert('You\'re not authorized to access this page');
            navigate('/devices');
        }
    }, []);

    useEffect(() => {
        // FIXME: Turn this into a Ref later instead?
        const socket = io(Constants.BACKEND_BASE_URL, {
            query: { deviceId }
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
            <p>{JSON.stringify(adata)}</p>
        </>
    );
}