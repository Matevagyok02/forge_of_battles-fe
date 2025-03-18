import {useNavigate, useParams} from "react-router-dom";
import {FC, Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import "./Battle.css";
import "./cards/Cards.css";
import {IBattle, ICard, IMatch, IPlayerState} from "../../interfaces.ts";
import {AuthContext, MatchContext} from "../../context.tsx";
import Board from "./Board.tsx";
import BattleChat from "./BattleChat.tsx";
import {PlayerHand, OpponentHand} from "./Hands.tsx";
import {getCardsById} from "../../api/cards.ts";
import {io, Socket} from "socket.io-client";
import {keyRegex} from "../home/main_interface_components/JoinGame.tsx";
import HudContainer from "./Hud.tsx";
import EventDisplay, {EventDisplayHandle} from "./EventDisplay.tsx";
import LoadingScreen from "../../components/LoadingScreen.tsx";
import BattleInterface from "./ui/BattleInterface.tsx";
import ResultScreen, {getWinner, MatchResult} from "./ResultScreen.tsx";
import EffectDisplay from "./EffectDisplay.tsx";

export enum IncomingBattleEvent {
    turnStarted = "turn-started",
    turnEnded = "turn-ended",
    drawn = "drawn",
    redrawn = "redrawn",
    advanced = "advanced",
    deployed = "deployed",
    usedAction = "used-action",
    usedPassive = "used-passive",
    stormed = "stormed",
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
    storm = "storm",
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
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {user, isAuthenticated} = useContext(AuthContext);

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
            displayEvent("Oops! Something went wrong. Try again.", true);
        });

        socket.on("connected", setMatch);

        socket.on("match-ended", setMatch);

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
                    displayEvent("Your turn has started!");
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
            if (response?.ok && response?.body && Array.isArray(response.body)) {
                const newCards = [...response.body];
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

            console.log(match.player1Id, match.player2Id);
            if (player && opponent) {
                player.userId = user.sub;
                opponent.userId = opponentId;

                setPlayer(prevState => prevState ? {...prevState, ...player} : player);
                setOpponent(prevState => prevState ? {...prevState, ...opponent} : opponent);
            }
        }
    }, [match, user]);

    useEffect( () => {
        if (isAuthenticated) {
            if (user && key && (key.match(keyRegex) || key === "test")) {
                if (!socket) {
                    setTimeout(() => setUpSocket(key), 1000);
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
        setSocket(undefined);
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
        if (player && opponent && match?.stage === "finished") {
            const _winner = match && getWinner(player, opponent);
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
    }, [match?.stage]);

    return(
        <main id="battle" >
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
                            <div id="battle-container" ref={containerRef} >
                                <HudContainer />
                                <OpponentHand />
                                <PlayerHand />
                                <Board />
                                <BattleChat />
                                <EventDisplay ref={eventDisplay} />
                                <BattleInterface />
                                <EffectDisplay />
                            </div>
                        </MatchContext.Provider>
                    }
                </Suspense>
            }
        </main>
    );
}


export default Battle;