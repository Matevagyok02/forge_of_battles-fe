import { FC, ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { adminId } from "../../admin.json";
const mode = import.meta.env.MODE;


const AdminRoute: FC<{ element: ReactElement; }> = ({ element }) => {

    const { user, isAuthenticated, isLoading } = useAuth0();

    return( isLoading ?
        <div></div>
        :
        isAuthenticated && user && user.sub === adminId && mode === "development" ?
            element
            :
            <Navigate to="/" />
    )

};

export default AdminRoute;