import {FC, LegacyRef, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Friend, getAvailableFriends, getFriendById} from "./FriendsPanel.tsx";
import {IMatch} from "../../interfaces.ts";
import {abandonMatch, createGame, getLastCreatedGame} from "../../api/match.ts";
import Modal from "../../components/Modal.tsx";
import {Button, Icon, IconButton} from "../../components/Button.tsx";
import {FriendsContext, ModalContext, UserContext} from "../../Context.tsx";
import {useNavigate} from "react-router-dom";

const CreateGame: FC<{ friend?: Friend | undefined }> = ({friend}) => {

    const navigate = useNavigate();

    const [friendToInvite, setFriendToInvite] = useState<Friend | undefined>(friend);
    const [timeLimit, setTimeLimit] = useState<number>();
    const [key, setKey] = useState<string>();
    const [matchStage, setMatchStage] = useState<string>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [availableFriends, setAvailableFriends] = useState<Friend[]>();

    const { _user } = useContext(UserContext);
    const { friends } = useContext(FriendsContext)
    const { openInfoModal } = useContext(ModalContext);

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

    const abandonCreatedMatch = () => {
        if (key) {
            abandonMatch(key).then(result => {
                if (result.ok) {
                    setKey(undefined);
                    setFriendToInvite(undefined);
                    setErrorMsg(undefined);
                    changeTimeLimit(maxTimeLimit);
                } else {
                    openInfoModal(
                        <p>
                            The match could not be deleted, try again later
                        </p>
                    );
                }
            });
        }
    }

    const rejoinMatch = () => {
        const refresh = () => location.reload();

        if (key) {
            if (matchStage === "preparing") {
                navigate(`/preparation/${key}`);
            } else if (matchStage === "started") {
                navigate(`/battle/${key}`);
            } else {
                openInfoModal(
                    <p>
                        The match has already started, press "OK" to refresh the page and try again
                    </p>,
                    refresh
                );
            }
        } else {
            openInfoModal(
                <p>
                    Something went wrong, press "OK" to refresh the page and try again
                </p>,
                refresh
            );
        }
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
            if (result.ok && result.body) {
                const match = result.body as IMatch;
                setErrorMsg(undefined);
                setKey(match.key);
                setMatchStage(match.stage);
            } else if (result.status === 409 && result.body && "message" in result.body) {
                setErrorMsg(result.body.message);
            } else {
                setErrorMsg("An unexpected server error has occurred, try again later");
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        if (friends)
            setAvailableFriends(getAvailableFriends(friends.friends));
    }, [friends]);

    useEffect(() => {
        if (friends && !key) {
            getLastCreatedGame().then(result => {
                if (result.ok && result.body) {
                    const match = result.body as IMatch;
                    setKey(match.key);
                    setMatchStage(match.stage);

                    if (match.player2Id) {
                        setFriendToInvite(getFriendById(match.player2Id, friends.friends));
                    }
                }
            });
        }
    }, [friends]);

    return(
        <Modal closeCondition={!key} >
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
                                <img className="user-avatar" src={`./avatars/${_user?.picture}.jpg`} alt="" />
                                <h1 className="font-bold" >
                                    {_user?.username}
                                </h1>
                            </div>
                            <h1 className="gold-text text-5xl" >
                                VS
                            </h1>
                            { friendToInvite ?
                                <div className="create-game-player justify-end" >
                                    <h1 className="font-bold" >
                                        {friendToInvite.username}
                                    </h1>
                                    <div className="create-game-friend-avatar-container" >
                                        { !key &&
                                            <div className="remove-friend-inv" >
                                                <IconButton text={"Remove Friend"} icon={Icon.cancel} onClick={() => setFriendToInvite(undefined)} />
                                            </div>
                                        }
                                        <img className="user-avatar" src={`./avatars/${friendToInvite.picture}.jpg`} alt="" />
                                    </div>
                                </div>
                                :
                                <div className="create-game-player justify-end" >
                                    <div className="img-frame-placeholder" >
                                        <IconButton text={"Select Friend"} icon={Icon.add} onClick={openSelect} />
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
                                { matchStage === "pending" ?
                                    friendToInvite ?
                                            "Wait for your friend to join the game..."
                                            :
                                            "Send the following key or link to your opponent"
                                    :
                                    `Click "Rejoin" to continue the game`
                                }
                            </p>
                        }
                    </div>
                    { key ?
                        <div className="flex flex-col items-center" >
                            <div className="flex gap-2" >
                                <h1 className="text-2xl font-bold" >
                                    {key}
                                </h1>
                                <IconButton icon={Icon.copy} onClick={() => navigator.clipboard.writeText(key as string)} />
                            </div>
                            <div className="flex gap-2" >
                                <h1 className="underline" >
                                    {getLink(key)}
                                </h1>
                                <IconButton icon={Icon.copy} onClick={() => navigator.clipboard.writeText(getLink(key))} />
                            </div>
                            { matchStage === "pending" ?
                                <div className="mt-4" >
                                    <Button text="Abandon" onClick={abandonCreatedMatch} />
                                </div>
                                :
                                <div className="mt-4" >
                                    <Button text="Rejoin" onClick={rejoinMatch} />
                                </div>
                            }
                        </div>
                        :
                        <div className="flex flex-col justify-end items-center gap-2 w-1 min-w-full" >
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

export default CreateGame;