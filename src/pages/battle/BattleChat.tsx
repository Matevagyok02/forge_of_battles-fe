import {ChangeEvent, FC, KeyboardEvent, useCallback, useContext, useEffect, useState} from "react";
import {Icon, IconButton} from "../../components/Button.tsx";
import "./BattleChat.css";
import {MatchContext, UserContext} from "../../context.tsx";
import {Frame} from "../../components/Frame.tsx";

export interface IBattleMessage {
    emitter?: string;
    message: string;
}

const BattleChat: FC = () => {

    const { socket } = useContext(MatchContext);
    const [minimized, setMinimized] = useState<boolean>(true);
    const [messages, setMessages] = useState<IBattleMessage[]>([]);
    const [messageText, setMessageText] = useState<string>("");
    const username = useContext(UserContext)._user?.username;

    const sendMessage = useCallback((message: string, emitter?: string) => {
        const messageObj = { message, emitter };
        setMessages(prevState => [...prevState, messageObj]);
        socket.emit("message", messageObj);
    }, [socket]);

    useEffect(() => {
        const handleReceivedMessage = (msg: IBattleMessage) => {
            setMessages(prevState => [...prevState, msg]);
        }

        socket.on("message", handleReceivedMessage);

        return () => {
            socket.off("message", handleReceivedMessage);
        }
    }, [socket]);

    const input = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    const send = () => {
        if (messageText && username) {
            sendMessage(messageText, username);
            setMessageText("");
        }
    }

    return (
        <div className="battle-chat-container" >
            {
                minimized ?
                    <IconButton text="Chat" icon={Icon.message} onClick={() => setMinimized(false)} />
                    :
                    <Frame>
                        <div className="battle-chat" >
                            <IconButton icon={Icon.minimize} onClick={() => setMinimized(true)} />
                            <ul className="battle-chat-messages" >
                                { messages.map((msg, i) =>
                                    <li key={i} className={!msg.emitter ? "event-log" : ""} >
                                        {msg.emitter && msg.emitter.substring(msg.emitter.length - 16) + ": "}
                                        {msg.message}
                                    </li>
                                )}
                            </ul>
                            <div className="battle-chat-input" >
                                <textarea
                                    rows={1}
                                    placeholder="..."
                                    value={messageText}
                                    onChange={e => input(e)}
                                    onKeyDown={(e) => handleEnterPress(e)}
                                ></textarea>
                                <IconButton icon={Icon.send} onClick={send} />
                            </div>
                        </div>
                    </Frame>
            }
        </div>
    )
}

export default BattleChat;