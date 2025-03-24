import styles from "../../styles/home_page/Home.module.css";
import {useContext, useEffect, useRef, useState} from "react";
import {getUser} from "../../api/user.ts";
import {IMatch, IReceiver, ISender, IUser, IUserResponseBody} from "../../interfaces.ts";
import FriendsPanel, {FriendStatus, IFriend} from "./friends_panel/FriendsPanel.tsx";
import {io, Socket} from "socket.io-client";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "../../context.tsx";
import JoinGame from "./main_interface_components/JoinGame.tsx";
import {AuthPanel, UserPanel} from "./UserPanel.tsx";
import Registration from "./Registration.tsx";
import CreateGame from "./main_interface_components/CreateGame.tsx";
import {FriendRequest, GameRequest} from "./Requests.tsx";
import {useNavigate} from "react-router-dom";
import {getActiveMatch, getLastCreatedGame} from "../../api/match.ts";
import OptionCardButtons from "./main_interface_components/OptionCardButton.tsx";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import {WindowFrame} from "../../components/Frame.tsx";
import Chat, {ChatRef} from "./chat/Chat.tsx";

const Home = () => {

    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    const { _user, setUser } = useContext(UserContext);
    const { friends, setFriends } = useContext(FriendsContext);
    const { openInfoModal, openedModal, openModal, openForcedModal, closeForcedModal} = useContext(ModalContext);

    const [socket, setSocket] = useState<Socket>();
    const [friendRequests, setFriendRequests] = useState<ISender[]>();
    const [gameRequests, setGameRequests] = useState<IMatch[]>();

    const chatRef = useRef<ChatRef | null>(null);

    const openChat = (friend: IFriend) => {
        if (chatRef.current) {
            chatRef.current!.openChat(friend);
        }
    }

    const loadUser = () => {
        getUser().then( userObj => {
            if (user && userObj.ok && userObj.body) {
                const userResponseObj = userObj.body as IUserResponseBody;

                sessionStorage.setItem("user", JSON.stringify(userResponseObj.user));
                localStorage.setItem("signedUp", "true");

                const newUser = userResponseObj.user as IUser;

                setUser(newUser);

                const requests = newUser.requests;

                if (Array.isArray(requests)) {
                    const incomingRequests: ISender[] = [];
                    const outgoingRequests: IReceiver[] = [];

                    requests.forEach(request => {
                        if (request.fromId !== newUser.userId) {
                            const sender = {
                                userId: request.fromId,
                                username: request.userProps.username,
                                picture: request.userProps.picture,
                            }
                            incomingRequests.push(sender);
                        } else {
                            const receiver = {
                                userId: request.toId,
                                username: request.userProps.username,
                                picture: request.userProps.picture,
                                status: "pending",
                                unseenMessage: false
                            }
                            outgoingRequests.push(receiver);
                        }
                    });

                    setFriends({
                        friends: userResponseObj.friends,
                        pending: outgoingRequests
                    });

                    setFriendRequests(incomingRequests);
                }
            } else if (userObj.status === 404) {
                openForcedModal(<Registration/>);
            }
        });
    }

    const refreshGameCreation = () => {
        openModal(<CreateGame/>)
    };

    const setUpSocket = () => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL,
            {
                auth: { userId: user!.sub },
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

    useEffect(() => {
        if (isAuthenticated) {
            if (!_user) {
                loadUser();
            }
            setUpSocket();
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(undefined);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (gameRequests && gameRequests!.length > 0) {
            openForcedModal(
                <GameRequest
                    match={gameRequests[0]}
                    onResolve={() => setGameRequests(gameRequests!.slice(1, gameRequests!.length - 1))}
                />
            );
        } else if (friendRequests && friendRequests!.length > 0) {
            openForcedModal(
                <FriendRequest
                    sender={friendRequests[0]}
                    onResolve={() => setFriendRequests(friendRequests!.slice(1, friendRequests!.length - 1))}
                />
            );
        } else {
            closeForcedModal();
        }
    }, [friendRequests, gameRequests]);

    useEffect(() => {
        if (_user) {
            getLastCreatedGame().then(result => {
                if (result.ok && result.body) {
                    const match = result.body as IMatch;

                    openModal(<CreateGame _lastCreatedMatch={match} />);
                } else {
                    getActiveMatch().then(result => {
                        if (result.ok && result.body) {
                            if ((result.body as IMatch).key) {
                                openModal(<JoinGame activeMatch={result.body as IMatch} />);
                            } else {
                                openModal(<JoinGame inQueue={true} />);
                            }
                        }
                    });
                }
            });
        }
    }, [_user]);

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