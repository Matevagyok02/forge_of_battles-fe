import {ChangeEvent, forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useRef, useState,} from "react";
import {Friend} from "./FriendsPanel.tsx";
import {Icon, IconButton} from "../../components/Button.tsx";
import {getChatMessages, sendChatMessage} from "../../api/chat.ts";

export interface Message {
    senderId: string;
    messageText: string;
    createdAt: Date;
    selfWritten?: boolean;
}

interface ChatProps {
    friend: Friend;
    userId: string;
    closeChat: (id: string) => void;
}

export interface ChatRef {
    addMessage: (message: Message) => void;
    changeStatus: (status: string) => void;
}

const ChatTab = forwardRef((props: ChatProps, ref) => {

    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [status, setStatus] = useState(props.friend.status);
    const [unseenMessages, setUnseenMessages] = useState<boolean | null>(false);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const getMessages = () => {
        getChatMessages(props.friend.userId).then(response => {
            if (response.ok && response.body && "messages" in response.body) {
                (response.body.messages as Message[]).forEach((message: Message) => {
                    message.selfWritten = message.senderId === props.userId;
                });
                setMessages(response.body.messages as Message[]);
            }
        });
    }

    useImperativeHandle(ref, () => ({
        addMessage: (message: Message) => {
            setMessages(prevState => [...prevState, message]);

            if (minimized) {
                setUnseenMessages(true);
            }
        },
        changeStatus: (status: string) => {
            setStatus(status);
        }
    }));

    useEffect(() => {
        getMessages();
    }, []);

    useEffect(() => {
        if (chatEndRef.current && !minimized) {
            chatEndRef.current!.scrollIntoView();
        }
    }, [messages, minimized]);

    const sendMessage = () => {
        if (messageText.trim()) {
            const text = messageText.trim();
            setMessageText("");

            const message = {
                senderId: props.userId,
                messageText: text,
                createdAt: new Date(),
                selfWritten: true
            }

            sendChatMessage(props.friend.userId, text).then(response => {
                if (response.ok) {
                    setMessages(prevState => [...prevState, message]);
                }
            });
        }
    }

    const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    const minimizeChat = () => {
        setUnseenMessages(false);
        setMinimized(false);
    }

    const input = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    return(
        <div>
            { minimized ?
                status && unseenMessages !== null &&
                <div
                    onClick={minimizeChat}
                    className={`chat-min ${status} ${unseenMessages ? "unseen-msg" : ""}`}
                >
                    <div className="status-indicator" title={status}></div>
                    <h1>
                        {props.friend.username}
                    </h1>
                </div>
                :
                <div
                    className="chat"
                >
                <div className="flex justify-between items-center px-2" >
                    {status &&
                        <div className={`flex items-center gap-2 ${status}`}>
                            <div className="status-indicator" title={props.friend.status}></div>
                            <h1>
                                {props.friend.username}
                            </h1>
                        </div>
                    }
                    <div className="flex items-center gap-2" >
                        <IconButton
                            icon={Icon.minimize}
                            onClick={() => setMinimized(true)}
                        />
                        <IconButton
                            text={"Close"}
                            icon={Icon.cancel}
                            onClick={() => props.closeChat(props.friend.userId)}
                        />
                    </div>
                </div>
                    <div className="hr" ></div>
                    <ul>
                        { messages && messages.map((message, index) => (
                            <li key={index} className={`message ${message.selfWritten ? "self" : "partner"}`}>
                                {message.messageText}
                            </li>
                        ))}
                        <div ref={chatEndRef} ></div>
                    </ul>
                    <div className="input-container" >
                        <textarea
                            rows={1}
                            placeholder="..."
                            value={messageText}
                            onChange={e => input(e)}
                            onKeyDown={(e) => handleEnterPress(e)}
                        ></textarea>
                        <IconButton icon={Icon.send} onClick={sendMessage} />
                    </div>
                </div>
            }
        </div>
    );
});

export default ChatTab;