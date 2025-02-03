import "./Preparation.css";
import {useNavigate, useParams} from "react-router-dom";
import Deck from "./Deck.tsx";
import {FC, useCallback, useEffect, useState} from "react";
import {Button} from "../../components/Button.tsx";
import Frame from "../../components/Frame.tsx";
import {IBattle, IMatch, IUser} from "../../interfaces.ts";
import {findPlayerById, getMatchByKey} from "../../api/prepRoomRequests.ts";
import {io, Socket} from "socket.io-client";
import {useAuth0} from "@auth0/auth0-react";

interface IDeck {
    name: string;
    id: string;
    description: string;
    animation: string;
    pos: Pos;
}

enum Pos {
    center = "center",
    right = "right",
    left = "left"
}

const decksBaseInfo = [
    {name: "Light", id: "light", description: "A deck that focuses on healing and buffing allies."},
    {name: "Darkness", id: "darkness", description: "A deck that focuses on debuffing enemies and dealing damage."},
    {name: "Venom", id: "venom", description: "A deck that focuses on poisoning enemies and dealing damage. (This deck is still under development)"}
];

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
    const { user } = useAuth0();

    const [match, setMatch] = useState<IMatch>();
    const [opponent, setOpponent] = useState<IUser>();
    const [decks, setDecks] = useState<IDeck[]>(initDecks(decksBaseInfo));
    const [isReady, setIsReady] = useState(false);
    const [opponentIsReady, setOpponentIsReady] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState<IDeck>(decksBaseInfo[0] as IDeck);
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        if (user) {
            if (key !== "test") {
                loadMatch();
            }

            if (!socket) {
                setUpSocket();
            }
        }
    }, [user]);

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
            setIsReady(true);
        }
    }, [socket, selectedDeck]);

    const loadMatch = () => {
        if (key) {
            getMatchByKey(key).then((result) => {
                if(result.ok && result.body
                    && (result.body as IMatch).stage !== "pending"
                ) {
                    const match = result.body as IMatch;

                    if (match.stage === "preparing") {
                        const match = result.body as IMatch;
                        setMatch(match);

                        const userId = user!.sub;

                        if (userId && userId in (match.battle as IBattle).playerStates) {
                            setIsReady(true);
                        }

                        const opponentId = [match.player1Id, match.player2Id].find(id => id !== userId);

                        if (opponentId) {
                            if (opponentId in (match.battle as IBattle).playerStates) {
                                setOpponentIsReady(true);
                            }

                            findPlayerById(opponentId).then((result) => {
                                if (result.ok && result.body) {
                                    setOpponent(result.body as IUser);
                                } else {
                                    navigate("/");
                                }
                            });
                        } else {
                            navigate("/");
                        }
                    } else {
                        navigate(`/battle/${key}`);
                    }
                } else {
                    navigate("/");
                }
            });
        } else {
            navigate("/");
        }
    }

    const setUpSocket = () => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL + "/battle",
            {
                auth: { userId: user!.sub },
                query: { key }
            }
        );

        socket.on("opponent-ready", () => {
            setOpponentIsReady(true);
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

    return (
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
                <div className="p-12 h-40" >
                    { !isReady ?
                        <Button text={"Ready"} onClick={confirmReady} disabled={selectedDeck.id === "venom"} />
                        :
                        <h1 className="text-4xl animate-pulse" >
                            Waiting for opponent...
                        </h1>
                    }
                </div>
                <div className="game-info-container" >
                    <Frame>
                        <div className="game-info-panel" >
                            { opponent &&
                                <>
                                    <div className="flex px-2 gap-2" >
                                        <img src={`../avatars/${opponent.picture || "1"}.jpg`} alt="" />
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
    );
}

const parseTimeLimit = (match: IMatch): number | undefined => {
    const timeLimit = (match.battle as IBattle).timeLimit;

    return timeLimit
        ? timeLimit / 1000 / 60
        : undefined;
}

export default Preparation;