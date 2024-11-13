import "./Home.css";
import "./FriendsPanel.css";
import "./ChatTab.css";
import {Button, IconButton} from "../../components/Button.tsx";
import {FC, LegacyRef, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {
    acceptFriendRequest,
    changePicture, createGame,
    declineFriendRequest,
    getUser,
    joinGameWithKey,
    registerNewUser
} from "../../api/homePageRequests.ts";
import Modal, {ForcedModal, InfoModal} from "../../components/Modal.tsx";
import FriendsPanel, {Friend, Friends, FriendsPanelRef} from "./FriendsPanel.tsx";
import {io} from "socket.io-client";
import ChatTab, {ChatRef, Message} from "./ChatTab.tsx";

const Home = () => {

    const { user, isAuthenticated, logout, loginWithPopup } = useAuth0();

    const [_user, setUser] = useState<User>();
    const [friends, setFriends] = useState<Friends>();
    const [friendRequests, setFriendRequests] = useState<Sender[]>();
    const [gameRequests, setGameRequests] = useState<object[]>();
    const [chatPartners, setChatPartners] = useState<Friend[]>([]);

    const [openedInfoModal, setOpenedInfoModal] = useState<ReactElement[]>([]);
    const [openedModal, setOpenedModal] = useState<ReactElement | null>(null);
    const [openedForcedModal, setOpenedForcedModal] = useState<ReactElement | null>(null);
    const [modalToBeOpened, setModalToBeOpened] = useState<ReactElement>();

    const friendsRef = useRef<FriendsPanelRef>();
    const chatRef = useRef<Map<string, ChatRef>>(new Map());

    const customLogout = async () => {
        await logout({logoutParams: {returnTo: window.location.origin }});
    }

    const openModal = useCallback((modalComponent: ReactElement | null) => {
        setOpenedModal(modalComponent);
    }, []);

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

    const openCreateGameWithInvite = useCallback((friend: Friend) => {
        if (_user) {
            setOpenedModal(<CreateGame friend={friend} />);
        }
    }, [_user]);

    const openInfoModal = (infoModal: ReactElement) => {
        setOpenedInfoModal(prevState => {
            if (prevState.findIndex(modal => modal.key === infoModal.key) === -1) {
                return [...prevState, infoModal];
            } else {
                return prevState;
            }
        });
    }

    const closeInfoModal = (index: number) => {
        setOpenedInfoModal(prevState => prevState.filter((_, i) => i !== index));
    }

    const addFriend = (friend: Friend) => {
        setFriends(prevState => {
            if (prevState) {
                return {
                    friends: [...prevState.friends, friend],
                    pending: prevState.pending
                }
            } else {
                return prevState;
            }
        });
    }

    const loadUser = () => {
        getUser().then( userObj => {
            if (user && userObj.ok && userObj.body) {
                const userResponseObj = userObj.body as UserResponseBody;

                sessionStorage.setItem("user", JSON.stringify(userResponseObj.user));
                localStorage.setItem("signedUp", "true");

                const newUser = userResponseObj.user as User;

                setUser(newUser);

                const requests = newUser.requests;

                if (Array.isArray(requests)) {
                    const incomingRequests: Sender[] = [];
                    const outgoingRequests: Receiver[] = [];

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
                setOpenedModal(<Registration/>);
            }
        });
    }

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
            if (friendsRef.current && friend) {
                friendsRef.current?.requestAccepted(friend);
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
            if (friendsRef.current && userId) {
                friendsRef.current?.requestDeclined(userId);
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
            if (friendsRef.current) {
                friendsRef.current?.updateFriendStatus(friendId, "online");
            }
            if (chatRef.current && chatRef.current.has(friendId)) {
                chatRef.current.get(friendId)?.changeStatus("online");
            }
        });

        socket.on("friend-disconnected", (friend) => {
            const friendId = (friend as Friend).userId;
            if (friendsRef.current) {
                friendsRef.current?.updateFriendStatus(friendId, "offline");
            }
            if (chatRef.current && chatRef.current.has(friendId)) {
                chatRef.current.get(friendId)?.changeStatus("offline");
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
            } else {
                friendsRef.current?.addUnseenMsg(message.from);
            }
        });

        socket.on("match-invite", (match) => {
            if (gameRequests) {
                setGameRequests([...gameRequests, match]);
            } else {
                setGameRequests([match]);
            }
        });
    }

    const FriendRequest: FC<{sender: Sender, onResolve: () => void}> = ({sender, onResolve}) => {

        const [loading, setLoading] = useState(false);

        const acceptRequest = () => {
            setLoading(true);

            acceptFriendRequest(sender.userId).then(result => {
                if (result.ok && friendRequests) {
                    addFriend(sender as Friend);
                    onResolve();
                } else {
                    setLoading(false);
                    alert("An unexpected server error has occurred");
                }
            });
        }

        const declineRequest = () => {
            setLoading(true);

            declineFriendRequest(sender.userId).then(result => {
                if (result.ok && friendRequests) {
                    onResolve();
                } else {
                    setLoading(false);
                    alert("An unexpected server error has occurred");
                }
            });
        }

        return(
            <ForcedModal>
                <div className="flex flex-col items-center gap-4 p-4" >
                    <div className="flex items-end gap-2" >
                        <img src={`./avatars/${sender.picture || "1"}.jpg`} alt="" />
                        <h1 className="text-2xl" >{sender.username}</h1>
                    </div>
                    <div className="hr" ></div>
                    <div className="flex gap-4" >
                        <Button
                            text="Decline"
                            onClick={declineRequest}
                            loading={loading}
                        />
                        <Button
                            text="Accept"
                            onClick={acceptRequest}
                            loading={loading}
                        />
                    </div>
                </div>
            </ForcedModal>
        );
    }

    const GameRequest: FC<{match: object, onResolve: () => void}> = ({match, onResolve}) => {

        const [loading, setLoading] = useState(false);
        const [inviter, setInviter] = useState<Friend>();
        const [searchInterval, setSearchInterval] = useState<number | undefined>();

        const acceptRequest = () => {
            setLoading(true);
            onResolve();
            //TODO
        }

        const declineRequest = () => {
            setLoading(true);
            onResolve();
            //TODO
        }

        useEffect(() => {
            let interval: number | undefined;

            if (friendsRef.current && "player1Id" in match) {
                interval = setInterval(() => {
                    setInviter(
                        friendsRef.current?.getAvailableFriends().find(friend => friend.userId === match.player1Id)
                    );
                }, 1000);

                setSearchInterval(interval);
            }

            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            }
        }, [friendsRef.current]);

        useEffect(() => {
            if (inviter && searchInterval) {
                clearInterval(searchInterval);
            }
        }, [inviter]);

        return(
            inviter &&
            <ForcedModal>
                <div className="flex flex-col items-center gap-4 p-4" >
                    <div className="flex items-end gap-2" >
                        <img src={`./avatars/${inviter.picture || "1"}.jpg`} alt="" />
                        <h1 className="text-2xl" >{inviter.username}</h1>
                    </div>
                    <div className="hr" ></div>
                    <div className="flex gap-4" >
                        <Button
                            text="Decline"
                            onClick={declineRequest}
                            loading={loading}
                        />
                        <Button
                            text="Accept"
                            onClick={acceptRequest}
                            loading={loading}
                        />
                    </div>
                </div>
            </ForcedModal>
        );
    }

    const TutorialAndCards: FC = () => {

        return(
            <Modal close={() => setOpenedModal(null)} >
                <div className="tutorial-and-cards-panel" >
                    <div>
                        <div className="decorative-hex" id="tutorial" >

                        </div>
                        <p>
                            Play the tutorial to learn the game mechanics and how to play
                        </p>
                        <Button text="Tutorial  " onClick={() => alert("TODO")} />
                    </div>
                    <span className="vr" ></span>
                    <div>
                        <div className="decorative-hex" id="rules" >

                        </div>
                        <p>
                            Check our set of rules to learn how to play the game
                        </p>
                        <Button text="Rules     " onClick={() => alert("TODO")} />
                    </div>
                    <span className="vr" ></span>
                    <div>
                        <div className="decorative-hex" id="cards" >
                        </div>
                        <p>
                            Browse cards from each deck, learn their about their abilities and how to use them
                        </p>
                        <Button text="Cards     " onClick={() => alert("TODO")} />
                    </div>
                </div>
            </Modal>
        );
    }

    const CreateGame: FC<{ friend?: Friend }> = ({friend}) => {

        const [friendToInvite, setFriendToInvite] = useState<Friend | undefined>(friend);
        const [timeLimit, setTimeLimit] = useState<number>();
        const [key, setKey] = useState<string>();
        const [errorMsg, setErrorMsg] = useState<string>();
        const [loading, setLoading] = useState<boolean>(false);
        const [availableFriends, setAvailableFriends] = useState<Friend[]>();

        const friendSelect = useRef<HTMLSelectElement | null>(null);

        const minTimeLimit = 15;
        const maxTimeLimit = 60;
        const step = 15;

        const getLink = (key?: string) => {
            return `${window.location.origin}/join/${key}`
        }

        const changeTimeLimit = (input: number) => {
            setTimeLimit(input === maxTimeLimit ? undefined : input);
        }

        const changeFriendToInvite = (friendId: string | undefined) => {
            if (friendId && availableFriends) {
                setFriendToInvite(availableFriends.find(friend => friend.userId === friendId));
            } else {
                setFriendToInvite(undefined);
            }
        }

        const openSelect = useCallback(() => {
            if (friendSelect.current && availableFriends && availableFriends.length > 0) {
                friendSelect.current!.showPicker();
            } else {
                openInfoModal(
                  <div className="text-center flex flex-col px-4" >
                      <p>
                          You have no friends available to invite
                      </p>
                      <small className="w-1 min-w-full" >
                          (If you see an active friend on your "Friend Panel", wait a few seconds and try again)
                      </small>
                  </div>
                );
            }
        }, [friendSelect, availableFriends]);

        const create = () => {
            setLoading(true);

            createGame(timeLimit, friendToInvite?.userId).then(result => {
                if (result.ok && result.body && "key" in result.body) {
                    setErrorMsg(undefined);
                    setKey(result.body.key as string);
                } else if (result.status === 409 && result.body && "message" in result.body) {
                    setErrorMsg(result.body.message);
                } else {
                    setErrorMsg("An unexpected server error has occurred, try again later");
                }
                setLoading(false);
            });
        }

        useEffect(() => {
            let interval: number | undefined;

            if (friendsRef.current) {
                setAvailableFriends(friendsRef.current?.getAvailableFriends());

                interval = setInterval(() => {
                    setAvailableFriends(friendsRef.current?.getAvailableFriends());
                }, 5000);
            }

            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            }
        }, [friendsRef.current]);

        return(
            <Modal close={() => setOpenedModal(null)} >
                <div className="flex min-w-[112vh] min-h-[64vh]" >
                    <div className="flex flex-col justify-between items-center p-8" >
                        <div className="w-1 min-w-full" >
                            <h1 className="text-center font-amarante text-4xl" >
                                Create a game
                            </h1>
                            <p className="text-center px-16 py-4" >
                                Select a friend to invite or use the generated key or link to invite your opponent
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4" >
                            <div className="flex justify-center gap-2 px-2" >
                                <div className="create-game-player justify-start" >
                                    <img src={`./avatars/${_user?.picture}.jpg`} alt="" />
                                    <h1>{_user?.username}</h1>
                                </div>
                                <h1 className="gold-text text-5xl" >
                                    VS
                                </h1>
                                { friendToInvite ?
                                    <div className="create-game-player justify-end" >
                                        <h1>
                                            {friendToInvite.username}
                                        </h1>
                                        <div className="create-game-friend-avatar-container" >
                                            { !key &&
                                                <div className="remove-friend-inv" >
                                                    <IconButton text={"Remove"} icon={"minimize"} onClick={() => setFriendToInvite(undefined)} />
                                                </div>
                                            }
                                            <img src={`./avatars/${friendToInvite.picture}.jpg`} alt="" />
                                        </div>
                                    </div>
                                    :
                                    <div className="create-game-player justify-end" >
                                        <div className="img-frame-placeholder" >
                                            <IconButton icon="add" text="Select friend" onClick={openSelect} />
                                            <select
                                                onChange={(e) => changeFriendToInvite(e.target.value)}
                                                defaultValue={undefined}
                                                ref={friendSelect as LegacyRef<HTMLSelectElement>}
                                            >
                                                <option hidden value={undefined} ></option>
                                                { availableFriends && availableFriends.map(friend =>
                                                    <option key={friend.userId} value={friend.userId} >
                                                        {friend.username}
                                                    </option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="hr" ></div>
                            { !key ?
                                <div className="px-2 flex gap-4" >
                                    <div>
                                        <h1 className="font-amarante text-xl" >
                                            Time Limit
                                        </h1>
                                        <small>
                                            (min/player)
                                        </small>
                                    </div>
                                    <div className="flex flex-col pt-1 flex-grow" >
                                        <div className="slider" >
                                            <input
                                                type="range"
                                                min={minTimeLimit}
                                                max={maxTimeLimit}
                                                step={step}
                                                defaultValue={maxTimeLimit}
                                                onChange={(e) => changeTimeLimit(Number(e.target.value))}
                                            />
                                            <ul>
                                                <li data-content="15" ></li>
                                                <span></span>
                                                <li data-content="30" ></li>
                                                <span></span>
                                                <li data-content="45" ></li>
                                                <span></span>
                                                <li data-content="∞" ></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                :
                                <p className="text-center" >
                                    { friendToInvite ?
                                        "Wait for your friend to join the game..."
                                        :
                                        "Send the following key or link to your opponent"
                                    }
                                </p>
                            }
                        </div>
                        { key ?
                            <div className="h-max-24 h-min-24 flex flex-col items-center" >
                                <div className="flex gap-2" >
                                    <h1 className="text-2xl font-bold" >
                                        {key}
                                    </h1>
                                    <IconButton text="Copy" icon="copy" onClick={() => navigator.clipboard.writeText(key as string)} />
                                </div>
                                <div className="flex gap-2" >
                                    <h1 className="underline" >
                                        {getLink(key)}
                                    </h1>
                                    <IconButton text="Copy" icon="copy" onClick={() => navigator.clipboard.writeText(getLink(key))} />
                                </div>
                            </div>
                            :
                            <div className="h-max-24 h-min-24 flex flex-col justify-end items-center gap-2 w-1 min-w-full" >
                                { errorMsg &&
                                    <p className="error-text text-center" >
                                        {errorMsg}
                                    </p>
                                }
                                <Button text={"Create"} onClick={create} loading={loading} />
                            </div>
                        }
                    </div>
                    <div className="create-game-bg" ></div>
                </div>
            </Modal>
        );
    }

    const JoinGame: FC = () => {

        const [key, setKey] = useState<string>("");
        const [loading, setLoading] = useState<boolean>(false);
        const [errorMsg, setErrorMsg] = useState<string | undefined>();

        const keyRegex = /^[A-Z0-9]{0,6}$/;

        const input = (input: string) => {
            const cleanInput = input.trim().toUpperCase();

            if (cleanInput.match(keyRegex)) {
                setKey(cleanInput);
            }
        }

        const joinRandom = () => {
            openInfoModal(
                <p className="px-4" >
                    This feature has not been implemented yet
                </p>
            );
        }

        const joinWithKey = () => {
            setLoading(true);

            joinGameWithKey(key).then(result => {
               if (result.ok) {
                   alert("TODO");
               } else {
                   setErrorMsg("You cannot join this game");
               }

                setLoading(false);
            });
        }

        return(
            <Modal close={() => setOpenedModal(null)} >
                <div className="flex min-w-[112vh] min-h-[64vh]" >
                    <div className="flex flex-col gap-4 p-8 justify-center" >
                        <div className="flex flex-col gap-4 items-center">
                            <h1 className="text-xl font-amarante" >
                                Random
                            </h1>
                            <p className="w-2/3 text-center" >
                                Join a random game to fight against strangers
                            </p>
                            <Button text="Queue Up" onClick={joinRandom} loading={loading} />
                        </div>
                        <span className="hr" ></span>
                        <div className="flex flex-col gap-4 items-center">
                            <h1 className="text-xl font-amarante" >
                                Key
                            </h1>
                            <p className="text-center" >
                                Enter a key to join a game with a friend
                            </p>
                            <input
                                className="text-center"
                                type="text"
                                placeholder="Enter key"
                                value={key}
                                onChange={(e) => input(e.target.value)}
                            />
                            { errorMsg &&
                                <p className="error-text" >
                                    {errorMsg}
                                </p>
                            }
                            <Button
                                text="Join"
                                onClick={joinWithKey}
                                loading={loading}
                                disabled={key.length < 6}
                            />
                        </div>
                    </div>
                    <div className="join-game-bg" ></div>
                </div>
            </Modal>
        );
    }

    const OptionCardButton: FC<{id: string}> = ({id}) => {

        const AuthDialog = () => {

            const customLogin = () => {
                loginWithPopup().then(() => {
                    if (modalToBeOpened) {
                        setOpenedModal(modalToBeOpened);
                    }
                });
            }

            return(
                <Modal close={() => setOpenedModal(null)} >
                    <div className="p-4 flex flex-col items-center">
                        <p className="p-4 w-1 min-w-full text-center" >
                            Please log in if you already have an account or register to create a new one
                        </p>
                        <div className="flex gap-4" >
                            <Button text="Log In" onClick={customLogin} />
                            <Button text="Register" onClick={customLogin} />
                        </div>
                    </div>
                </Modal>
            );
        }

        const content = optionCardContent[id];

        const openOption = () => {
            if (!isAuthenticated && id !== "tutorialAndCards") {
                setModalToBeOpened(() => {
                    switch (id) {
                        case "createGame":
                            return <CreateGame />;
                        case "joinGame":
                            return <JoinGame />;
                        default:
                            return undefined;
                    }
                });
                setOpenedModal(<AuthDialog />);
            } else if (_user) {
                switch (id) {
                    case "createGame":
                        setOpenedModal(<CreateGame />);
                        break;
                    case "joinGame":
                        setOpenedModal(<JoinGame />);
                        break;
                    case "tutorialAndCards":
                        setOpenedModal(<TutorialAndCards />);
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

    const ChangeAvatar: FC<{ currentAvatar: string }> = ({currentAvatar}) => {

        const [selected, setSelected] = useState<string>(currentAvatar);
        const [changed, setChanged] = useState<boolean | undefined>();
        const [loading, setLoading] = useState<boolean>(false);

        const changeAvatar = () => {
            changePicture(selected).then(result => {
                setChanged(result.ok);

                if (result.ok) {
                    setUser(prevState => {
                        if (prevState) {
                            return {
                                ...prevState,
                                picture: selected
                            }
                        } else {
                            return prevState;
                        }
                    });
                }

                setLoading(false);
            });
        }

        return(
            <Modal close={() => setOpenedModal(null)} >
                <div className="change-avatar" >
                    { typeof changed === "undefined" ?
                        <>
                            <ul className="avatar-selector" >
                                {avatarList.map(avatar =>
                                    <li
                                        key={avatar}
                                        onClick={() => setSelected(avatar)}
                                        className={selected === avatar ? "selected" : ""}
                                    >
                                        <img src={`./avatars/${avatar}.jpg`} alt="" />
                                    </li>
                                )}
                            </ul>
                            <div className="hr" ></div>
                            <Button
                                text={"Change Avatar"}
                                loading={loading}
                                onClick={changeAvatar}
                                disabled={selected === currentAvatar}
                            />
                        </>
                        :
                        <>
                            { changed ?
                                <>
                                    <p className="px-4" >
                                        Your avatar was changed successfully
                                    </p>
                                    <div className="hr" ></div>
                                    <Button text={"Ok"} onClick={() => setOpenedModal(null)} />
                                </>
                                :
                                <>
                                    <p className="error-text px-4" >
                                        Something went wrong, please try again
                                    </p >
                                    <div className="hr" ></div>
                                    <Button text={"Ok"} onClick={() => setOpenedModal(null)} />
                                </>
                            }
                        </>
                    }
                </div>
            </Modal>
        )
    }

    const Registration: FC = () => {

        const [username, setUsername] = useState<string>("");
        const [picture, setPicture] = useState<string>("1");
        const [loading, setLoading] = useState<boolean>(false);
        const [registered, setRegistered] = useState<boolean | undefined>();
        const [errorMsg, setErrorMsg] = useState<string | undefined>();

        const usernameRegex = /^[a-zA-Z0-9]{0,16}$/;
        const universalErrorMsg = "Username must be 8-16 characters and contain only letters and numbers";

        const register = () => {
            if (username.match(usernameRegex) && username.length > 7) {
                setLoading(true);

                registerNewUser(username, picture).then(result => {
                    if (result.status === 409) {
                        setErrorMsg(() => {
                            if (result.body && "message" in result.body) {
                                return result.body.message;
                            } else {
                                return "This username is already taken";
                            }
                        });
                    } else {
                        setRegistered(result.ok);
                    }
                    setLoading(false);
                });
            } else {
                setErrorMsg(universalErrorMsg);
            }
        }

        const input = (input: string) => {
            setUsername(input);

            if (username.length > 7 && input.length < 8 ) {
                setErrorMsg("Username must contain at least 8 characters");
                return;
            }

            if (input.match(usernameRegex)) {
                setErrorMsg(undefined);
            } else {
                setErrorMsg(universalErrorMsg);
            }
        }

        const closeRegistretion = () => {
            if (registered && user?.sub) {
                setOpenedModal(null);
                setUser({
                        userId: user.sub,
                        username: username,
                        picture: picture,
                        friends: [],
                        requests: []
                });
                setFriends({
                    friends: [],
                    pending: []
                });
            }
        }

        return(
            <ForcedModal>
                <div className="p-4 flex flex-col items-center gap-4" >
                    {typeof registered === "undefined" ?
                        <>
                            <p className="text-center w-72 px-4" >
                                Select an avatar and enter a username to create an account
                            </p>

                            <div className="hr" ></div>

                            <ul className="avatar-selector" >
                                {avatarList.map(avatar =>
                                    <li
                                        key={avatar}
                                        onClick={() => setPicture(avatar)}
                                        className={picture === avatar ? "selected" : ""}
                                    >
                                        <img src={`./avatars/${avatar}.jpg`} alt="" />
                                    </li>
                                )}
                            </ul>

                            <small className="text-center w-72 px-4" >
                                Change it later by clicking on the edit icon inside the avatar display
                            </small>

                            <div className="hr" ></div>

                            <input
                                className="username-input"
                                type="text"
                                placeholder="Username (min. 8 characters)"
                                pattern={usernameRegex.source}
                                onChange={(e) => input(e.target.value)}
                            />

                            <div className="hr" ></div>

                            { errorMsg &&
                                <p className="error-text text-center w-72 px-4" >
                                    {errorMsg}
                                </p>
                            }

                            <div className="flex gap-4" >
                                <Button
                                    text={"Cancel"}
                                    onClick={customLogout}
                                />
                                <Button
                                    text={"Submit"}
                                    loading={loading}
                                    onClick={register}
                                />
                            </div>
                        </>
                        :
                        <>
                            { registered ?
                                <>
                                    <p className="text-center w-72 px-4" >
                                        Your account was created successfully
                                    </p>
                                    <div className="hr" ></div>
                                    <Button text={"Continue"} onClick={closeRegistretion} />
                                </>
                                :
                                <>
                                    <p className="error-text text-center w-72 px-4" >
                                        Something went wrong, please try again later
                                    </p >
                                    <div className="hr" ></div>
                                    <Button text={"Ok"} onClick={customLogout} />
                                </>
                            }
                        </>
                    }
                </div>
            </ForcedModal>
        )
    }

    const UserPanel: FC<{ user: User }> = ({user}) => {

        return(
            <div className="user-panel" >
                <div className="user-name" >
                    <h1 className="min-w-28 text-center" >
                        {user.username}
                    </h1>
                </div>
                <div className="user-avatar-container" >
                    <img src={`./avatars/${user.picture}.jpg`} alt="" />
                    <IconButton text="Edit" icon="edit" onClick={() => setOpenedModal(<ChangeAvatar currentAvatar={user.picture} />)} />
                </div>
                <div className="settings" >
                    <IconButton text="Music" icon="music" decorated onClick={() => alert("TODO")} />
                    <IconButton text="Sound" icon="sound" decorated onClick={() => alert("TODO")} />
                    <IconButton text="Log Out" icon="logout" decorated onClick={customLogout} />
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (!_user && isAuthenticated) {
            loadUser();
            setUpSocket();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (gameRequests && gameRequests!.length > 0) {
            setOpenedForcedModal(
                <GameRequest
                    match={gameRequests[0]}
                    onResolve={() => setGameRequests(gameRequests!.slice(1, gameRequests!.length - 1))}
                />
            );
        } else if (friendRequests && friendRequests!.length > 0) {
            setOpenedForcedModal(
                <FriendRequest
                    sender={friendRequests[0]}
                    onResolve={() => setFriendRequests(friendRequests!.slice(1, friendRequests!.length - 1))}
                />
            );
        } else {
            setOpenedForcedModal(null);
        }
    }, [friendRequests, gameRequests]);

    useEffect(() => {
        if (modalToBeOpened) {
            setOpenedModal(modalToBeOpened);
            setModalToBeOpened(undefined);
        }
    }, [_user]);

    return(
        <main>
            {openedInfoModal.map((content, index) => (
                <InfoModal close={() => closeInfoModal(index)} key={index} >
                    {content}
                </InfoModal>
            ))}
            <div>
                <div className="h-[100vh] w-fit" >
                    <div className="title-text" ></div>
                    {
                        openedForcedModal &&
                        openedForcedModal
                    }
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
                        <UserPanel user={_user} />
                        { friends &&
                            <>
                                <FriendsPanel
                                    ref={friendsRef}
                                    friends={friends}
                                    modalSetter={openModal}
                                    chatOpen={openChat}
                                    openCreateGamePanel={openCreateGameWithInvite}
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
                                onClick={loginWithPopup}
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

const avatarList = [
    "1", "2", "3"
];

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

interface User {
    userId: string;
    username: string;
    picture: string;
    friends: string[];
    requests: FriendRequest[];
}

interface UserResponseBody {
    user: User;
    friends: Friend[];
}

interface FriendRequest {
    fromId: string;
    toId: string;
    userProps: { username: string, picture?: string };
}

interface Receiver {
    userId: string;
    username: string;
    picture?: string;
    status: string;
    unseenMessage: boolean;
}

interface Sender {
    userId: string;
    username: string;
    picture?: string;
}

export default Home;