import {FC, FocusEvent, useContext, useState} from "react";
import {joinMatch} from "../../api/homePageRequests.ts";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {ModalContext} from "../../Context.tsx";
import {useNavigate} from "react-router-dom";

const JoinGame: FC = () => {

    const navigate = useNavigate();

    const [key, setKey] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [focused, setFocused] = useState<boolean>(false);

    const {openInfoModal} = useContext(ModalContext);

    const keyRegex = /^[A-Z0-9]{0,6}$/;
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

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        const value = e.target.value;
        e.target.value = "";
        e.target.value = value;
    }

    return(
        <Modal>
            <div className="flex min-w-[112vh] min-h-[64vh]" >
                <div className="flex flex-col gap-4 p-8 justify-center" >
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
                </div>
                <div className="join-game-bg" ></div>
            </div>
        </Modal>
    );
}

export default JoinGame;