import {FC, FocusEvent, useContext, useEffect, useState} from "react";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import {UserContext} from "../../../context.tsx";
import {useNavigate} from "react-router-dom";
import {IMatch, IUser} from "../../../interfaces.ts";
import {parseTimeLimit} from "../../../utils.ts";
import styles from "../../../styles/home_page/OptionCardContent.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";
import {
    useActiveMatches,
    useJoinGame,
    useJoinRandomGame, useLeaveMatch,
    useLeaveRandomGame,
    useUserById
} from "../../../api/hooks.tsx";

export const keyRegex = /^[A-Z0-9]{0,6}$/;

interface JoinGameProps {
    activeMatch?: IMatch;
    inQueue?: boolean;
}

const JoinGame: FC<JoinGameProps> = (props) => {

    const { _user } = useContext(UserContext);
    const [activeMatch, setActiveMatch] = useState<IMatch | undefined>(props.activeMatch);
    const [opponentId, setOpponentId] = useState<string>();
    const [opponentDetails, setOpponentDetails] = useState<IUser>();
    const [inQueue, setInQueue] = useState<boolean | undefined>(props.inQueue);

    const fetchActiveMatches = useActiveMatches();
    const fetchOpponent = useUserById(opponentId);

    useEffect(() => {
        setOpponentId(activeMatch?.player1Id !== _user?.userId ? activeMatch?.player1Id : activeMatch?.player2Id);
    }, [activeMatch]);

    useEffect(() => {
        if (fetchOpponent.isSuccess) {
            setOpponentDetails(fetchOpponent.data.data);
        }
    }, [fetchOpponent.data]);

    useEffect(() => {
        if (opponentId)
            fetchOpponent.refetch();
    }, [opponentId]);

    useEffect(() => {
        if (fetchActiveMatches.isSuccess) {
            if (fetchActiveMatches.data.data.active) {
                setActiveMatch(fetchActiveMatches.data.data.active);
            } else if (fetchActiveMatches.data.data.inQueue) {
                setInQueue(true);
            }
        }
    }, [fetchActiveMatches.data]);

    return(
        <Modal canBeClosed={!activeMatch && !inQueue} >
            <div className={styles.joinGamePanel} >
                { activeMatch && opponentDetails ?
                    <JoinActiveMatch
                        match={activeMatch}
                        opponent={opponentDetails}
                        clearActiveMatch={() => setActiveMatch(undefined)}
                    />
                    :
                    inQueue ?
                        <Queue setInQueue={setInQueue} />
                        :
                        <div className={styles.content}>
                            <JoinRandom setInQueue={setInQueue} />

                            <horizontal-line/>

                            <JoinByKey />
                        </div>
                }
                <div className={styles.background} ></div>
            </div>
        </Modal>
    );
}

const Queue: FC<{ setInQueue: (value: boolean) => void }> = ({ setInQueue }) => {

    const leaveQueue = useLeaveRandomGame();

    const leave = () => {
        leaveQueue.leave();
        setInQueue(false);
    }

    return(
        <div className={[styles.queue, styles.content].join(" ")} >
            <div className={styles.description} >
                <h1>
                    Random
                </h1>
                <p>
                    You are in the queue. Wait for an opponent to join
                </p>
            </div>
            <div className={styles.loading} >
                <i></i>
                <p>
                    Searching for available players...
                </p>
            </div>
            <Button text={"Leave"} loading={leaveQueue.isPending} onClick={leave} />
        </div>
    );
}

