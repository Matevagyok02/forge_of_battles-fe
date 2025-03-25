import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import ChatTab, {ChatTabRef, Message} from "./ChatTab.tsx";
import {FriendStatus, IFriend} from "../friends_panel/FriendsPanel.tsx";
import styles from "../../../styles/home_page/Chat.module.css";

export interface ChatRef {
    openChat: (friend: IFriend) => void;
    changeStatus: (id: string, status: FriendStatus) => void;
    addMessage: (message: Message) => void;
}

const Chat = forwardRef((_, ref) => {

    const [chatPartners, setChatPartners] = useState<IFriend[]>([]);
    const chatTabsRef = useRef<Map<string, ChatTabRef>>(new Map());

    const changeStatus = (id: string, status: FriendStatus) => {
        if (chatTabsRef.current && chatTabsRef.current.has(id)) {
            chatTabsRef.current.get(id)?.changeStatus(status);
        }
    }

    const addMessage = (message: any) => {
        if (chatTabsRef.current && chatTabsRef.current.has(message.from)) {
            chatTabsRef.current.get(message.from)?.addMessage({
                senderId: message.from,
                messageText: message.text,
                createdAt: new Date(),
                selfWritten: false
            } as Message);
        }
    }

    const openChat = (friend: IFriend) => {
        setChatPartners(prevState => {
            if (prevState && prevState.findIndex(partner => partner.userId === friend.userId) === -1) {
                return [...prevState, friend];
            } else {
                return [friend];
            }
        });
    }

    useImperativeHandle(ref, () => ({
        openChat: openChat,
        changeStatus: changeStatus,
        addMessage: addMessage
    }), [openChat]);

    const closeChat = (id: string) => {
        setChatPartners(prevState => {
            if (prevState) {
                return prevState.filter(partner => partner.userId !== id);
            } else {
                return prevState;
            }
        });
        chatTabsRef.current.delete(id);
    }

    return(
        <ul className={styles.container} >
            {chatPartners.map(partner => (
                <ChatTab
                    key={partner.userId}
                    friend={partner}
                    closeChat={() => closeChat(partner.userId)}
                    ref={(ref: ChatTabRef) => {
                        if (ref) {
                            chatTabsRef.current.set(partner.userId, ref);
                        } else {
                            chatTabsRef.current.delete(partner.userId);
                        }
                    }}
                />
            ))}
        </ul>
    );
});

export default Chat;