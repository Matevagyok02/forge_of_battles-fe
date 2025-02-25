import Frame from "../../components/Frame.tsx";
import {ChangeEvent, FC, KeyboardEvent, useState} from "react";
import {IconButton} from "../../components/Button.tsx";
import "./BattleChat.module.css";

export interface IBattleMessage {
    emitter?: string;
    message: string;
}

const BattleChat: FC<{ messages: IBattleMessage[], sendMessage: (msg: string) => void }> = ({ messages, sendMessage }) => {

    const [minimized, setMinimized] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const input = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }

    const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(messageText);
        }
    }

    return (
        <div className="battle-chat-container" >
            {
                minimized ?
                    <IconButton text="Chat" icon="message" onClick={() => setMinimized(false)} />
                    :
                    <Frame>
                        <div className="battle-chat" >
                            <IconButton text={"Minimize"} icon="minimize" onClick={() => setMinimized(true)} />
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
                                <IconButton text="Send" icon="send" onClick={() => sendMessage(messageText)} />
                            </div>
                        </div>
                    </Frame>
            }
        </div>
    )
}

export default BattleChat;