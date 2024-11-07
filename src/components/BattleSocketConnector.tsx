import { useEffect, useState } from 'react';
import {useAuth0} from "@auth0/auth0-react";
import {io} from "socket.io-client";
import {Button} from "./Button.tsx";

const BattleSocketConnector = () => {

    const { user, isAuthenticated } = useAuth0();

    const [socket, setSocket]: any = useState(null);
    const [key, setKey] = useState("");

    useEffect(() => {
        if (socket) {
            console.log(socket);
            socket.emit("join");
            socket.on("connection-fail", () => alert("connection failed"));
        }
    }, [socket]);

    const connectBattleSocket = async () => {
        if (user && isAuthenticated && key) {
            const socket = io(
                import.meta.env.VITE_SOCKET_URL + "battle",
                {
                    auth: {
                        userId: user?.sub
                    },
                    query: {
                        key: key
                    }
                }
            );
            setSocket(socket);
        }
    }

    return (
        <div className="flex flex-col gap-4" >
            <input className="text-black" placeholder="key" onChange={(e) => setKey(e.target.value)} />
            <Button text="Connect" onClick={connectBattleSocket} />
        </div>
    );
}

export default BattleSocketConnector;
