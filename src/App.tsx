import { useEffect, useState, PropsWithChildren } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthContext, AuthData } from './components/contexts/AuthContext';
import { Header } from './components/layout/Header';
import { SignIn } from './components/pages/SignIn';
import { DeviceInfo } from './components/pages/DeviceInfo';
import { MustNotAuth } from './components/wrappers/MustNotAuth';

import Constants from './utils/constants.json';
import { SignUp } from './components/pages/SignUp';
import { DeviceList } from './components/pages/DeviceList';
import { SignOut } from './components/pages/SignOut';
import { MustAuth } from './components/wrappers/MustAuth';

function CommonLayout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    )
}

const router = createBrowserRouter([
    {
        element: <CommonLayout />,
        children: [
            {
                path: '/',
                element: <MustNotAuth><SignIn /></MustNotAuth>
            },
            {
                path: '/sign-up',
                element: <MustNotAuth><SignUp /></MustNotAuth>
            },
            {
                path: '/devices',
                element: <MustAuth><DeviceList /></MustAuth>
            },
            {
                path: '/devices/:deviceId',
                element: <MustAuth><DeviceInfo /></MustAuth>
            },
            {
                path: '/sign-out',
                element: <MustAuth><SignOut /></MustAuth>
            }
        ]
    }

]);

function usePrepareAuthContext() {
    // Use `null` value for when uninitialized yet
    const [authData, setAuthData] = useState<AuthData>(null);

    // Put the important methods here so that no arbitrary child of the context can arbitrarily change the state/context data
    // I.e. only provide the relevant "setter" functions
    const refreshAuthContext = async () => {
        const uResponse = await fetch(Constants.BACKEND_BASE_URL + '/user', {
            credentials: 'include'
        });
        if (!uResponse.ok) {
            setAuthData({
                isAuthenticated: false
            });
            return;
        }
        const uResult = await uResponse.json();

        const dResponse = await fetch(Constants.BACKEND_BASE_URL + '/device', {
            credentials: 'include'
        });
        if (!dResponse.ok) {
            window.alert('Error reading devices data!');
            return;
        }
        const dResult = await dResponse.json();

        setAuthData({
            isAuthenticated: true,
            username: uResult.data.email,
            devices: dResult.data
        });
    }

    const login = async (username: string, password: string) => {
        const response = await fetch(Constants.BACKEND_BASE_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // HACK; decide whether to actually use username or email later.
            body: JSON.stringify({ email: username, password }),
            credentials: 'include'
        });

        // We're assuming that the response is always in JSON format, regardless of the status code
        const result = await response.json();
        if (!response.ok) {
            window.alert(result.message);
            // return false;
            return result;
        }

        refreshAuthContext();
    }

    const logout = async () => {
        const response = await fetch(Constants.BACKEND_BASE_URL + '/user/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            window.alert('Logout somehow failed!');
            return;
        }

        refreshAuthContext();
    }

    useEffect(() => {
        refreshAuthContext();
    }, []);

    const authContextValue = {
        data: authData,
        login,
        logout,
        refreshAuthContext
    }

    const AuthProvider = ({ children }: PropsWithChildren) => (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    )

    return { AuthProvider }; // FIXME: Add the other required/necessary values?
}

export default function App() {
    const { AuthProvider } = usePrepareAuthContext();

    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
