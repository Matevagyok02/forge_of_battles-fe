import {FC, FocusEvent, useContext, useEffect, useState} from "react";
import {getActiveMatch, joinMatch, joinQueue, leaveMatch, leaveQueue} from "../../api/match.ts";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {ModalContext} from "../../context.tsx";
import {useNavigate} from "react-router-dom";
import {IBattle, IMatch, IUser} from "../../interfaces.ts";
import {findPlayerById} from "../../api/user.ts";
import {parseTimeLimit} from "../../utils.ts";

export const keyRegex = /^[A-Z0-9]{0,6}$/;

interface JoinGameProps {
    activeMatch?: IMatch;
    inQueue?: boolean;
}

const JoinGame: FC<JoinGameProps> = (props) => {

    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    const [activeMatch, setActiveMatch] = useState<{ match: IMatch, opponent: IUser }>();
    const [inQueue, setInQueue] = useState<boolean | undefined>(props.inQueue);

    const {openInfoModal} = useContext(ModalContext);

    const getOpponentDetails = async (match: IMatch) => {
        const result = await findPlayerById(match.player1Id);
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
        <Modal closeCondition={!activeMatch && !inQueue} >
            <div className="flex min-w-[112vh] min-h-[64vh]" >
                <div className="flex flex-col gap-4 p-8 justify-center items-center w-1/2" >
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
                            <>
                                <JoinRandom join={joinRandom} loading={loading} />
                                <span className="hr" ></span>
                                <JoinByKey
                                    join={joinWithKey}
                                    loading={loading}
                                    errorMsg={errorMsg}
                                />
                            </>
                    }
                </div>
                <div className="join-game-bg" ></div>
            </div>
        </Modal>
    );
}

const Queue: FC<{ leave: () => void }> = ({ leave }) =>
{

    return(
        <div className="flex flex-col justify-between gap-4 items-center h-full">
            <div className="flex flex-col items-center" >
                <h1 className="text-3xl font-amarante" >
                    Random
                </h1>
                <p className="w-2/3 text-center" >
                    You are in the queue. Wait for an opponent to join
                </p>
            </div>
            <div className="flex flex-col items-center gap-2" >
                <div className="loading-spinner w-1/3" ></div>
                <p className="animate-pulse" >
                    Searching for available players...
                </p>
            </div>
            <Button text="Leave" onClick={leave} />
        </div>
    );
}

const JoinActiveMatch: FC<{ match: IMatch, opponent: IUser, rejoin: () => void, leave: () => void }> = ({ match, opponent, rejoin, leave }) => {

    return(
        <>
            <h1 className="text-center w-80" >
                You are inside an ongoing match. Finish or leave it before joining another one
            </h1>
            { opponent &&
                <div className="flex px-2 gap-2" >
                    <img className="user-avatar" src={`../avatars/${opponent.picture || "1"}.jpg`} alt="" />
                    <h1 className="text-2xl" >{opponent.username}</h1>
                </div>
            }
            <div className="hr" ></div>
            {
                (match.battle as IBattle).timeLimit &&
                <div className="text-xl px-2" >
                    Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                </div>
            }
            { match &&
                <div className="pt-4 flex flex-col gap-4" >
                    <Button text={"Rejoin"} onClick={rejoin} />
                    <Button text={"Leave"} onClick={leave} />
                </div>
            }
        </>
    );
}

const JoinRandom: FC<{ join: () => void, loading: boolean }> = ({ join, loading }) => {

    return(
        <div className="flex flex-col gap-4 items-center h-full">
            <h1 className="text-3xl font-amarante" >
                Random
            </h1>
            <p className="w-2/3 text-center" >
                Join a random game to fight against strangers
            </p>
            <Button text="Queue Up" onClick={join} loading={loading} />
        </div>
    );
}

const JoinByKey: FC<{ join: (key: string) => void, loading: boolean, errorMsg?: string }> = ({ join, loading, errorMsg }) => {

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
        <div className="flex flex-col gap-4 items-center">
            <h1 className="text-3xl font-amarante" >
                Key
            </h1>
            <p className="text-center" >
                Enter a key to join a game with a friend
            </p>
            <label htmlFor={"key-input"} className="key-input" >
                <input
                    id={"key-input"}
                    type="text"
                    pattern={keyRegex.source}
                    onChange={(e) => input(e.target.value)}
                    onFocus={e => handleFocus(e)}
                    onBlur={() => setFocused(false)}
                />
                <ul className={`key-input-display ${focused ? "focused" : ""}`} >
                    {keyInputs.map(i =>
                        <li
                            key={i}
                        >
                            {key[i]}
                        </li>
                    )}
                </ul>
            </label>
            { errorMsg &&
                <p className="error-text" >
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