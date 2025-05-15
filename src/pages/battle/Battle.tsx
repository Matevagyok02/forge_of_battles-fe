import {useNavigate, useParams} from "react-router-dom";
import {FC, Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {IBattle, ICard, IMatch, IPlayerState, MatchStage} from "../../interfaces.ts";
import {AuthContext, MatchContext, ModalContext} from "../../context.tsx";
import Board, {deckColorStyles} from "./Board.tsx";
import BattleChat from "./BattleChat.tsx";
import {OpponentHand, PlayerHand} from "./Hands.tsx";
import {getCardsById, isMatchAbandoned} from "../../api/api.ts";
import {io, Socket} from "socket.io-client";
import {keyRegex} from "../home/main_interface_components/JoinGame.tsx";
import HudContainer from "./Hud.tsx";
import EventDisplay, {EventDisplayHandle} from "./EventDisplay.tsx";
import LoadingScreen from "../../components/LoadingScreen.tsx";
import BattleInterface from "./ui/BattleInterface.tsx";
import ResultScreen, {getWinner, hasPlayerLost, MatchResult} from "./ResultScreen.tsx";
import EffectDisplay from "./EffectDisplay.tsx";
import styles from "../../styles/battle_page/Battle.module.css";
import events from "../../assets/events.json";
import MatchCancelledDialog from "./MatchCancelledDialog.tsx";
import AttackAnimationDisplay, {AttackAnimationHandle} from "./components/AttackAnimationDisplay.tsx";
import {Button} from "../../components/Button.tsx";

export enum IncomingBattleEvent {
    turnStarted = "turn-started",
    turnEnded = "turn-ended",
    drawn = "drawn",
    redrawn = "redrawn",
    advanced = "advanced",
    deployed = "deployed",
    usedAction = "used-action",
    usedPassive = "used-passive",
    addedMana = "added-mana",
    movedToFront = "moved-to-front",
}

export enum OutgoingBattleEvent {
    startTurn = "start-turn",
    endTurn = "end-turn",
    advance = "advance",
    draw = "draw",
    redraw = "redraw",
    deploy = "deploy",
    useAction = "use-action",
    usePassive = "use-passive",
    attack = "attack",
    addMana = "add-mana",
    moveToFront = "move-to-front"
}

const Battle: FC = () => {

    const navigate = useNavigate();
    const key = useParams().key;
    const [match, setMatch] = useState<IMatch>();
    const [player, setPlayer] = useState<IPlayerState>();
    const [opponent, setOpponent] = useState<IPlayerState>();
    const [cards, setCards] = useState<ICard[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<Socket>();
    const [tip, setTip] = useState<string>();

    const [winner, setWinner] = useState<string>();
    const [showResult, setShowResult] = useState<boolean>(false);

    const eventDisplay = useRef<EventDisplayHandle | null>(null);
    const attackAnimationDisplay = useRef<AttackAnimationHandle | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {user, isAuthenticated} = useContext(AuthContext);
    const { openForcedModal } = useContext(ModalContext);

    const setBattleData = (data: { battle: IBattle } | IMatch) => {
        setMatch(prevState =>
            prevState ?
                { ...prevState, battle: data.battle }
                :
                { battle: data.battle } as IMatch
        );
    }

    const displayEvent = useCallback((text: string, alert?: boolean) => {
        if (eventDisplay.current) {
            eventDisplay.current!.displayText(text, alert);
        }
    }, [eventDisplay.current]);

    const playerAttack = useCallback(() => {
        if (attackAnimationDisplay.current) {
            attackAnimationDisplay.current!.playerAttack();
        }
    }, [attackAnimationDisplay.current]);

    const opponentAttack = useCallback(() => {
        if (attackAnimationDisplay.current) {
            attackAnimationDisplay.current!.opponentAttack();
        }
    }, [attackAnimationDisplay.current]);

    const setUpSocket = (matchKey: string) => {
        const socket = io(
            import.meta.env.VITE_SOCKET_URL + "/battle",
            {
                auth: { userId: user!.sub },
                query: { key: matchKey }
            }
        );

        socket.on("connection-fail", () => {
                leavePage();
        });

        socket.on("error", () => {
            displayEvent(events.error, true);
        });

        socket.on("connected", setMatch);

        socket.on("attacked", (data: { battle: IBattle }) => {
            setBattleData(data);
            playerAttack();
        });

        socket.on("opponent-attacked", (data: { battle: IBattle }) => {
            setBattleData(data);
            opponentAttack();
        });

        setTimeout(
            () => socket.on("opponent-connected", () => displayEvent(events.opponent_connected)),
            5000
        );

        socket.on("opponent-left", () => {
            displayEvent(events.opponent_disconnected, true);
            setTimeout(async () => {
                const isAbandoned = (await isMatchAbandoned(matchKey)).data.isAbandoned;

                if (isAbandoned) {
                    openForcedModal(
                        <MatchCancelledDialog />
                    );
                }
            }, 1000);
        });

        socket.on("match-ended", setMatch);

        socket.on("match-cancelled", () => {
            if (match) {
                openForcedModal(
                    <MatchCancelledDialog/>
                );
            } else {
                leavePage();
            }
        });

        Object.values(IncomingBattleEvent).forEach(event => {
            socket.on("opponent-" + event, event !== IncomingBattleEvent.turnEnded ?
                setBattleData
                :
                (data: { battle: IBattle }) => {
                    setBattleData(data);
                    socket.emit(OutgoingBattleEvent.startTurn);
                });

            socket.on(event, event !== IncomingBattleEvent.turnStarted ?
                setBattleData
                :
                (data: { battle: IBattle }) => {
                    setBattleData(data);
                    displayEvent(events.turn_started);
                });
        });

        setSocket(socket);
    }

    const loadCards = useCallback(async (ids: string[]) => {
        const requestedCards: ICard[] = [];
        const cardStore: ICard[] = [];
        const notFoundCards: string[] = [];

        ids.forEach(id => {
            const card = cards.find(card => card.id === id);
            if (card) {
                cardStore.push(card);
            } else {
                notFoundCards.push(id);
            }
        })

        if (notFoundCards.length > 0) {
            const response = await getCardsById(notFoundCards);
            if (response.status === 200 && response.data) {
                const newCards = [...response.data];
                cardStore.push(...newCards);
                setCards(prevState => [...prevState, ...newCards]);
            }
        }

        ids.forEach(id => {
            const card = cardStore.find(card => card.id === id);
            if (card) {
                requestedCards.push(card);
            }
        });

        return requestedCards;
    }, [cards]);

    useEffect(() => {
        if (match && user?.sub) {
            const opponentId = match.player1Id === user.sub ? match.player2Id : match.player1Id;

            const player = match.battle?.playerStates[user.sub];
            const opponent = match.battle?.playerStates[opponentId];

            if (player && opponent) {
                player.userId = user.sub;
                opponent.userId = opponentId;

                setPlayer(prevState => prevState ? {...prevState, ...player} : player);
                setOpponent(prevState => prevState ? {...prevState, ...opponent} : opponent);
            }
        }
    }, [match, user]);

    useEffect(() => {
        if (socket) {
            socket.emit("register");
        }
    }, [socket]);

    useEffect( () => {
        if (isAuthenticated) {
            if (user && key && (key.match(keyRegex) || key === "test")) {
                if (!socket) {
                    setUpSocket(key);
                }
            } else {
                leavePage();
            }
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        }
    }, [isAuthenticated, user, key, socket]);

    const leavePage = () => {
        socket?.disconnect();
        navigate("/");
    }

    useEffect(() => {
        if (
            socket &&
            player &&
            player.turnStage === 1 &&
            player.drawsPerTurn > 1 &&
            Object.keys(player.deployedCards).length < 1
        ) {
            socket.emit(OutgoingBattleEvent.advance);
        }
    }, [socket, player?.turnStage, player?.drawsPerTurn, player?.deployedCards]);

    useEffect(() => {
        if (!loading && socket && player && match && match.battle.turnOfPlayer === player.userId && player.turnStage === 0) {
            socket.emit(OutgoingBattleEvent.startTurn);
        }
    }, [loading, player?.turnStage, match?.battle?.turnOfPlayer, socket]);

    useEffect(() => {
        if (socket && match && player && opponent) {
            setTimeout(() => setLoading(false), 1000);
        }
    }, [match, player, opponent, socket]);

    useEffect(() => {
        if (
            player &&
            hasPlayerLost(player) ||
            opponent &&
            hasPlayerLost(opponent) ||
            match?.stage === MatchStage.finished
        ) {
            const _winner = match && getWinner(player!, opponent!);
            if (_winner) {
                switch (_winner) {
                    case MatchResult.draw:
                        displayEvent(MatchResult.draw);
                        break;
                    case user?.sub:
                        displayEvent(MatchResult.victory);
                        break;
                    default:
                        displayEvent(MatchResult.defeat, true);
                        break;
                }

                setWinner(() => {
                    setTimeout(() => setShowResult(true), 3000);
                    return _winner;
                });
            }
        }
    }, [match?.stage, player, opponent]);

    return(
        <main className={styles.battle} >
            <LoadingScreen loading={loading} />
            { winner && showResult ?
                <Suspense fallback={<LoadingScreen />} >
                    <ResultScreen match={match!} player={player!} opponent={opponent!} />
                </Suspense>
                :
                <Suspense fallback={<LoadingScreen />} >
                    { socket && match && player && opponent &&
                        <MatchContext.Provider value={{
                            match,
                            loadCards,
                            player,
                            opponent,
                            socket: socket!,
                            tip,
                            setTip,
                            containerRef: containerRef.current ? containerRef.current as HTMLElement : undefined
                        }} >
                            <div id={"battle-container"} ref={containerRef} >
                                <HudContainer />
                                <OpponentHand />
                                <PlayerHand />
                                <Board />
                                <BattleChat />
                                <EventDisplay ref={eventDisplay} />
                                <BattleInterface />
                                <EffectDisplay />
                                <AttackAnimationDisplay ref={attackAnimationDisplay} />
                                <div className="fixed z-50 left-4 top-1/2" >
                                    <Button text={"Attack"} onClick={playerAttack} />
                                    <Button text={"Attack 2"} onClick={opponentAttack} />
                                </div>
                            </div>
                        </MatchContext.Provider>
                    }
                </Suspense>
            }
        </main>
    );
}

export default Battle;