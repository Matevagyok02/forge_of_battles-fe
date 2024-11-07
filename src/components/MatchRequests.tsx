import { useEffect, useState } from 'react';
import {useAuth0} from "@auth0/auth0-react";
import {io} from "socket.io-client";

const MatchRequests = () => {

    const { user, isAuthenticated } = useAuth0();
    const [socket, setSocket]: any = useState(null);

    useEffect(() => {
        if (user && isAuthenticated) {
            if (socket) {
                socket.emit('register', user.sub);

                socket.on('match-invite', (data: { match: any; status: string }) => {
                    alert(JSON.stringify(data.match));
                });
            } else {
                const socket = io(
                    import.meta.env.VITE_SOCKET_URL,
                    {
                        auth: {
                            userId: user?.sub
                        }
                    }
                );
                setSocket(socket);
            }
        }

        return () => {
            if (socket)
                socket.off('match-invite');
        };
    }, [user, socket]);

    return (
        <></>
    );
}

export default MatchRequests;
