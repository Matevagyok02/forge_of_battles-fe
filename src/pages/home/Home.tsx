import styles from "../../styles/home_page/Home.module.css";
import {useContext, useEffect, useRef, useState} from "react";
import {IMatch, IReceiver, ISender, IUser} from "../../interfaces.ts";
import FriendsPanel, {FriendStatus, IFriend} from "./friends_panel/FriendsPanel.tsx";
import {io, Socket} from "socket.io-client";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "../../context.tsx";
import JoinGame from "./main_interface_components/JoinGame.tsx";
import {AuthPanel, UserPanel} from "./UserPanel.tsx";
import Registration from "./Registration.tsx";
import CreateGame from "./main_interface_components/CreateGame.tsx";
import Requests from "./Requests.tsx";
import {useNavigate} from "react-router-dom";
import OptionCardButtons from "./main_interface_components/OptionCardButton.tsx";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import {WindowFrame} from "../../components/Frame.tsx";
import Chat, {ChatRef} from "./chat/Chat.tsx";
import {useActiveMatches, useUser} from "../../api/hooks.tsx";

const Home = () => {

    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    const { _user, setUser } = useContext(UserContext);
    const { friends, setFriends } = useContext(FriendsContext);
    const { openInfoModal, openedModal, openModal, openForcedModal} = useContext(ModalContext);

    const [socket, setSocket] = useState<Socket>();
    const [friendRequests, setFriendRequests] = useState<ISender[]>([]);
    const [gameRequests, setGameRequests] = useState<IMatch[]>([]);

    const chatRef = useRef<ChatRef | null>(null);

    const openChat = (friend: IFriend) => {
        if (chatRef.current) {
            chatRef.current!.openChat(friend);
        }
    }

    const fetchUser = useUser();

    useEffect(() => {
        if (fetchUser.isSuccess) {
            const data = fetchUser.data.data;

            const requests = processRequests(data.user);

            setFriends({
                friends: data.friends,
                pending: requests.outgoing
            });
            setFriendRequests(requests.incoming);
            setUser(data.user);
        }
    }, [fetchUser.data]);

    useEffect(() => {
        if (fetchUser.isError && fetchUser.error.status === 404) {
            openForcedModal(
                <Registration/>
            );
        }
    }, [fetchUser.isError]);

    useEffect(() => {
        if (isAuthenticated && user?.sub) {
            setUpSocket(user.sub);
        } else if (socket) {
            socket.disconnect();
            setSocket(undefined);

        }
    }, [isAuthenticated, user?.sub]);

    const processRequests = (user: IUser) => {
        const incoming: ISender[] = [];
        const outgoing: IReceiver[] = [];

        user.requests.forEach(request => {
            if (request.fromId !== user.userId) {
                const sender = {
                    userId: request.fromId,
                    username: request.userProps.username,
                    picture: request.userProps.picture,
                }
                incoming.push(sender);
            } else {
                const receiver = {
                    userId: request.toId,
                    username: request.userProps.username,
                    picture: request.userProps.picture,
                    status: FriendStatus.pending,
                    unseenMessage: false
                }
                outgoing.push(receiver);
            }
        });

        return { incoming, outgoing };
    }

    const refreshGameCreation = () => {
        openModal(<CreateGame/>)
    };

    const setUpSocket = (userId: string) => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL,
            {
                auth: { userId: userId },
            }
        );

        socket.on("friend-request", (sender) => {
            if (friendRequests) {
                setFriendRequests([...friendRequests, sender]);
            } else {
                setFriendRequests([sender]);
            }
        });

        socket.on("friend-request-accepted", (acceptor) => {
            const friend = acceptor as IFriend;
            if (friends && friend) {
                setFriends(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            friends: [...prevState.friends, friend],
                            pending: prevState.pending.filter(friend => friend.userId !== acceptor.userId)
                        }
                    } else {
                        return prevState;
                    }
                });

                openInfoModal(
                    <div className="flex flex-col gap-2 px-4" >
                        <p className="text-center" >
                            The following user has accepted your friend request:
                        </p>
                        <div className="flex items-end justify-center gap-2" >
                            <AvatarDisplay avatar={acceptor.picture} />
                            <h1 className="text-2xl" >{acceptor.username}</h1>
                        </div>
                    </div>
                );
            }
        });

        socket.on("friend-request-declined", (decliner) => {
            const userId = (decliner as IFriend).userId;
            if (friends && userId) {
                setFriends(prevState => {
                    if (prevState)
                        return {
                            ...prevState,
                            pending: prevState.pending.filter(friend => friend.userId !== userId)
                        }
                    else
                        return prevState;
                });

                openInfoModal(
                    <div className="flex flex-col gap-2 px-4" >
                        <p className="text-center" >
                            The following user has declined your friend request:
                        </p>
                        <div className="flex items-end justify-center gap-2" >
                            <img className="user-avatar" src={`./avatars/${decliner.picture || "1"}.jpg`} alt="" />
                            <h1 className="text-2xl" >{decliner.username}</h1>
                        </div>
                    </div>
                );
            }
        });

        socket.on("friend-connected", (friend) => {
            const friendId = (friend as IFriend).userId;

            setFriends(prevState => {
                if (prevState) {
                    const updatedFriends = prevState.friends.map(f =>
                        f.userId === friendId ? { ...f, status: FriendStatus.online } : f
                    );
                    return { ...prevState, friends: updatedFriends };
                } else {
                    return prevState;
                }
            });

            if (chatRef.current) {
                chatRef.current!.changeStatus(friendId, FriendStatus.online);
            }
        });

        socket.on("friend-disconnected", (friend) => {
            const friendId = (friend as IFriend).userId;

            setFriends(prevState => {
                if (prevState) {
                    const updatedFriends = prevState.friends.map(f =>
                        f.userId === friendId ? { ...f, status: FriendStatus.offline } : f
                    );
                    return { ...prevState, friends: updatedFriends };
                } else {
                    return prevState;
                }
            });

            if (chatRef.current) {
                chatRef.current!.changeStatus(friendId, FriendStatus.offline);
            }
        });

        socket.on("chat-message", (message) => {
            if (chatRef.current) {
                chatRef.current!.addMessage(message);
            }
            else if (friends) {
                setFriends(prevState => {
                    if (prevState) {
                        const newState = prevState;
                        const friend = newState.friends.find(friend => friend.userId === message.from);
                        if (friend) {
                            friend.unseenMessage = true;
                        }
                        return newState;
                    } else {
                        return prevState;
                    }
                });
            }
        });

        socket.on("match-invite", (match) => {
            if (gameRequests) {
                setGameRequests([...gameRequests, match]);
            } else {
                setGameRequests([match]);
            }
        });

        socket.on("match-invite-declined", (decliner) => {
            openInfoModal(
                <div className="flex flex-col gap-2 px-4" >
                    <p className="text-center" >
                        The following user has declined your match invite:
                    </p>
                    <div className="flex items-end justify-center gap-2" >
                        <AvatarDisplay avatar={decliner.picture} />
                        <h1 className="text-2xl" >{decliner.username}</h1>
                    </div>
                </div>,
                refreshGameCreation
            );
        });

        socket.on("match-invite-accepted", (key: string) => {
            navigate("/preparation/" + key);
        });

        socket.on("random-match-found", (key: string) => {
            navigate("/preparation/" + key);
        });

        socket.emit('register', user!.sub);

        setSocket(socket);
    }

    const fetchActiveMatch = useActiveMatches();

    useEffect(() => {
        if(fetchActiveMatch.isSuccess) {
            const activeMatches = fetchActiveMatch.data.data;
            if (activeMatches.created) {
                openModal(<CreateGame _lastCreatedMatch={activeMatches.created} />);
            } else if (activeMatches.active) {
                openModal(<JoinGame activeMatch={activeMatches.active} />);
            } else if (activeMatches.inQueue) {
                openModal(<JoinGame inQueue={true} />);
            }
        }
    }, [fetchActiveMatch.data]);

    return(
        <WindowFrame>
            <main className={styles.home} >
                <div>
                    <div>
                        <div className={styles.textLogo} ></div>
                        { openedModal ?
                            openedModal
                            :
                            <OptionCardButtons />
                        }
                    </div>
                    { _user ?
                        <>
                            <UserPanel />
                            { friends &&
                                <>
                                    <FriendsPanel
                                        openChat={openChat}
                                    />
                                    <Chat ref={chatRef} />
                                    <Requests
                                        gameReq={gameRequests}
                                        friendReq={friendRequests}
                                        setGameReq={setGameRequests}
                                        setFriendReq={setFriendRequests}
                                    />
                                </>
                            }
                        </>
                        :
                        <AuthPanel />
                    }
                </div>
            </main>
        </WindowFrame>
    );
}

export default Home;