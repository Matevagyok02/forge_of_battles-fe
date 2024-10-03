import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {io} from "socket.io-client";

class Message {
    sender: string;
    message: string;

    constructor(sender: string, message: string) {
        this.sender = sender;
        this.message = message;
    }
}

const Chat = () => {

    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket]: any = useState(null);
    const [msgText, setMsgText] = useState("");
    const [receiver, setReceiver] = useState("");

    useEffect(() => {
        if (user && isAuthenticated) {
            if (socket) {
                socket.emit('register', user.sub);

                socket.on('chat-message', (data: Message) => {
                    recieveMessage(data);
                });
            } else {
                const socket = io(
                    import.meta.env.VITE_SOCKET_URL,
                    {
                        auth: { userId: user?.sub },
                    }
                );
                setSocket(socket);
            }
        }

        return () => {
            if (socket)
                socket.off('chat-message');
        };
    }, [user, socket]);

    const recieveMessage = (data: Message) => {
        setMessages(prevMessages => [...prevMessages, data]);
    }

    const sendMessage = async () => {
        if (isAuthenticated && user) {

            const apiUrl = import.meta.env.VITE_API_URL;
            const token = await getAccessTokenSilently();

            const response = await fetch(
                `${apiUrl}chat`,
                {
                    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({ to: receiver, text: msgText })
                }
            );

            if (response.status === 200) {
                setMessages(prevMessages => [...prevMessages, new Message(user.sub as string, msgText)]);
            } else {
                alert(await response.json());
            }

        } else
            alert("You must log in to use he chat");
    }

    return (
        <div className="w-fit">
            <div className="h-60 w-fit overflow-scroll">
                { messages.map((message, index) =>
                        <p key={index} className="w-fit">
                            <label className="inline">{message.sender}: </label>
                            <span className="text-white inline" >{message.message}</span>
                        </p>
                )}
            </div>
            <div className="text-black">
                <input type="text" placeholder="message..." onChange={e => setMsgText(e.target.value)} />
                <input type="text" placeholder="reciver..." onChange={e => setReceiver(e.target.value)} />
                <input className="w-full" type="button" value="Send message" onClick={sendMessage}/>
            </div>
        </div>
    );
}

export default Chat;