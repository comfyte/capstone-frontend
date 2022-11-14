import { useContext, useEffect, useState } from "react";
import { AuthContext, AuthData } from "../../components/contexts/AuthContext";

import { BACKEND_BASE_URL } from '../constants.json';

export function useAuth() {
    // const contextInstance = useContext(AuthContext);

    // return contextInstance;
    return useContext(AuthContext);
}