const JoinActiveMatch: FC<{ match: IMatch, opponent: IUser, clearActiveMatch: () => void  }> = ({ match, opponent, clearActiveMatch }) => {

    const navigate = useNavigate();
    const leaveMatch = useLeaveMatch();

    const rejoin = () => {
        navigate(`/preparation/${match.key}`);
    }

    useEffect(() => {
        if (leaveMatch.isError || leaveMatch.isSuccess) {
            clearActiveMatch();
        }
    }, [leaveMatch.isError, leaveMatch.isSuccess]);

    return(
        <div className={[styles.activeMatch, styles.content].join(" ")} >
            <p>
                You are inside an ongoing match. Finish or leave it before joining another one
            </p>

            <div>
                { opponent &&
                    <div className={styles.opponent} >
                        <AvatarDisplay avatar={opponent.picture} />
                        <h1>{opponent.username}</h1>
                    </div>
                }
                <horizontal-line/>
                {match.battle.timeLimit &&
                    <div className={styles.timeLimitDisplay} >
                        Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                    </div>
                }
            </div>

            <menu>
                <Button text={"Rejoin"} onClick={rejoin} />
                <Button text={"Leave"} onClick={leaveMatch.leave} loading={leaveMatch.isPending} />
            </menu>
        </div>
    );
}

const JoinRandom: FC<{ setInQueue: (value: boolean) => void }> = ({ setInQueue }) => {

    const joinQueue = useJoinRandomGame();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (joinQueue.isSuccess && joinQueue.data) {
            if (joinQueue.data.status === 201) {
                setInQueue(true);
            } else if (joinQueue.data.status === 202) {
                setLoading(true);
                setTimeout(joinQueue.join, 1000);
            }
        }
    }, [joinQueue.data]);

    useEffect(() => {
        if (joinQueue.isPending) {
            setLoading(false);
        }
    }, [joinQueue.isPending]);

    return(
        <div className={styles.joinRandom}>
            <h1>
                Random
            </h1>
            <p>
                Join a random game to fight against strangers
            </p>
            <Button text={"Queue Up"} onClick={joinQueue.join} loading={joinQueue.isPending || loading} />
        </div>
    );
}

const JoinByKey: FC = () => {

    const joinGame = useJoinGame();
    const navigate = useNavigate();

    const INPUT = "key-input";

    const [focused, setFocused] = useState<boolean>(false);
    const [key, setKey] = useState<string>("");
    const [error, setError] = useState<string>();

    const keyLength = 6;
    const keyInputs: number[] = [];

    for (let i = 0; i < keyLength; i++) {
        keyInputs.push(i);
    }

    const input = (input: string) => {
        const cleanInput = input.trim().toUpperCase();

        if (cleanInput.match(keyRegex)) {
            setKey(cleanInput);
        }
    }

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        const value = e.target.value;
        e.target.value = "";
        e.target.value = value;
    }

    useEffect(() => {
        if (joinGame.isSuccess) {
            navigate(`/preparation/${key}`);
        }
    }, [joinGame.isSuccess]);

    useEffect(() => {
        if (joinGame.error?.response?.data.message) {
            setError(joinGame.error?.response?.data.message);
        } else {
            setError(undefined);
        }
    }, [joinGame.error]);

    useEffect(() => {
        if (key.length < keyLength && error) {
            setError(undefined);
        }
    }, [key]);

    return(
        <div className={styles.joinByKey}>
            <h1>
                Key
            </h1>
            <p>
                Enter a key to join a game with a friend
            </p>
            <label htmlFor={INPUT} className={styles.keyInput} >
                <input
                    id={INPUT}
                    type={"text"}
                    pattern={keyRegex.source}
                    onChange={(e) => input(e.target.value)}
                    onFocus={e => handleFocus(e)}
                    onBlur={() => setFocused(false)}
                    value={key}
                />
                <ul>
                    {keyInputs.map(i =>
                        <li
                            className={focused && key.length === i ? styles.focused : ""}
                            key={i}
                        >
                            {key[i]}
                        </li>
                    )}
                </ul>
            </label>
            { error &&
                <p className={styles.errorDisplay} >
                    {error}
                </p>
            }
            <Button
                text={"Join"}
                onClick={() => joinGame.join(key)}
                loading={joinGame.isPending}
                disabled={key.length < 6}
            />
        </div>
    )
}

export default JoinGame;