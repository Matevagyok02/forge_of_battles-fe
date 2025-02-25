import {FC, useContext, useEffect, useState} from "react";
import {Button, IconBtnDecoration, IconButton} from "../../components/Button.tsx";
import {getOnlineFriends, sendFriendInvite} from "../../api/friend.ts";
import {findByUsername} from "../../api/user.ts";
import Modal from "../../components/Modal.tsx";
import {CustomResponse} from "../../api/api.ts";
import {FriendsContext, ModalContext} from "../../Context.tsx";
import CreateGame from "./CreateGame.tsx";
import {getUnseenMsg} from "../../api/chat.ts";
import friendsPanelStyles from "./FriendsPanel.module.css";
import appStyles from "../../styles/App.module.css";
import chatTabStyles from "./ChatTab.module.css";

export interface Friends {
    friends: Friend[];
    pending: Friend[];
    update?: boolean;
}

export interface Friend {
    userId: string;
    username: string;
    picture?: string;
    status?: string;
    unseenMessage?: boolean;
}

export enum FriendStatus {
    Online = "online",
    Busy = "busy",
    Offline = "offline",
    Pending = "pending"
}

const FriendsPanel: FC<{ openChat: (friend: Friend) => void }> = ({ openChat }) => {

    const [open, setOpen] = useState(false);
    const [unseenMessages, setUnseenMessages] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const ListedFriend: FC<Friend> = ((friend) => {

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

        const openChatWithFriend = () => {
            removeUnseenMsg(friend.userId);
            openChat(friend);
        }

        const getStatusClass = (status: string | undefined) => {
            switch (status) {
                case FriendStatus.Online:
                    return friendsPanelStyles.online;
                case FriendStatus.Busy:
                    return friendsPanelStyles.busy;
                case FriendStatus.Offline:
                    return friendsPanelStyles.offline;
                case FriendStatus.Pending:
                    return friendsPanelStyles.pending;
                default:
                    return "";
            }
        }

        const handleHover = () => {
            setShowOptions(true);
        }

        return (
            <li
                key={friend.userId}
                className={`${friendsPanelStyles.friend} ${getStatusClass(friend.status)} ${friend.unseenMessage ? chatTabStyles.unseenMsg : ""}`}
                onMouseEnter={handleHover}
                onMouseLeave={() => setShowOptions(false)}
            >
                <div className={friendsPanelStyles.friendAvatarContainer}>
                    <div className={`${friendsPanelStyles.fixedStatusIndicator} ${friendsPanelStyles.statusIndicator}`} title={friend.status}></div>
                    <img className={appStyles.userAvatar} src={`./avatars/${friend.picture || "1"}.jpg`} alt="" />
                </div>
                <div>
                    <h1 className="px-2">
                        {friend.username}
                    </h1>
                    <div className="flex mt-1 ml-2 relative">
                        { friend.status !== FriendStatus.Pending && showOptions ?
                            <div className={friendsPanelStyles.friendOptions}>
                                <IconButton text="Message" icon="message" onClick={openChatWithFriend} />
                                { friend.status === "online" &&
                                    <IconButton
                                        text="Invite"
                                        icon="add"
                                        onClick={() => openModal(<CreateGame friend={friend} />)}
                                    />
                                }
                            </div>
                            :
                            <small className={friendsPanelStyles.statusTitle}>
                                {friend.status}
                            </small>
                        }
                    </div>
                </div>
            </li>
        )
    });

    const { openModal, closeModal } = useContext(ModalContext);
    const { friends, setFriends } = useContext(FriendsContext);

    const AddFriend = () => {

        const [loading, setLoading] = useState(false);
        const [searchResult, setSearchResult] = useState<Friend | null>(null);
        const [inviteResult, setInviteResult] = useState<CustomResponse>();
        const [found, setFound] = useState(true);
        const [searchQuery, setSearchQuery] = useState("");

        const inviteFriend = async () => {
            if (searchResult) {
                setLoading(true);
                sendFriendInvite(searchResult.userId).then(result => {
                    if (result.ok) {
                        const invitedFriend = {
                            userId: searchResult.userId,
                            username: searchResult.username,
                            picture: searchResult.picture,
                            status: "pending"
                        }
                        setFriends(prevState => {
                            if (prevState) {
                                const newState = prevState;
                                newState.pending.push(invitedFriend);
                                return newState;
                            } else {
                                return {
                                    friends: [],
                                    pending: [invitedFriend]
                                }
                            }
                        });
                    }
                    setInviteResult(result);
                });
            }
        }

        const findFriend = async () => {
            if (searchQuery.trim()) {
                setLoading(true);
                findByUsername(searchQuery).then(result => {
                    if (result.ok && result.body) {
                        setSearchResult(result.body as Friend);
                        setFound(true);
                    } else {
                        setFound(false);
                    }
                    setLoading(false);
                });
            }
        }

        return (
            <Modal>
                <div className="flex flex-col gap-4 p-5 items-center w-fit">
                    {searchResult && !inviteResult ?
                        <>
                            <div className="flex items-end gap-2">
                                <img className="user-avatar" src={`./avatars/${searchResult.picture || "1"}.jpg`} alt="" />
                                <h1 className="text-2xl">{searchResult.username}</h1>
                            </div>
                            <div className={appStyles.hr}></div>
                            <div className="flex gap-4">
                                <Button text="Back" onClick={() => setSearchResult(null)} />
                                <Button text="Invite" onClick={inviteFriend} />
                            </div>
                        </>
                        :
                        <>
                            {inviteResult ?
                                <>
                                    {inviteResult.body && "message" in inviteResult.body &&
                                        <p className={`text-center max-w-80 px-4 ${inviteResult.ok ? "" : appStyles.errorText}`}>
                                            {inviteResult.body.message}
                                        </p>
                                    }
                                    <div className={appStyles.hr}></div>
                                    <Button text={"Close"} onClick={closeModal} />
                                </>
                                :
                                <>
                                    <p className="text-center px-4">
                                        Enter the username of the friend you want to add
                                    </p>
                                    <div className={appStyles.hr}></div>
                                    {!found &&
                                        <p className={`${appStyles.errorText} text-sm text-center px-4`}>
                                            The user you are looking for was not found
                                        </p>
                                    }
                                    <div className="flex gap-4 items-center">
                                        <input
                                            className=""
                                            type="text"
                                            placeholder="Friend Username"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Button text="Search" onClick={findFriend} loading={loading} disabled={!searchQuery.trim()} />
                                    </div>
                                </>
                            }
                        </>
                    }
                </div>
            </Modal>
        );
    }

    const getOnlineFriendsAndUnseenMsg = async (friends: Friend[]) => {
        const onlineFriends = await getOnlineFriends();
        const unseenMessages = await getUnseenMsg();

        const updatedFriends = friends.map(friend => ({
            ...friend,
            status: friend.status || FriendStatus.Offline,
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
                    updatedFriends[index].status = friend[FriendStatus.Busy] ? FriendStatus.Busy : FriendStatus.Online;
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
        <div className={`${friendsPanelStyles.friendsPanelContainer} ${open ? friendsPanelStyles.friendsOpen : ""}`}>
            {!unseenMessages ?
                <IconButton text="Friends" icon="friends" decorated={IconBtnDecoration.horizontal} onClick={() => setOpen(!open)} />
                :
                <button
                    title="Check unseen messages"
                    className={`${friendsPanelStyles.decorativeHex} ${friendsPanelStyles.iconBtn}`}
                    onClick={() => setOpen(!open)}
                >
                    <div className={friendsPanelStyles.unseenMsgIcon} ></div>
                    <i className={`flex w-full justify-center items-center p-2`} ></i>
                </button>
            }
            <div className={friendsPanelStyles.friendsPanel}>
                <div className={friendsPanelStyles.friendsPanelFrame}></div>
                <div className={friendsPanelStyles.friendsPanelContent}>
                    <div className="flex w-full justify-center"></div>
                    <ul>
                        {friends &&
                            <>
                                {friends.friends.map(friend =>
                                    <ListedFriend
                                        userId={friend.userId}
                                        username={friend.username}
                                        picture={friend.picture}
                                        status={friend.status}
                                        unseenMessage={friend.unseenMessage}
                                        key={friend.userId}
                                    />
                                )}
                                {friends.pending.map(friend =>
                                    <ListedFriend
                                        userId={friend.userId}
                                        username={friend.username}
                                        picture={friend.picture}
                                        status="pending"
                                        key={friend.userId}
                                    />
                                )}
                            </>
                        }
                    </ul>
                    <div className="flex w-full justify-center items-center p-2">
                        <Button text="+ Friend" onClick={() => openModal(<AddFriend />)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendsPanel;

export const getFriendById = (userId: string, friends: Friend[]): Friend | undefined => {
    return friends.find(friend => friend.userId === userId);
}

export const getAvailableFriends = (friends: Friend[]): Friend[] => {
    return friends.filter(friend => friend.status === FriendStatus.Online);
}