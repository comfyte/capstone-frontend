import { createContext } from 'react';

export type AuthData = {
    isAuthenticated: false
} | {
    isAuthenticated: true,
    username: string
} | null;

// `null` for when not initialized yet
// FIXME: This is currently using "dummy" values so that TS doesn't whine
export const AuthContext = createContext<{
    data: AuthData,
    login: (username: string, pw: string) => any,
    logout: () => any
}>({
    data: null,
    login: () => {},
    logout: () => {}
});
