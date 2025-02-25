import "./Preparation.css";
import {useNavigate, useParams} from "react-router-dom";
import Deck from "./Deck.tsx";
import {FC, useCallback, useContext, useEffect, useState} from "react";
import {Button} from "../../components/Button.tsx";
import Frame from "../../components/Frame.tsx";
import {IBattle, IMatch, IUser} from "../../interfaces.ts";
import {io, Socket} from "socket.io-client";
import {parseTimeLimit} from "../../utils.ts";
import {findPlayerById} from "../../api/user.ts";
import {AuthContext, ModalContext} from "../../Context.tsx";
import LeaveMatchDialog from "./LeaveMatchDialog.tsx";
import WindowFrame from "../../components/WindowFrame.tsx";
import decksBaseInfo from "../../assets/decks.json";
import {keyRegex} from "../home/JoinGame.tsx";

interface IDeck {
    name: string;
    id: string;
    description: string;
    animation?: string;
    pos?: Pos;
}

enum Pos {
    center = "center",
    right = "right",
    left = "left"
}

const Preparation: FC = () => {

    const key = useParams().key;
    const navigate = useNavigate();

    const initDecks = (base: {name: string, id: string, description: string}[]) => {
        const decks: IDeck[] = [];
        const positions = [Pos.center, Pos.right, Pos.left];

        base.forEach((deck, index) => {
             decks.push({
                 name: deck.name,
                 id: deck.id,
                 description: deck.description,
                 animation: "",
                 pos: positions[index]
             })
        });

        return decks;
    }

    const { user, isLoading } = useContext(AuthContext);
    const { openForcedModal } = useContext(ModalContext);

    const [match, setMatch] = useState<IMatch>();
    const [opponent, setOpponent] = useState<IUser>();
    const [decks, setDecks] = useState<IDeck[]>(initDecks(decksBaseInfo));
    const [isHost, setIsHost] = useState<boolean>();
    const [isReady, setIsReady] = useState(false);
    const [opponentIsReady, setOpponentIsReady] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState<IDeck>(decksBaseInfo[0] as IDeck);
    const [socket, setSocket] = useState<Socket>();

    useEffect( () => {
        if (key && !isLoading) {
            if (key.match(keyRegex) && user) {
                if (!socket) {
                    setUpSocket(key, user.sub!)
                }
            } else {
                leavePage();
            }
        }
    }, [user, key, socket]);

    useEffect(() => {
        if (match) {
            processMatchData(match);
        }
    }, [match]);

    const leavePage = () => {
        socket?.disconnect();
        setSocket(undefined);
        navigate("/");
    }

    useEffect(() => {
        if (isReady && opponentIsReady) {
            setTimeout(() => {
                navigate(`/battle/${key}`);
            },
                1000
            );
        }
    }, [isReady, opponentIsReady]);

    const confirmReady = useCallback(() => {
        if (socket) {
            socket.emit("ready", {deck: selectedDeck.id});
        }
    }, [socket, selectedDeck]);

    const processMatchData = async (match: IMatch) => {
        if (match.stage === "pending") {
            return navigate("/");
        }

        if (match.stage === "started" && Object.keys(match.battle.playerStates).length === 2) {
            return navigate(`/battle/${key}`);
        }

        setMatch(match);
        const userId = user!.sub;
        if (userId && userId in (match.battle as IBattle).playerStates) {
            setIsReady(true);
        }

        setIsHost(userId === match.player1Id);
        const opponentId = [match.player1Id, match.player2Id].find(id => id !== userId);
        if (!opponentId) return navigate("/");

        if (opponentId in (match.battle as IBattle).playerStates) {
            setOpponentIsReady(true);
        }

        const opponentResult = await findPlayerById(opponentId);
        if (opponentResult.ok && opponentResult.body) {
            setOpponent(opponentResult.body as IUser);
        } else {
            navigate("/");
        }
    }

    const setUpSocket = (key: string, userId: string) => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL + "/battle",
            {
                auth: { userId },
                query: { key }
            }
        );

        socket.on("opponent-ready", () => {
            setOpponentIsReady(true);
        });

        socket.on("connection-fail", () => {
            leavePage();
        });

        socket.on("connected", (data: IMatch) => {
           setMatch(data);
        });

        socket.on("ready", () => {
            setIsReady(true);
        });

        setSocket(socket);
    }

    const handleOnClick = (pos: string) => {
        const rotateRight = (decks: IDeck[]): IDeck[] => {
            return decks.map((deck) => {
                let animation: string;
                let pos: Pos;

                switch (deck.pos) {
                    case Pos.center:
                        animation = "center-to-right";
                        pos = Pos.right;
                        break;
                    case Pos.right:
                        animation = "right-to-left";
                        pos = Pos.left;
                        break;
                    case Pos.left:
                        animation = "left-to-center";
                        pos = Pos.center;
                        break;
                    default:
                        return deck;
                }

                if (pos === Pos.center) {
                    setSelectedDeck(deck);
                }
                return { ...deck, pos, animation };
            });
        }

        const rotateLeft = (decks: IDeck[]): IDeck[] => {
            return decks.map((deck) => {
                let animation: string;
                let pos: Pos;

                switch (deck.pos) {
                    case Pos.center:
                        animation = "center-to-left";
                        pos = Pos.left;
                        break;
                    case Pos.right:
                        animation = "right-to-center";
                        pos = Pos.center;
                        break;
                    case Pos.left:
                        animation = "left-to-right";
                        pos = Pos.right;
                        break;
                    default:
                        return deck;
                }

                if (pos === Pos.center) {
                    setSelectedDeck(deck);
                }
                return { ...deck, pos, animation };
            });
        }

        if (!isReady) {
            switch (pos as keyof typeof Pos) {
                case Pos.right:
                    setDecks(prevState => rotateLeft(prevState));
                    break;
                case Pos.left:
                    setDecks(prevState => rotateRight(prevState));
                    break;
                default:
                    break;
            }
        }
    }

    //TODO: add loading screen

    return (
        <WindowFrame>
            { match && match.stage === "preparing" &&
                <main className="preparation" >
                    <div className="deck-selector-panel" >
                        <div className="title-text" ></div>
                        <div className="decks-container" >
                            {decks.map((deck) =>
                                <Deck
                                    key={deck.id}
                                    name={deck.name}
                                    id={deck.id}
                                    pos={deck.pos!}
                                    animation={deck.animation!}
                                    onClick={handleOnClick}
                                />
                            )}
                        </div>
                        <div className="h-40 flex flex-col gap-5 items-center" >
                            { !isReady ?
                                <span id="ready-btn">
                            <Button text={"Ready"} onClick={confirmReady} disabled={selectedDeck.id === "venom"} />
                        </span>
                                :
                                <h1 className="text-4xl animate-pulse" >
                                    Waiting for opponent...
                                </h1>
                            }
                            <Button
                                text={isHost ? "Abandon" : "Leave"}
                                onClick={() => openForcedModal(<LeaveMatchDialog matchKey={key} isHost={!!isHost} />)}
                            />
                        </div>
                        <div className="game-info-container" >
                            <Frame>
                                <div className="game-info-panel" >
                                    { opponent &&
                                        <>
                                            <div className="flex px-2 gap-2" >
                                                <img className="user-avatar" src={`../avatars/${opponent.picture || "1"}.jpg`} alt="" />
                                                <h1 className="text-2xl" >{opponent.username}</h1>
                                                { opponentIsReady ?
                                                    <i id="ready" className="fa-solid fa-check" ></i>
                                                    :
                                                    <i id="not-ready" className="fa-solid fa-spinner" ></i>
                                                }
                                            </div>
                                            <div className="hr" ></div>
                                        </>
                                    }
                                    { match && parseTimeLimit(match) &&
                                        <>
                                            <div className="text-xl px-2" >
                                                Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                                            </div>
                                            <div className="hr" ></div>
                                        </>
                                    }
                                    <div className="px-2" >
                                        <h1 className="text-2xl" >
                                            {selectedDeck.name}
                                        </h1>
                                        <p>
                                            {selectedDeck.description}
                                        </p>
                                    </div>
                                </div>
                            </Frame>
                        </div>
                    </div>
                </main>
            }
        </WindowFrame>
    );
}

export default Preparation;