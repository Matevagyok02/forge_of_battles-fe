import {
    FC,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {IFriend, FriendStatus, getFriendById} from "../friends_panel/FriendsPanel.tsx";
import {IMatch, MatchStage} from "../../../interfaces.ts";
import {abandonMatch, createGame, getLastCreatedGame} from "../../../api/match.ts";
import Modal from "../../../components/Modal.tsx";
import {Button, Icon, IconButton} from "../../../components/Button.tsx";
import {FriendsContext, ModalContext, UserContext} from "../../../context.tsx";
import {useNavigate} from "react-router-dom";
import styles from "../../../styles/home_page/OptionCardContent.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";
import {findPlayerById} from "../../../api/user.ts";
import RangeSlider from "../../../components/RangeSelect.tsx";
import {parseTimeLimit} from "../../../utils.ts";

const CreateGame: FC<{ _lastCreatedMatch?: IMatch ,friend?: IFriend | undefined }> = ({ _lastCreatedMatch, friend}) => {

    const navigate = useNavigate();

    const [match, setMatch] = useState<IMatch>();
    const [timeLimit, setTimeLimit] = useState<number>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [opponent, setOpponent] = useState<IFriend | undefined>(friend);

    const { friends } = useContext(FriendsContext);
    const { openInfoModal } = useContext(ModalContext);

    const minTimeLimit = 15;
    const maxTimeLimit = 60;
    const step = 15;

    const changeTimeLimit = (input: number) => {
        setTimeLimit(input === maxTimeLimit ? undefined : input);
        console.log(input === maxTimeLimit ? undefined : input);
    }

    const abandonCreatedMatch = () => {
        if (match) {
            abandonMatch(match.key).then(result => {
                if (result.ok) {
                    setMatch(undefined);
                    setOpponent(undefined);
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

        if (match) {
            if (match.stage === MatchStage.preparing) {
                navigate(`/preparation/${match.key}`);
            } else if (match.stage === MatchStage.started) {
                navigate(`/battle/${match.key}`);
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

    const create = () => {
        setLoading(true);

        createGame(timeLimit, opponent?.userId).then(result => {
            if (result.ok && result.body) {
                setMatch(result.body as IMatch);
                setErrorMsg(undefined);
            } else if (result.status === 409 && result.body && "message" in result.body) {
                setErrorMsg(result.body.message);
            } else {
                setErrorMsg("An unexpected server error has occurred, try again later");
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        if (!match) {
            getLastCreatedGame().then(result => {
                if (result.ok && result.body) {
                    const match = result.body as IMatch;
                    setMatch(match);

                    if (match.player2Id) {
                        setOpponent(getOpponentDetails(match.player2Id));
                    }
                }
            });
        }
    }, [match]);

    const getOpponentDetails = useCallback((userId: string) => {
        let opponent: IFriend | undefined;

        if (friends) {
            opponent = getFriendById(userId, friends.friends);
        }

        if (!opponent) {
            findPlayerById(userId).then(result => {
                if (result.ok && result.body) {
                    opponent = result.body as IFriend;
                }
            });
        }

        return opponent;
    }, [friends]);

    useEffect(() => {
        setMatch(_lastCreatedMatch);
    }, [_lastCreatedMatch]);

    return(
        <Modal canBeClosed={!match} >
            <div className={styles.createGamePanel} >
               <div className={styles.content} >
                    <div className={styles.description} >
                        <h1>
                            Create a game
                        </h1>
                        <p>
                            Select a friend to invite or use the generated key or link to invite your opponent
                        </p>
                    </div>

                    <div className={styles.creationInterface} >
                        <PlayersDisplay
                            opponent={opponent}
                            setOpponent={setOpponent}
                            isMatchCreated={!!match}
                        />
                        <horizontal-line/>
                        { !match ?
                            <div className={styles.timeLimitSelect} >
                                <div>
                                    <h1>
                                        Time Limit
                                    </h1>
                                    <small>
                                        (min/player)
                                    </small>
                                </div>
                                <RangeSlider
                                    min={minTimeLimit}
                                    max={maxTimeLimit}
                                    default={maxTimeLimit}
                                    isMaxInfinite={true}
                                    step={step}
                                    onChange={changeTimeLimit}
                                />
                            </div>
                            :
                            <>
                                { match.battle.timeLimit &&
                                    <div className={styles.timeLimitDisplay} >
                                        Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                                    </div>
                                }
                                <p className={styles.instructions} >
                                    { match.stage === MatchStage.pending ?
                                        opponent ?
                                            "Wait for your friend to join the game..."
                                            :
                                            "Send the following key or link to your opponent"
                                        :
                                        `Click "Rejoin" to continue the game`
                                    }
                                </p>
                            </>
                        }
                    </div>

                    { match ?
                        <MatchDisplay
                            match={match}
                            abandon={abandonCreatedMatch}
                            rejoin={rejoinMatch}
                        />
                        :
                        <div className={styles.createBtn} >
                            { errorMsg &&
                                <p className={styles.errorDisplay} >
                                    {errorMsg}
                                </p>
                            }
                            <Button text={"Create"} onClick={create} loading={loading} />
                        </div>
                    }
                </div>

                <div className={styles.background} ></div>
            </div>
        </Modal>
    );
}

const MatchDisplay: FC<{ match: IMatch, abandon: () => void, rejoin: () => void }> = ({ match, abandon, rejoin }) => {

    const link = `${window.location.origin}/join/${match.key}`

    const copyText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    }

    return(
        <div className={styles.matchDisplay} >
            <p>
                <span className={styles.key} >
                    {match.key}
                </span>
                <IconButton icon={Icon.copy} onClick={() => copyText(match.key)} />
            </p>
            <p>
                <span className={styles.link} >
                    {link}
                </span>
                <IconButton icon={Icon.copy} onClick={() => copyText(link)} />
            </p>
            <div>
                { match.stage === MatchStage.pending ? (
                        <Button text={"Abandon"} onClick={abandon} />
                ) : ( match.stage !== MatchStage.finished && (
                        <Button text={"Rejoin" } onClick={rejoin} />
                ))}
            </div>
        </div>
    )
}

const PlayersDisplay: FC<{ opponent?: IFriend, setOpponent: (value: IFriend | undefined) => void, isMatchCreated: boolean }> = ({ opponent, setOpponent, isMatchCreated }) => {

    const { _user } = useContext(UserContext);
    const { friends } = useContext(FriendsContext);
    const { openInfoModal } = useContext(ModalContext);

    const ref = useRef<HTMLSelectElement | null>(null);
    const [availableFriends, setAvailableFriends] = useState<IFriend[]>();

    const openSelect = useCallback(() => {
        if (ref.current && availableFriends && availableFriends.length > 0) {
            ref.current!.showPicker();
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
    }, [ref, availableFriends]);

    const changeOpponent = (friendId: string | undefined) => {
        if (friendId && availableFriends) {
            setOpponent(availableFriends.find(friend => friend.userId === friendId));
        } else {
            setOpponent(undefined);
        }
    }

    useEffect(() => {
        if (friends) setAvailableFriends(
            friends.friends.filter(friend => friend.status === FriendStatus.online)
        );
    }, [friends]);

    return(
        <div className={styles.playersDisplay} >
            { _user &&
                <div className={styles.player} >
                    <AvatarDisplay avatar={_user.picture} />
                    <h1>
                        {_user.username}
                    </h1>
                </div>
            }
            { opponent ?
                <div className={styles.opponent} >
                    <h1>
                        {opponent.username}
                    </h1>
                    <div>
                        { !isMatchCreated &&
                            <div className={styles.removeOpponent} >
                                <IconButton text={"Remove"} icon={Icon.cancel} onClick={() => setOpponent(undefined)} />
                            </div>
                        }
                        <AvatarDisplay avatar={opponent.picture} />
                    </div>
                </div>
                :
                <div className={styles.opponent} >
                    <div className={styles.opponentSelectContainer} >
                        <IconButton text={"Select a Friend"} icon={Icon.add} onClick={openSelect} />
                        <select
                            onChange={(e) => changeOpponent(e.target.value)}
                            defaultValue={undefined}
                            ref={ref}
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
    );
}

export default CreateGame;