import {FC, FocusEvent, useContext, useEffect, useState} from "react";
import {getActiveMatch, joinMatch, leaveMatch} from "../../api/match.ts";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {ModalContext} from "../../Context.tsx";
import {useNavigate} from "react-router-dom";
import {IBattle, IMatch, IUser} from "../../interfaces.ts";
import {findPlayerById} from "../../api/user.ts";
import {parseTimeLimit} from "../../utils.ts";

const JoinGame: FC = () => {

    const navigate = useNavigate();

    const [key, setKey] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [focused, setFocused] = useState<boolean>(false);
    const [activeMatch, setActiveMatch] = useState<{ match: IMatch, opponent: IUser }>();

    const {openInfoModal} = useContext(ModalContext);

    const keyRegex = /^[A-Z0-9]{0,6}$/;
    const keyLength = 6;
    const keyInputs: number[] = [];

    for (let i = 0; i < keyLength; i++) {
        keyInputs.push(i);
    }

    useEffect(() => {
        getActiveMatch().then(result => {
            if (result.ok && result.body) {
                const match = result.body as IMatch;

                if (match.player1Id) {
                    findPlayerById(match.player1Id).then(result => {
                        if (result.ok && result.body) {
                            const opponent = result.body as IUser;
                            setActiveMatch({ match, opponent });
                            setLoading(false);
                        }
                    });
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
    }, []);

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

        joinMatch(key).then(result => {
            if (result.ok) {
                navigate(`/preparation/${key}`);
            } else {
                setErrorMsg("You cannot join this game");
            }

            setLoading(false);
        });
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

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        const value = e.target.value;
        e.target.value = "";
        e.target.value = value;
    }

    return(
        <Modal>
            <div className="flex min-w-[112vh] min-h-[64vh]" >
                <div className="flex flex-col gap-4 p-8 justify-center items-center" >
                    { !loading &&
                        <>
                            { activeMatch ?
                                <>
                                    <h1 className="text-center w-80" >
                                        You are inside an ongoing match. Finish or leave it before joining another one
                                    </h1>
                                    { activeMatch.opponent &&
                                        <div className="flex px-2 gap-2" >
                                            <img className="user-avatar" src={`../avatars/${activeMatch.opponent.picture || "1"}.jpg`} alt="" />
                                            <h1 className="text-2xl" >{activeMatch.opponent.username}</h1>
                                        </div>
                                    }
                                    <div className="hr" ></div>
                                    {
                                        (activeMatch.match.battle as IBattle).timeLimit &&
                                        <div className="text-xl px-2" >
                                            Time limit: {parseTimeLimit(activeMatch.match)}|{parseTimeLimit(activeMatch.match)} min
                                        </div>
                                    }
                                    { activeMatch.match &&
                                        <div className="pt-4 flex flex-col gap-4" >
                                            <Button text={"Rejoin"} onClick={() => navigate(`/preparation/${activeMatch!.match.key}`)} />
                                            <Button text={"Leave"} onClick={leaveOngoingMatch} />
                                        </div>
                                    }
                                </>
                                :
                                <>
                                    <div className="flex flex-col gap-4 items-center">
                                        <h1 className="text-3xl font-amarante" >
                                            Random
                                        </h1>
                                        <p className="w-2/3 text-center" >
                                            Join a random game to fight against strangers
                                        </p>
                                        <Button text="Queue Up" onClick={joinRandom} loading={loading} />
                                    </div>
                                    <span className="hr" ></span>
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
                                            onClick={joinWithKey}
                                            loading={loading}
                                            disabled={key.length < 6}
                                        />
                                    </div>
                                </>
                            }
                        </>
                    }
                </div>
                <div className="join-game-bg" ></div>
            </div>
        </Modal>
    );
}

export default JoinGame;