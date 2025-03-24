import {FC, FocusEvent, useContext, useEffect, useState} from "react";
import {getActiveMatch, joinMatch, joinQueue, leaveMatch, leaveQueue} from "../../../api/match.ts";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import {ModalContext, UserContext} from "../../../context.tsx";
import {useNavigate} from "react-router-dom";
import {IBattle, IMatch, IUser} from "../../../interfaces.ts";
import {findPlayerById} from "../../../api/user.ts";
import {parseTimeLimit} from "../../../utils.ts";
import styles from "../../../styles/home_page/OptionCardContent.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";

export const keyRegex = /^[A-Z0-9]{0,6}$/;

interface JoinGameProps {
    activeMatch?: IMatch;
    inQueue?: boolean;
}

const JoinGame: FC<JoinGameProps> = (props) => {

    const navigate = useNavigate();
    const { _user } = useContext(UserContext);

    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    const [activeMatch, setActiveMatch] = useState<{ match: IMatch, opponent: IUser }>();
    const [inQueue, setInQueue] = useState<boolean | undefined>(props.inQueue);

    const {openInfoModal} = useContext(ModalContext);

    const getOpponentDetails = async (match: IMatch) => {
        const opponentId = match.player1Id !== _user?.userId ? match.player1Id : match.player2Id;

        const result = await findPlayerById(opponentId);
        if (result.ok && result.body) {
            return  result.body as IUser;
        } else {
            return undefined;
        }
    }

    const fetchActiveMatch = async () => {
        const result = await getActiveMatch();
        if (result.ok && result.body) {
            if ((result.body as IMatch).key) {
                const match = result.body as IMatch;

                getOpponentDetails(match).then(opponent => {
                    if (opponent) {
                        setActiveMatch({ match, opponent });
                    }
                });
            } else {
                setInQueue(true);
            }
        }
    }

    useEffect(() => {
        if (props.activeMatch || props.inQueue) {
            if (props.activeMatch) {
                getOpponentDetails(props.activeMatch).then(opponent => {
                    if (opponent) {
                        setActiveMatch({ match: props.activeMatch!, opponent });
                    } else {
                        setLoading(false);
                    }
                });
            } else {
                setInQueue(true);
            }
        } else {
            fetchActiveMatch().then(() => setLoading(false));
        }
    }, [props.inQueue, props.activeMatch]);

    useEffect(() => {
        if (activeMatch || inQueue) {
            setLoading(false);
        }
    }, [activeMatch, inQueue]);

    const joinRandom = async () => {
        const result = await joinQueue();
        if (result?.ok) {
            setInQueue(true);
        }
    }

    const leaveRandom = async () => {
        const result = await leaveQueue();
        if (result?.ok) {
            setInQueue(false);
        }
    }

    const leaveOngoingMatch = () => {
        leaveMatch().then(result => {
            if (result.ok) {
                setActiveMatch(undefined);
            } else {
                openInfoModal(
                    <p className="px-4" >
                        Failed to leave the match, try again later
                    </p>
                );
            }
        });
    }

    const joinWithKey = (key: string) => {
        setLoading(true);

        joinMatch(key).then(result => {
            if (result.ok) {
                navigate(`/preparation/${key}`);
            } else {
                setErrorMsg("You cannot join this game");
            }

            setLoading(false);
        });
    }

    const rejoinMatch = (key: string) => {
        navigate(`/preparation/${key}`);
    }

    return(
        <Modal canBeClosed={!activeMatch && !inQueue} >
            <div className={styles.joinGamePanel} >
                { activeMatch ?
                    <JoinActiveMatch
                        match={activeMatch.match}
                        opponent={activeMatch.opponent}
                        rejoin={() => rejoinMatch(activeMatch!.match.key)}
                        leave={leaveOngoingMatch}
                    />
                    :
                    inQueue ?
                        <Queue leave={leaveRandom} />
                        :
                        <div className={styles.content}>
                            <JoinRandom join={joinRandom} loading={loading} />
                            <horizontal-line/>
                            <JoinByKey
                                join={joinWithKey}
                                loading={loading}
                                errorMsg={errorMsg}
                            />
                        </div>
                }
                <div className={styles.background} ></div>
            </div>
        </Modal>
    );
}

const Queue: FC<{ leave: () => void }> = ({ leave }) => {

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
                <i className={"loading-spinner"} ></i>
                <p>
                    Searching for available players...
                </p>
            </div>
            <Button text={"Leave"} onClick={leave} />
        </div>
    );
}

const JoinActiveMatch: FC<{ match: IMatch, opponent: IUser, rejoin: () => void, leave: () => void }> = ({ match, opponent, rejoin, leave }) => {

    return(
        <div className={[styles.activeMatch, styles.content].join(" ")} >
            <p>
                You are inside an ongoing match. Finish or leave it before joining another one
            </p>
            <div className={"flex flex-col"} >
                { opponent &&
                    <div className={styles.opponent} >
                        <AvatarDisplay avatar={opponent.picture} />
                        <h1>{opponent.username}</h1>
                    </div>
                }
                <horizontal-line/>
                {(match.battle as IBattle).timeLimit &&
                    <div className={styles.timeLimitDisplay} >
                        Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                    </div>
                }
            </div>
            <menu>
                <Button text={"Rejoin"} onClick={rejoin} />
                <Button text={"Leave"} onClick={leave} />
            </menu>
        </div>
    );
}

const JoinRandom: FC<{ join: () => void, loading: boolean }> = ({ join, loading }) => {

    return(
        <div className={styles.joinRandom}>
            <h1>
                Random
            </h1>
            <p>
                Join a random game to fight against strangers
            </p>
            <Button text="Queue Up" onClick={join} loading={loading} />
        </div>
    );
}

const JoinByKey: FC<{ join: (key: string) => void, loading: boolean, errorMsg?: string }> = ({ join, loading, errorMsg }) => {

    const INPUT = "key-input";

    const [focused, setFocused] = useState<boolean>(false);
    const [key, setKey] = useState<string>("");

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
            { errorMsg &&
                <p className={styles.errorDisplay} >
                    {errorMsg}
                </p>
            }
            <Button
                text="Join"
                onClick={() => join(key)}
                loading={loading}
                disabled={key.length < 6}
            />
        </div>
    )
}

export default JoinGame;