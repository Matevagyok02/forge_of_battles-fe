import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import {FriendStatus, IFriend} from "../friends_panel/FriendsPanel.tsx";
import {IMatch, MatchStage} from "../../../interfaces.ts";
import Modal from "../../../components/Modal.tsx";
import {Button, Icon, IconButton} from "../../../components/Button.tsx";
import {FriendsContext, ModalContext, UserContext} from "../../../context.tsx";
import {useNavigate} from "react-router-dom";
import styles from "../../../styles/home_page/OptionCardContent.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";
import RangeSlider from "../../../components/RangeSelect.tsx";
import {parseTimeLimit} from "../../../utils.ts";
import {useAbandonMatch, useActiveMatches, useCreateMatch, useUserById} from "../../../api/hooks.tsx";

const CreateGame: FC<{ _lastCreatedMatch?: IMatch ,friend?: IFriend }> = ({ _lastCreatedMatch, friend}) => {

    const navigate = useNavigate();

    const [match, setMatch] = useState<IMatch | undefined>(_lastCreatedMatch);
    const [timeLimit, setTimeLimit] = useState<number>();
    const [errorMsg, setErrorMsg] = useState<string>();

    const [opponentId, setOpponentId] = useState<string>();
    const [opponentDetails, setOpponentDetails] = useState<IFriend | undefined>(friend);

    const { openInfoModal } = useContext(ModalContext);

    const fetchActiveMatch = useActiveMatches();
    const createMatch = useCreateMatch();
    const abandonMatch = useAbandonMatch();
    const fetchUserById = useUserById(opponentId);

    const minTimeLimit = 15;
    const maxTimeLimit = 60;
    const step = 15;

    const changeTimeLimit = (input: number) => {
        setTimeLimit(input === maxTimeLimit ? undefined : input);
        console.log(input === maxTimeLimit ? undefined : input);
    }

    useEffect(() => {
        if (abandonMatch.isSuccess) {
            setMatch(undefined);
            setOpponentDetails(undefined);
            setOpponentId(undefined);
            setErrorMsg(undefined);
            changeTimeLimit(maxTimeLimit);
        }
    }, [abandonMatch.isSuccess]);

    useEffect(() => {
        if (fetchUserById.isSuccess) {
            setOpponentDetails(fetchUserById.data.data);
        }
    }, [fetchUserById.data]);

    useEffect(() => {
        if (abandonMatch.isError) {
            openInfoModal(
                <p>
                    The match could not be deleted, try again later.
                </p>
            );
        }
    }, [abandonMatch.isError]);

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
        createMatch.create(timeLimit, opponentDetails?.userId);
    }

    useEffect(() => {
        if (createMatch.isSuccess && createMatch.data) {
            setMatch(createMatch.data.data);
        }
    }, [createMatch.isSuccess]);

    useEffect(() => {
        if (createMatch.error) {
            if (createMatch.error?.response?.data.message) {
                setErrorMsg(createMatch.error?.response?.data.message);
            } else {
                setErrorMsg("An unexpected server error has occurred, try again later");
            }
        }
    }, [createMatch.error]);

    useEffect(() => {
        if (fetchActiveMatch.isSuccess && fetchActiveMatch.data.data.created) {
            setMatch(fetchActiveMatch.data.data.created);
            setOpponentId(fetchActiveMatch.data.data.created?.player2Id);
        }
    }, [fetchActiveMatch.data]);

    useEffect(() => {
        if (opponentId) {
            fetchUserById.refetch();
        }
    }, [opponentId]);

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
                            opponent={opponentDetails}
                            setOpponent={setOpponentDetails}
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
                                        opponentDetails ?
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
                            abandon={() => abandonMatch.abandon(match!.key)}
                            rejoin={rejoinMatch}
                        />
                        :
                        <div className={styles.createBtn} >
                            { errorMsg &&
                                <p className={styles.errorDisplay} >
                                    {errorMsg}
                                </p>
                            }
                            <Button text={"Create"} onClick={create} loading={createMatch.isPending} />
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
            { match.stage !== MatchStage.abandoned ?
                <>
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
                </>
                :
                <>
                    <p>
                        Your opponent has left the match. Click 'Abandon' to delete the match.
                    </p>
                    <Button text={"Abandon"} onClick={abandon} />
                </>
            }
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