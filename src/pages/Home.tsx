import "../styles/Home.css"
import "../styles/card.css"
import {Button, IconButton} from "../components/Button.tsx";
import {FC, ReactElement, useCallback, useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {
    acceptFriendRequest,
    changePicture,
    declineFriendRequest,
    getUser,
    registerNewUser
} from "../api/homePageRequests.ts";
import Modal, {ForcedModal} from "../components/Modal.tsx";
import FriendsPanel, {Friend, Friends} from "../components/FriendsPanel.tsx";
import {io} from "socket.io-client";

const Home = () => {

    const { user, isAuthenticated, logout, loginWithPopup } = useAuth0();

    const [_user, setUser] = useState<User>();
    const [friends, setFriends] = useState<Friends>();
    const [openedModal, setOpenedModal] = useState<ReactElement | null>(null);
    const [openedForcedModal, setOpenedForcedModal] = useState<ReactElement | null>(null);

    const [friendRequests, setFriendRequests] = useState<Sender[]>();

    const openModal = useCallback((modalComponent: ReactElement) => {
        setOpenedModal(modalComponent);
    }, []);

    const addFriend = (friend: Friend) => {
        setFriends(prevState => {
            if (prevState) {
                return {
                    friends: [...prevState.friends, friend],
                    pending: prevState.pending
                }
            } else {
                return {
                    friends: [friend],
                    pending: []
                }
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
            } else {
                if (userObj.status === 404) {
                    setOpenedModal(<Registration/>);
                } else {
                    alert("An unexpected server error has occurred");
                }
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
            console.log(sender);
            if (friendRequests) {
                setFriendRequests([...friendRequests, sender]);
            } else {
                setFriendRequests([sender]);
            }
        });

        // socket.on("friend-accepted", (friend) => {
        //     if (friends) {
        //         setFriends([...friends, friend]);
        //     }
        // });
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

    const OptionCardButton: FC<{id: string}> = ({id}) => {

        const AuthDialog = () => {

            const { loginWithPopup } = useAuth0();

            return(
                <Modal close={() => setOpenedModal(null)} >
                    <div className="p-4 flex flex-col items-center">
                        <p className="p-4 w-1 min-w-full text-center" >
                            Please click sign in if you already have an account or register to create a new one
                        </p>
                        <div className="flex gap-4" >
                            <Button text="Sign In" onClick={loginWithPopup} />
                            <Button text="Register" onClick={loginWithPopup} />
                        </div>
                    </div>
                </Modal>
            );
        }

        const content = optionCardContent[id];
        const { isAuthenticated } = useAuth0();

        const openOption = () => {
            if (!isAuthenticated && id !== "tutorialAndCards") {
                setOpenedModal(<AuthDialog />);
            } else {
                switch (id) {
                    case "createGame":
                        setOpenedModal(null);
                        break;
                    case "joinGame":
                        setOpenedModal(null);
                        break;
                    case "tutorialAndCards":
                        setOpenedModal(null);
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

        const register = () => {
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
                setErrorMsg("Username must be 8-16 characters and contain only letters and numbers");
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
                                type="text"
                                placeholder="Username"
                                pattern={usernameRegex.source}
                                onChange={(e) => input(e.target.value)}
                            />

                            <div className="hr" ></div>

                            { errorMsg &&
                                <p className="error-text text-center w-72 px-4" >
                                    {errorMsg}
                                </p>
                            }

                            <Button
                                text={"Submit"}
                                loading={loading}
                                onClick={register}
                                disabled={!username.match(usernameRegex) || username.length < 8}
                            />
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
                                    <Button text={"Ok"} onClick={logout} />
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
                    <IconButton text="Log Out" icon="logout" decorated onClick={logout} />
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
        if (friendRequests && friendRequests.length > 0) {
            const handleResolve = () => {
                setFriendRequests(friendRequests.slice(1, friendRequests.length - 1));
            }

            setOpenedForcedModal(<FriendRequest sender={friendRequests[0]} onResolve={handleResolve} />);
        } else {
            setOpenedForcedModal(null);
        }
    }, [friendRequests]);

    return(
        <main aria-modal={true} >
            <div className="flex justify-center">
                <div className="h-[100vh] flex flex-col" >
                    <div className="flex justify-center p-6" >
                        <div className="text-5xl title-text" ></div>
                    </div>
                    {
                        openedForcedModal &&
                        openedForcedModal
                    }
                    { openedModal ?
                        openedModal
                        :
                        <div className="flex flex-1 gap-8 p-5">
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
                                <FriendsPanel friends={friends} modalSetter={openModal} />
                                <ChatPanel />
                            </>
                        }
                    </>
                    :
                    <div className="auth-panel" >
                        { !isAuthenticated &&
                            <Button
                                text={localStorage.getItem("signedUp") ? "Sign In" : "Sign Up"}
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

const ChatPanel = () => {

    return(
        <div className="chat-panel" >
            <div className="minimalized-chatbox" >
                <label>
                    LongUserName2002
                </label>
            </div>
        </div>
    )
}

export default Home;
