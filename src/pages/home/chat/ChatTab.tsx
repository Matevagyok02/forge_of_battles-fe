import {
    ChangeEvent,
    forwardRef,
    KeyboardEvent,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {IFriend} from "../friends_panel/FriendsPanel.tsx";
import {Icon, IconButton} from "../../../components/Button.tsx";
import {getChatMessages, sendChatMessage} from "../../../api/chat.ts";
import styles from "../../../styles/home_page/Chat.module.css";
import {UserContext} from "../../../context.tsx";

export interface Message {
    senderId: string;
    messageText: string;
    createdAt: Date;
    selfWritten?: boolean;
}

interface ChatProps {
    friend: IFriend;
    closeChat: () => void;
}

export interface ChatTabRef {
    addMessage: (message: Message) => void;
    changeStatus: (status: string) => void;
}

const ChatTab = forwardRef((props: ChatProps, ref) => {

    const userId = useContext(UserContext)._user?.userId;

    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [status, setStatus] = useState(props.friend.status);
    const [unseenMessages, setUnseenMessages] = useState<boolean | null>(false);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

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
        getChatMessages(props.friend.userId).then(response => {
            if (response.ok && response.body && "messages" in response.body) {
                (response.body.messages as Message[]).forEach((message: Message) => {
                    message.selfWritten = message.senderId === userId;
                });
                setMessages(response.body.messages as Message[]);
            }
        });
    }, []);

    useEffect(() => {
        if (chatEndRef.current && !minimized) {
            chatEndRef.current!.scrollIntoView();
        }

        if (!minimized) {
            setUnseenMessages(false);
        }
    }, [messages, minimized]);

    const sendMessage = () => {
        if (messageText.trim() && userId) {
            const text = messageText.trim();
            setMessageText("");

            const message = {
                senderId: userId,
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

    const input = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    return(
        minimized ?
            status && unseenMessages !== null &&
            <li
                className={`${styles.minTab} ${unseenMessages ? styles.unseenMsg : ""}`}
                onClick={() => setMinimized(false)}
            >
                <i className={styles.statusIndicator} title={status} ></i>
                <h1>
                    {props.friend.username}
                </h1>
            </li>
            :
            <li className={styles.tab} >
                <div>
                    {status &&
                        <div>
                            <i className={styles.statusIndicator} title={status}></i>
                            <h1>
                                {props.friend.username}
                            </h1>
                        </div>
                    }
                    <div>
                        <IconButton
                            icon={Icon.minimize}
                            onClick={() => setMinimized(true)}
                        />
                        <IconButton
                            text={"Close"}
                            icon={Icon.cancel}
                            onClick={props.closeChat}
                        />
                    </div>
                </div>
                <div className="hr" ></div>
                <ul>
                    { messages && messages.map((message, index) => (
                        <li key={index} data-value={message.selfWritten ? "self" : "partner"}>
                            {message.messageText}
                        </li>
                    ))}
                    <div ref={chatEndRef} ></div>
                </ul>
                <div className={styles.input} >
                        <textarea
                            rows={1}
                            placeholder="..."
                            value={messageText}
                            onChange={e => input(e)}
                            onKeyDown={(e) => handleEnterPress(e)}
                        ></textarea>
                    <IconButton icon={Icon.send} onClick={sendMessage} />
                </div>
            </li>
    );
});

export default ChatTab;