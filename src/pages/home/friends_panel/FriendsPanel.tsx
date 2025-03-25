import {FC, useContext, useEffect, useState} from "react";
import {Button, Icon, IconButton} from "../../../components/Button.tsx";
import {getOnlineFriends} from "../../../api/friend.ts";
import {FriendsContext, ModalContext} from "../../../context.tsx";
import {getUnseenMsg} from "../../../api/chat.ts";
import styles from "../../../styles/home_page/FriendsPanel.module.css";
import AddFriend from "./AddFriend.tsx";
import Friend from "./Friend.tsx";

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

    const addInvitedFriend = (friend: IFriend) => {
        setFriends(prevState => {
            if (prevState) {
                const newState = prevState;
                newState.pending.push(friend);
                return newState;
            } else {
                return {
                    friends: [],
                    pending: [friend]
                }
            }
        });
    }

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

    const getOnlineFriendsAndUnseenMsg = async (friends: IFriend[]) => {
        const onlineFriends = await getOnlineFriends();
        const unseenMessages = await getUnseenMsg();

        const updatedFriends = friends.map(friend => ({
            ...friend,
            status: friend.status || FriendStatus.offline,
            unseenMessage: false
        }));

        if (
            onlineFriends.body &&
            "onlineFriends" in onlineFriends.body &&
            Array.isArray(onlineFriends.body.onlineFriends)
        ) {
            onlineFriends.body.onlineFriends.forEach(friend => {
                const index = updatedFriends.findIndex(entry => entry.userId === friend.userId);
                if (index !== -1) {
                    updatedFriends[index].status = friend[FriendStatus.busy] ? FriendStatus.busy : FriendStatus.online;
                }
            });
        }

        if (
            unseenMessages.ok &&
            unseenMessages.body &&
            Array.isArray(unseenMessages.body)
        ) {
            unseenMessages.body.forEach(friend => {
                const index = updatedFriends.findIndex(entry => entry.userId === friend["otherUserId"][0].userId);
                if (index !== -1) {
                    updatedFriends[index].unseenMessage = true;
                }
            });
        }

        return updatedFriends;
    }

    useEffect(() => {
        if (friends && friends.friends.length > 0) {
            getOnlineFriendsAndUnseenMsg(friends.friends).then(updatedFriends => {
                setFriends(
                    prevState => {
                        return {
                            friends: updatedFriends,
                            pending: prevState ? prevState.pending : []
                        }
                    });
            });
        }
    }, []);

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
                    <div className={styles.addFriendBtn} >
                        <Button text="+ Friend" onClick={() => openModal(<AddFriend add={addInvitedFriend} />)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendsPanel;

export const getFriendById = (userId: string, friends: IFriend[]): IFriend | undefined => {
    return friends.find(friend => friend.userId === userId);
}
