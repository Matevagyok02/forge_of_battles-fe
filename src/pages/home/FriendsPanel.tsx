import {
    FC,
    forwardRef,
    ReactElement,
    useEffect,
    useImperativeHandle,
    useState
} from "react";
import { Button, IconButton } from "../../components/Button.tsx";
import { findFriendByUsername, getOnlineFriends, getUnseenMsg, sendFriendInvite } from "../../api/homePageRequests.ts";
import Modal from "../../components/Modal.tsx";
import { CustomResponse } from "../../api/api.ts";

export interface Friends {
    friends: Friend[];
    pending: Friend[];
}

export interface Friend {
    userId: string;
    username: string;
    picture?: string;
    status?: string;
    unseenMessage?: boolean;
}

export interface FriendsPanelRef {
    updateFriendStatus: (userId: string, status: string) => void;
    requestAccepted: (acceptor: Friend) => void;
    requestDeclined: (declinerId: string) => void;
    addUnseenMsg: (userId: string) => void;
    getAvailableFriends: () => Friend[];
    getFriendById: (userId: string) => Friend | undefined;
}

const FriendsPanel = forwardRef((
    props: {
        friends: Friends,
        modalSetter: (modal: ReactElement | null) => void,
        chatOpen: (friend: Friend) => void,
        openCreateGamePanel: (friend: Friend) => void },
    ref
) => {

    const [open, setOpen] = useState(false);
    const [friendList, setFriendList] = useState<Friend[]>([]);
    const [pendingList, setPendingList] = useState<Friend[]>([]);
    const [forceUpdate, setForceUpdate] = useState(true);
    const [unseenMessages, setUnseenMessages] = useState(false);

    const ListedFriend: FC<Friend> = ((friend) => {

        const removeUnseenMsg = (userId: string) => {
            setFriendList(prevState => {
                if (prevState) {
                    const newState = prevState;

                    const index = newState.findIndex(friend => friend.userId === userId);
                    if (index !== -1) {
                        newState[index].unseenMessage = false;
                        return newState;
                    } else {
                        return prevState;
                    }
                } else {
                    return prevState;
                }
            });
        }

        const openChatWithFriend = () => {
            removeUnseenMsg(friend.userId);
            props.chatOpen(friend);
        }

        return (
            <li key={friend.userId} className={`friend ${friend.status} ${friend.unseenMessage ? "unseen-msg" : ""}`}>
                <div className={`user-avatar-container`}>
                    <div className="status-indicator" title={friend.status}></div>
                    <img src={`./avatars/${friend.picture || "1"}.jpg`} alt="" />
                </div>
                <div>
                    <h1 className="px-2">
                        {friend.username}
                    </h1>
                    <div className="flex mt-1 ml-2 relative">
                        <small className="status-title">
                            {friend.status}
                        </small>
                        {friend.status !== "pending" &&
                            <div className="friend-options">
                                <IconButton text="Message" icon="message" onClick={openChatWithFriend} />
                                { friend.status === "online" &&
                                    <IconButton
                                        text="Invite"
                                        icon="add"
                                        onClick={() => props.openCreateGamePanel(friend)}
                                    />
                                }
                            </div>
                        }
                    </div>
                </div>
            </li>
        )
    });

    const reRender = () => {
        setForceUpdate(false);
        setInterval(() => {
            setForceUpdate(true);
        }, 10);
    }

    const AddFriend = () => {
        const [loading, setLoading] = useState(false);
        const [searchResult, setSearchResult] = useState<Friend | undefined>();
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

                        setPendingList([...pendingList, invitedFriend]);
                    }

                    setInviteResult(result);
                });
            }
        }

        const findFriend = async () => {
            if (searchQuery.trim()) {
                setLoading(true);
                findFriendByUsername(searchQuery).then(result => {
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
            <Modal close={() => props.modalSetter(null)}>
                <div className="flex flex-col gap-4 p-5 items-center w-fit">
                    {searchResult && !inviteResult ?
                        <>
                            <div className="flex items-end gap-2">
                                <img src={`./avatars/${searchResult.picture || "1"}.jpg`} alt="" />
                                <h1 className="text-2xl">{searchResult.username}</h1>
                            </div>
                            <div className="hr"></div>
                            <div className="flex gap-4">
                                <Button text="Back" onClick={() => setSearchResult(undefined)} />
                                <Button text="Invite" onClick={inviteFriend} />
                            </div>
                        </>
                        :
                        <>
                            {inviteResult ?
                                <>
                                    {inviteResult.body && "message" in inviteResult.body &&
                                        <p className={`text-center max-w-80 px-4 ${inviteResult.ok ? "" : "error-text"}`}>
                                            {inviteResult.body.message}
                                        </p>
                                    }
                                    <div className="hr"></div>
                                    <Button text={"Close"} onClick={() => props.modalSetter(null)} />
                                </>
                                :
                                <>
                                    <p className="text-center px-4">
                                        Enter the username of the friend you want to add
                                    </p>
                                    <div className="hr"></div>
                                    {!found &&
                                        <p className="error-text text-sm text-center px-4">
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

    const updateFriendStatus = (userId: string, status: string) => {
        setFriendList(prevState => {
            if (prevState) {
                const newState = prevState;

                const index = newState.findIndex(friend => friend.userId === userId);
                if (index !== -1) {
                    newState[index].status = status;
                    return newState;
                } else {
                    return prevState;
                }
            } else {
                return prevState;
            }
        });

        reRender();
    }

    const requestAccepted = (acceptor: Friend) => {
        setPendingList(prevState => {
            if (prevState) {
                return prevState.filter(friend => friend.userId !== acceptor.userId);
            } else {
                return prevState;
            }
        });

        setFriendList(prevState => {
            if (prevState) {
                return [...prevState, acceptor];
            } else {
                return prevState;
            }
        });

        reRender();
    }

    const requestDeclined = (declinerId: string) => {
        setPendingList(prevState => {
            if (prevState) {
                return prevState.filter(friend => friend.userId !== declinerId);
            } else {
                return prevState;
            }
        });

        reRender();
    }

    const addUnseenMsg = (userId: string) => {
        setFriendList(prevState => {
            if (prevState) {
                const newState = prevState;

                const index = newState.findIndex(friend => friend.userId === userId);
                if (index !== -1) {
                    newState[index].unseenMessage = true;
                    return newState;
                } else {
                    return prevState;
                }
            } else {
                return prevState;
            }
        });

        reRender();
    }

    useImperativeHandle(ref, () => ({
        updateFriendStatus : updateFriendStatus,
        requestAccepted : requestAccepted,
        requestDeclined : requestDeclined,
        addUnseenMsg : addUnseenMsg,
        getAvailableFriends: () => friendList.filter(friend => friend.status === "online"),
        getFriendById: (userId: string) => friendList.find(friend => friend.userId === userId)
    }), [friendList]);

    const getOnlineFriendsAndUnseenMsg = async (friends: Friend[]) => {
        const onlineFriends = await getOnlineFriends();
        const unseenMessages = await getUnseenMsg();

        const updatedFriends = friends.map(friend => ({
            ...friend,
            status: friend.status || "offline",
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
                    updatedFriends[index].status = friend["busy"] ? "busy" : "online";
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

        setFriendList(updatedFriends);
    }

    useEffect(() => {
        if (props.friends && props.friends.friends.length > 0) {
            getOnlineFriendsAndUnseenMsg(props.friends.friends).then(() => {
                setPendingList(props.friends.pending);
            });
        }
    }, [props.friends]);

    useEffect(() => {
        if (!forceUpdate) {
            let unseenMsgCount = 0

            friendList.forEach(friend => {
                if (friend.unseenMessage) {
                    unseenMsgCount++;
                }
            });

            setUnseenMessages(unseenMsgCount > 0);
        }
    }, [friendList, forceUpdate]);

    return (
        <div className={`friends-panel-container ${open ? "friends-open" : "friends-closed"}`}>
            { forceUpdate ?
                <>
                    {!unseenMessages ?
                        <IconButton text="Friends" icon="friends" decorated onClick={() => setOpen(!open)} />
                        :
                        <button
                            title="Check unseen messages"
                            className={`decorative-hex icon-btn`}
                            onClick={() => setOpen(!open)}
                        >
                            <div className="unseen-msg-icon" ></div>
                            <i className={`fa-solid fa-envelope text-gold`} ></i>
                        </button>
                    }
                </>
                :
                ""
            }
            <div className="friends-panel">
                <div className="friends-panel-frame"></div>
                <div className="friends-panel-content">
                    <div className="flex w-full justify-center"></div>
                    { forceUpdate ?
                        <ul>
                            {friendList && friendList.map(friend =>
                                <ListedFriend
                                    userId={friend.userId}
                                    username={friend.username}
                                    picture={friend.picture}
                                    status={friend.status}
                                    unseenMessage={friend.unseenMessage}
                                    key={friend.userId}
                                />
                            )}
                            {pendingList && pendingList.map(friend =>
                                <ListedFriend
                                    userId={friend.userId}
                                    username={friend.username}
                                    picture={friend.picture}
                                    status="pending"
                                    key={friend.userId}
                                />
                            )}
                        </ul>
                        :
                        ""
                    }
                    <div className="flex w-full justify-center items-center p-2">
                        <Button text="+ Friend" onClick={() => props.modalSetter(<AddFriend />)} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FriendsPanel;