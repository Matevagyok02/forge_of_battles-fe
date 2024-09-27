import { useEffect, useState } from 'react';
import {useAuth0} from "@auth0/auth0-react";
import {io} from "socket.io-client";

const FriendRequest = () => {
    const { user, isAuthenticated } = useAuth0();
    const [notifications, setNotifications] = useState<string[]>([]);
    const [socket, setSocket]: any = useState(null);

    useEffect(() => {
        if (user && isAuthenticated) {
            if (socket) {
                socket.emit('register', user.sub);

                socket.on('receive-friend-request', (data: { sender: string; message: string }) => {
                    setNotifications((prev) => [...prev, `${data.sender} sent you a friend request`]);
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
                socket.off('receive-friend-request');
        };
    }, [user, socket]);

    return (
        <div>
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                    <div key={index}>{notification}</div>
                ))
            ) : (
                <div>No notifications</div>
            )}
        </div>
    );
};

export default FriendRequest;
