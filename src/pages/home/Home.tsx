import "./Home.css";
import "./FriendsPanel.css";
import "./ChatTab.css";
import {Button, IconButton} from "../../components/Button.tsx";
import {FC, useCallback, useEffect, useRef, useState, useContext, ReactElement} from "react";
import {getUser} from "../../api/homePageRequests.ts";
import {IUser, IMatch, ISender, IUserResponseBody, IReceiver} from "../../interfaces.ts";
import FriendsPanel, {Friend, FriendStatus} from "./FriendsPanel.tsx";
import {io} from "socket.io-client";
import ChatTab, {ChatRef, Message} from "./ChatTab.tsx";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "../../Context.tsx";
import JoinGame from "./JoinGame.tsx";
import UserPanel from "./UserPanel.tsx";
import Registration from "./Registration.tsx";
import AuthRequiredDialog from "../../components/AuthRequiredDialog.tsx";
import CreateGame from "./CreateGame.tsx";
import TutorialAndCards from "./TutorialAndCards.tsx";
import {GameRequest, FriendRequest} from "./Requests.tsx";
import {useNavigate} from "react-router-dom";

const Home = () => {

    const navigate = useNavigate();
    const { user, isAuthenticated, login } = useContext(AuthContext);
    const { _user, setUser } = useContext(UserContext);
    const { friends, setFriends } = useContext(FriendsContext);
    const { openInfoModal, openedModal, openModal, closeModal, openForcedModal, closeForcedModal} = useContext(ModalContext);

    const [friendRequests, setFriendRequests] = useState<ISender[]>();
    const [gameRequests, setGameRequests] = useState<IMatch[]>();
    const [chatPartners, setChatPartners] = useState<Friend[]>([]);

    const chatRef = useRef<Map<string, ChatRef>>(new Map());

    const openChat = useCallback((friend: Friend) => {
        setChatPartners(prevState => {
            if (prevState && prevState.findIndex(partner => partner.userId === friend.userId) === -1) {
                return [...prevState, friend];
            } else {
                return [friend];
            }
        });
    }, []);

    const closeChat = useCallback((id: string) => {
        setChatPartners(prevState => {
            if (prevState) {
                return prevState.filter(partner => partner.userId !== id);
            } else {
                return prevState;
            }
        });
        chatRef.current.delete(id);
    }, []);

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
        closeModal();
        setTimeout(() => openModal(<CreateGame/>), 0);
    };

    const setUpSocket = () => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL,
            {
                auth: { userId: user!.sub },
            }
        );

        socket.emit('register', user!.sub);

        socket.on("friend-request", (sender) => {
            if (friendRequests) {
                setFriendRequests([...friendRequests, sender]);
            } else {
                setFriendRequests([sender]);
            }
        });

        socket.on("friend-request-accepted", (acceptor) => {
            const friend = acceptor as Friend;
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
                            <img src={`./avatars/${acceptor.picture || "1"}.jpg`} alt="" />
                            <h1 className="text-2xl" >{acceptor.username}</h1>
                        </div>
                    </div>
                );
            }
        });

        socket.on("friend-request-declined", (decliner) => {
            const userId = (decliner as Friend).userId;
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
                            <img src={`./avatars/${decliner.picture || "1"}.jpg`} alt="" />
                            <h1 className="text-2xl" >{decliner.username}</h1>
                        </div>
                    </div>
                );
            }
        });

        socket.on("friend-connected", (friend) => {
            const friendId = (friend as Friend).userId;

            setFriends(prevState => {
                if (prevState) {
                    const updatedFriends = prevState.friends.map(f =>
                        f.userId === friendId ? { ...f, status: FriendStatus.Online } : f
                    );
                    return { ...prevState, friends: updatedFriends };
                } else {
                    return prevState;
                }
            });

            if (chatRef.current && chatRef.current.has(friendId)) {
                chatRef.current.get(friendId)?.changeStatus(FriendStatus.Online);
            }
        });

        socket.on("friend-disconnected", (friend) => {
            const friendId = (friend as Friend).userId;

            setFriends(prevState => {
                if (prevState) {
                    const updatedFriends = prevState.friends.map(f =>
                        f.userId === friendId ? { ...f, status: FriendStatus.Offline } : f
                    );
                    return { ...prevState, friends: updatedFriends };
                } else {
                    return prevState;
                }
            });

            if (chatRef.current && chatRef.current.has(friendId)) {
                chatRef.current.get(friendId)?.changeStatus(FriendStatus.Offline);
            }
        });

        socket.on("chat-message", (message) => {
            if (chatRef.current && chatRef.current.has(message.from)) {
                chatRef.current.get(message.from)?.addMessage({
                    senderId: message.from,
                    messageText: message.text,
                    createdAt: new Date(),
                    selfWritten: false
                } as Message);
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
                        <img src={`./avatars/${decliner.picture || "1"}.jpg`} alt="" />
                        <h1 className="text-2xl" >{decliner.username}</h1>
                    </div>
                </div>,
                refreshGameCreation
            );
        });

        socket.on("match-invite-accepted", (key) => {
            navigate("/preparation/" + key);
        });
    }

    const OptionCardButton: FC<{id: string}> = ({id}) => {

        const content = optionCardContent[id];

        const openOption = () => {
            if (!isAuthenticated && id !== "tutorialAndCards") {
                let modalToBeOpened: ReactElement | undefined;

                switch (id) {
                    case "createGame":
                        modalToBeOpened = <CreateGame />;
                        break;
                    case "joinGame":
                        modalToBeOpened = <JoinGame />;
                        break;
                    default:
                        break;
                }

                openModal(<AuthRequiredDialog modalToBeOpened={modalToBeOpened} />);
            } else {
                switch (id) {
                    case "createGame":
                        if (_user) {
                            openModal(<CreateGame />);
                        }
                        break;
                    case "joinGame":
                        if (_user) {
                            openModal(<JoinGame />);
                        }
                        break;
                    case "tutorialAndCards":
                        openModal(<TutorialAndCards />);
                        break;
                    default:
                        break;
                }
            }
        }

        return(
            content &&
            <div id={id} className="option-card-btn" onClick={openOption} >
                <div>
                    <h1 className="gold-text" >
                        {content.title}
                    </h1>
                    <p>
                        {content.description}
                    </p>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (!_user && isAuthenticated) {
            loadUser();
            setUpSocket();
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

    return(
        <main className="home" >
            <div>
                <div className="h-[100vh] w-fit" >
                    <div className="title-text" ></div>
                    { openedModal ?
                        openedModal
                        :
                        <div className="option-card-btn-container">
                            <OptionCardButton id="createGame" />
                            <OptionCardButton id="joinGame" />
                            <OptionCardButton id="tutorialAndCards" />
                        </div>
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
                                <div className="chat-panel" >
                                    {chatPartners.map(partner => (
                                        <ChatTab
                                            key={partner.userId}
                                            friend={partner}
                                            userId={_user.userId}
                                            closeChat={closeChat}
                                            ref={(ref: ChatRef) => {
                                                if (ref) {
                                                    chatRef.current.set(partner.userId, ref);
                                                } else {
                                                    chatRef.current.delete(partner.userId);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        }
                    </>
                    :
                    <div className="auth-panel" >
                        { !isAuthenticated &&
                            <Button
                                text="Log In &nbsp; Register"
                                onClick={login}
                            />
                        }
                        <div className="settings" >
                            <IconButton text="Music" icon="music" decorated onClick={() => alert("TODO")} />
                            <IconButton text="Sound" icon="sound" decorated onClick={() => alert("TODO")} />
                        </div>
                    </div>
                }
            </div>
        </main>
    );
}

const optionCardContent: { [key: string]: { title: string, description: string } } = {
    createGame: {
        title: "Create Game",
        description: "Create a game room, set a time limit and invite other players for a battle"
    },
    joinGame: {
        title: "Join Game",
        description: "Fight against your friend using a key, or join a random game to play with a stranger"
    },
    tutorialAndCards: {
        title: "Tutorial & Cards",
        description: "Play the tutorial to learn the game mechanics or browse the game rules and cards"
    }
}

export default Home;