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
import styles from "../../../styles/home_page/Chat.module.css";
import {UserContext} from "../../../context.tsx";
import {useChatMessages, useSendChatMessage} from "../../../api/hooks.tsx";

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

    const fetchMessages = useChatMessages(props.friend.userId);
    const sendMessage = useSendChatMessage();

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
        if (fetchMessages.isSuccess && fetchMessages.data) {
            const messages = fetchMessages.data.data;

            messages.map((message: Message) => {
                message.selfWritten = message.senderId === userId;
            });

            setMessages(messages);
        }
    }, [fetchMessages.data]);

    useEffect(() => {
        fetchMessages.refetch();
    }, []);

    useEffect(() => {
        if (chatEndRef.current && !minimized) {
            chatEndRef.current!.scrollIntoView();
        }

        if (!minimized) {
            setUnseenMessages(false);
        }
    }, [messages, minimized]);

    const send = () => {
        const text = messageText.trim();

        if (text && userId) {
            sendMessage.send(props.friend.userId, text);
        }
    }

    useEffect(() => {
        if (sendMessage.isSuccess && userId) {
            const message = {
                senderId: userId,
                messageText: messageText.trim(),
                createdAt: new Date(),
                selfWritten: true
            }

            setMessages(prevState => [...prevState, message]);
            setMessageText("");
        }
    }, [sendMessage.submittedAt, sendMessage.isSuccess]);

    const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    const input = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    return(
        minimized ?
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
                <horizontal-line/>
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
                    <IconButton icon={Icon.send} onClick={send} />
                </div>
            </li>
    );
});

export default ChatTab;