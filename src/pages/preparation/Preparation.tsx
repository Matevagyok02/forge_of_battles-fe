import {useNavigate, useParams} from "react-router-dom";
import Deck, {IDeck, initDecks, Pos, Animation, Positions, Animations} from "./Deck.tsx";
import {FC, Suspense, useCallback, useContext, useEffect, useState} from "react";
import {Button} from "../../components/Button.tsx";
import {Frame, WindowFrame} from "../../components/Frame.tsx";
import {IBattle, IMatch, IUser, MatchStage} from "../../interfaces.ts";
import {io, Socket} from "socket.io-client";
import {parseTimeLimit} from "../../utils.ts";
import {findPlayerById} from "../../api/user.ts";
import {AuthContext, ModalContext} from "../../context.tsx";
import LeaveMatchDialog from "./LeaveMatchDialog.tsx";
import {keyRegex} from "../home/main_interface_components/JoinGame.tsx";
import LoadingScreen from "../../components/LoadingScreen.tsx";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import styles from "../../styles/preparation_page/Preparation.module.css";
import "../../custom-elements.d.ts";

const Preparation: FC = () => {

    const key = useParams().key;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const { user, isAuthenticated } = useContext(AuthContext);
    const { openForcedModal } = useContext(ModalContext);

    const [match, setMatch] = useState<IMatch>();
    const [opponent, setOpponent] = useState<IUser>();
    const [decks, setDecks] = useState<IDeck[]>(initDecks());
    const [isHost, setIsHost] = useState<boolean>();
    const [isReady, setIsReady] = useState(false);
    const [opponentIsReady, setOpponentIsReady] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState<IDeck>(decks[0]);
    const [socket, setSocket] = useState<Socket>();

    useEffect( () => {
        if (key && isAuthenticated) {
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
        if (socket) {
            socket.emit("register");
        }
    }, [socket]);

    useEffect(() => {
        if (match) {
            processMatchData(match).then(() =>
                setTimeout(() =>
                    setLoading(false), 2000)
            );
        }
    }, [match]);

    const leavePage = () => {
        socket?.disconnect();
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
        if (match.stage === MatchStage.pending) {
            leavePage();
            return;
        }

        if (match.stage === MatchStage.started && Object.keys(match.battle.playerStates).length === 2) {
            return navigate(`/battle/${key}`);
        }

        setMatch(match);
        const userId = user!.sub;
        if (userId && userId in (match.battle as IBattle).playerStates) {
            setIsReady(true);
        }

        setIsHost(userId === match.player1Id && !match.randomMatch);
        const opponentId = [match.player1Id, match.player2Id].find(id => id !== userId);
        if (!opponentId) {
            leavePage();
            return;
        }

        if (opponentId in (match.battle as IBattle).playerStates) {
            setOpponentIsReady(true);
        }

        const opponentResult = await findPlayerById(opponentId);
        if (opponentResult.ok && opponentResult.body) {
            setOpponent(opponentResult.body as IUser);
        } else {
            leavePage();
            return;
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

    const handleOnClick = (clickedPos: Pos) => {
        const rotateRight = (decks: IDeck[]): IDeck[] => {
            return decks.map((deck) => {
                let animation: Animation;
                let pos: Pos;

                switch (deck.pos) {
                    case Positions.center:
                        animation = Animations.centerToRight;
                        pos = Positions.right;
                        break;
                    case Positions.right:
                        animation = Animations.rightToLeft;
                        pos = Positions.left;
                        break;
                    case Positions.left:
                        animation = Animations.leftToCenter;
                        pos = Positions.center;
                        break;
                    default:
                        return deck;
                }

                if (pos === Positions.center) {
                    setSelectedDeck(deck);
                }
                return { ...deck, pos, animation };
            });
        }

        const rotateLeft = (decks: IDeck[]): IDeck[] => {
            return decks.map((deck) => {
                let animation: Animation;
                let pos: Pos;

                switch (deck.pos) {
                    case Positions.center:
                        animation = Animations.centerToLeft;
                        pos = Positions.left;
                        break;
                    case Positions.right:
                        animation = Animations.rightToCenter;
                        pos = Positions.center;
                        break;
                    case Positions.left:
                        animation = Animations.leftToRight;
                        pos = Positions.right;
                        break;
                    default:
                        return deck;
                }

                if (pos === Positions.center) {
                    setSelectedDeck(deck);
                }
                return { ...deck, pos, animation };
            });
        }

        if (!isReady) {
            switch (clickedPos) {
                case Positions.right:
                    setDecks(prevState => rotateLeft(prevState));
                    break;
                case Positions.left:
                    setDecks(prevState => rotateRight(prevState));
                    break;
                default:
                    break;
            }
        }
    }

    return (
        <WindowFrame>
            <LoadingScreen loading={loading} />
            <Suspense fallback={<LoadingScreen />} >
                <main className={styles.preparation} >
                    <div className={styles.deckSelectionContainer} >
                        <h1>
                            Select your deck
                        </h1>

                        <div className={styles.decks} >
                            {decks.map((deck) =>
                                <Deck
                                    key={deck.id}
                                    name={deck.name}
                                    background={deck.background}
                                    id={deck.id}
                                    pos={deck.pos!}
                                    animation={deck.animation!}
                                    onClick={handleOnClick}
                                />
                            )}
                        </div>

                        <menu>
                            { !isReady ?
                                <span className={styles.readyButton} >
                                    <Button
                                        text={"Ready"}
                                        onClick={confirmReady}
                                        disabled={selectedDeck.id === "venom"}
                                    />
                                </span>
                                :
                                <h1 className="animate-pulse" >
                                    Waiting for opponent...
                                </h1>
                            }
                            <Button
                                text={isHost ? "Abandon" : "Leave"}
                                onClick={() => openForcedModal(<LeaveMatchDialog matchKey={key} isHost={!!isHost} />)}
                            />
                        </menu>
                    </div>

                    <div className={styles.infoDisplayContainer} >
                        <Frame>
                            <div className={styles.infoDisplay} >
                                { opponent &&
                                    <>
                                        <div className={styles.opponentStatus} >
                                            <AvatarDisplay avatar={opponent.picture} />
                                            <h1>{opponent.username}</h1>
                                            <i
                                                data-value={opponentIsReady}
                                                className={`fa-solid fa-${opponentIsReady ? "check animate-pulse" : "spinner animate-spin"}`}
                                            />
                                        </div>
                                        <horizontal-line/>
                                    </>
                                }
                                { match && parseTimeLimit(match) &&
                                    <>
                                        <div className={styles.timeLeft} >
                                            Time limit: {parseTimeLimit(match)}|{parseTimeLimit(match)} min
                                        </div>
                                        <horizontal-line/>
                                    </>
                                }
                                <div className={styles.deckInfo} >
                                    <h1
                                        style={{ color: `var(--${selectedDeck.id}-1)` }}
                                    >
                                        {selectedDeck.name}
                                    </h1>
                                    <p>
                                        {selectedDeck.description}
                                    </p>
                                </div>
                            </div>
                        </Frame>
                    </div>
                </main>
            </Suspense>
        </WindowFrame>
    );
}

export default Preparation;