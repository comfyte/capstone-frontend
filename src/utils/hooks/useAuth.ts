import { useContext } from "react";
import { AuthContext } from "../../components/contexts/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}
