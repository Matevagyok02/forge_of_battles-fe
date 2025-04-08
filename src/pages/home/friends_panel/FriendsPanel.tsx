import {FC, useContext, useEffect, useState} from "react";
import {Button, Icon, IconButton} from "../../../components/Button.tsx";
import {FriendsContext, ModalContext} from "../../../context.tsx";
import styles from "../../../styles/home_page/FriendsPanel.module.css";
import AddFriend from "./AddFriend.tsx";
import Friend from "./Friend.tsx";
import {useOnlineFriends, useUnseenMessages} from "../../../api/hooks.tsx";
import {OnlineFriend, UnseenMessage} from "../../../api/api.ts";

export interface Friends {
    friends: IFriend[];
    pending: IFriend[];
    update?: boolean;
}

export interface IFriend {
    userId: string;
    username: string;
    picture?: string;
    status?: string;
    unseenMessage?: boolean;
}

export enum FriendStatus {
    online = "online",
    busy = "busy",
    offline = "offline",
    pending = "pending"
}

const FriendsPanel: FC<{ openChat: (friend: IFriend) => void }> = ({ openChat }) => {

    const [open, setOpen] = useState(false);
    const [unseenMessages, setUnseenMessages] = useState(false);

    const { openModal } = useContext(ModalContext);
    const { friends, setFriends } = useContext(FriendsContext);

    const fetchOnlineFriends = useOnlineFriends();
    const fetchUnseenMessages = useUnseenMessages();

    const removeUnseenMsg = (userId: string) => {
        setFriends(prevState => {
            if (prevState) {
                const newState = prevState;
                const friend = newState.friends.find(friend => friend.userId === userId);
                if (friend) {
                    friend.unseenMessage = false;
                }
                return newState;
            } else {
                return prevState;
            }
        });
    }

    const togglePanel = () => {
        setOpen(!open);
    }

    const processData = (onlineFriends: OnlineFriend[], unseenMessages: UnseenMessage []) => {
        const updatedFriends = friends.friends.map(friend => ({
            ...friend,
            status: friend.status || FriendStatus.offline,
            unseenMessage: false
        }));

        onlineFriends.forEach(friend => {
            const index = updatedFriends.findIndex(entry => entry.userId === friend.userId);
            if (index !== -1) {
                updatedFriends[index].status = friend[FriendStatus.busy] ? FriendStatus.busy : FriendStatus.online;
            }
        });

        unseenMessages.forEach(friend => {
            const index = updatedFriends.findIndex(entry => entry.userId === friend.userId);
            if (index !== -1) {
                updatedFriends[index].unseenMessage = true;
            }
        });

        setFriends(
            prevState => {
                return {
                    friends: updatedFriends,
                    pending: prevState ? prevState.pending : []
                }
            });
    }

    useEffect(() => {
        if (fetchOnlineFriends.isSuccess && fetchUnseenMessages.isSuccess) {
            processData(fetchOnlineFriends.data.data, fetchUnseenMessages.data.data);
        }
    }, [fetchOnlineFriends.data, fetchUnseenMessages.data]);

    useEffect(() => {
        if (friends) {
            let unseenMsgCount = 0

            friends.friends.forEach(friend => {
                if (friend.unseenMessage) {
                    unseenMsgCount++;
                }
            });

            setUnseenMessages(unseenMsgCount > 0);
        }
    }, [friends]);

    return (
        <div className={styles.container} >
            {!unseenMessages ?
                <IconButton icon={Icon.friends} text={"Friends"} bg decorated onClick={togglePanel} />
                :
                <IconButton icon={Icon.unseenMessage} text={"Check Unseen Messages"} bg decorated onClick={togglePanel} />
            }
            <div className={`${styles.panel} ${open ? styles.open : styles.closed}`} >
                <div className={styles.frame}></div>
                <div className={styles.content}>
                    {/*<IconButton icon={Icon.refresh} text={"Refresh"} />*/}
                    <ul>
                        {friends &&
                            <>
                                {friends.friends.map(friend =>
                                    <Friend
                                        friend={friend}
                                        openChat={() => openChat(friend)}
                                        removeUnseenMsg={() => removeUnseenMsg(friend.userId)}
                                        key={friend.userId}
                                    />
                                )}
                                {friends.pending.map(friend =>
                                    <Friend
                                        friend={friend}
                                        key={friend.userId}
                                    />
                                )}
                            </>
                        }
                    </ul>
                    <Button text="+ Friend" onClick={() => openModal(<AddFriend/>)} />
                </div>
            </div>
        </div>
    );
};

export default FriendsPanel;

export const getFriendById = (userId: string, friends: IFriend[]): IFriend | undefined => {
    return friends.find(friend => friend.userId === userId);
}
