import {useNavigate, useParams} from "react-router-dom";
import {FC, useCallback, useContext, useEffect, useState} from "react";
import "./Battle.css";
import "./cards/Cards.css";
import {IBattle, ICard, IMatch, IPlayerState} from "../../interfaces.ts";
import {AuthContext, MatchContext} from "../../Context.tsx";
import Board from "./Board.tsx";
import BattleChat from "./BattleChat.tsx";
import {PlayerHand, OpponentHand} from "./Hands.tsx";
import {Button} from "../../components/Button.tsx";
import {getCardsById} from "../../api/cards.ts";
import {io, Socket} from "socket.io-client";
import {keyRegex} from "../home/JoinGame.tsx";
import HudContainer from "./Hud.tsx";

const Battle: FC = () => {

    const navigate = useNavigate();
    const key = useParams().key;
    const [match, setMatch] = useState<IMatch>();
    const [player, setPlayer] = useState<IPlayerState>();
    const [opponent, setOpponent] = useState<IPlayerState>();
    const [cards, setCards] = useState<ICard[]>([]);
    const [socket, setSocket] = useState<Socket>();

    const {user, isLoading} = useContext(AuthContext);

    const setBattleData = (data: { battle: IBattle } | IMatch) => {
        setMatch(prevState =>
            prevState ?
                { ...prevState, battle: data.battle }
                :
                { battle: data.battle } as IMatch
        );
    }

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

        socket.on("connected", (data: IMatch) => {
            setMatch(data);
            if (data.battle.turnOfPlayer === user?.sub && data.battle.playerStates[user.sub].turnStage === 0) {
                socket.emit("start-turn");
            }
        });

        socket.on("turn-started", setBattleData);

        socket.on("opponent-turn-started", setBattleData);

        socket.on("drawn", setBattleData);

        socket.on("opponent-drawn", setBattleData);

        socket.on("redrawn", setBattleData);

        socket.on("advanced", setBattleData);

        socket.on("opponent-advanced", setBattleData);

        socket.on("turn-ended",  (data: { battle: IBattle }) => {
            setBattleData(data);
        });

        socket.on("opponent-turn-ended", (data: { battle: IBattle }) => {
            setBattleData(data);
            socket.emit("start-turn");
        });

        setSocket(socket);
    }

    const loadCards = useCallback(async (ids: string[]) => {
        const requestedCards: ICard[] = [];
        const cardStore = [];
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
            if (response?.ok && response?.body) {
                cardStore.push(...response.body);
                setCards(prevState => [...prevState, ...response.body]);
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
        if (match && user) {
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

    useEffect( () => {
        if (!isLoading) {
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
    }, [isLoading, user, key, socket]);

    const leavePage = () => {
        socket?.disconnect();
        setSocket(undefined);
        navigate("/");
    }

    const endTurn = useCallback(() => {
        if (socket && player?.turnStage === 3) {
            socket.emit("end-turn");
        }
    }, [socket, player]);

    const advance = useCallback(() => {
        if (socket && player?.turnStage === 1 && player?.drawsPerTurn > 0) {
            socket.emit("advance");
        }
    }, [socket, player]);

    //TODO: add loading screen

    return(
        <main id="battle" >
            { match && socket?.connected && player && opponent &&
                <MatchContext.Provider value={{
                    match,
                    setMatch,
                    loadCards,
                    player,
                    opponent,
                    socket
                }} >
                    <div id="battle-container" >
                        <HudContainer />
                        <OpponentHand />
                        <PlayerHand />
                        <Board />
                        <BattleChat />
                        { match?.battle?.turnOfPlayer === user?.sub &&
                            <div className="battle-interface" >
                                { player?.turnStage === 1 && player?.drawsPerTurn > 0 &&
                                    <Button text={"Advance"} onClick={advance} />
                                }
                                { player?.turnStage === 2 &&
                                    <Button text={"Storm"} onClick={() => alert("TODO")} />
                                }
                                { player?.turnStage === 3 &&
                                    <Button text="End Turn" onClick={endTurn} />
                                }
                            </div>
                        }
                    </div>
                </MatchContext.Provider>
            }
        </main>
    );
}

export default Battle;

// export const sampleCards: ICard[] = [
//     {
//         id: "light-1",
//         name: "Purifier",
//         deck: "light",
//         cost: 5,
//         attack: 7,
//         defence: 5,
//         pieces: 1,
//         actionAbility: {
//             cardId: "1",
//             description: "Increase attack by 2",
//             type: "action",
//             usageType: "turnBased",
//             subtype: "attributeModifier",
//             requirements: {
//                 mana: 2
//             },
//             targetPositions: {
//                 self: ["frontline"],
//                 opponent: ["defender"]
//             }
//         },
//         passiveAbility: {
//             cardId: "light-1",
//             description: "Reduce damage taken by 1",
//             type: "passive",
//             usageType: "basic",
//             subtype: "attributeModifier"
//         }
//     },
//     {
//         id: "light-2",
//         name: "Thalion the Holy",
//         deck: "light",
//         cost: 3,
//         attack: 2,
//         defence: 4,
//         pieces: 1,
//         actionAbility: {
//             cardId: "2",
//             description: "Heal 3",
//             type: "action",
//             usageType: "instant",
//             subtype: "instant",
//             requirements: {
//                 mana: 1
//             }
//         },
//         passiveAbility: {
//             cardId: "light-2",
//             description: "Increase defence by 1",
//             type: "passive",
//             usageType: "basic",
//             subtype: "attributeModifier"
//         }
//     }
// ];
//
// const sampleMatch: IMatch = {
//     key: "XXXXXX",
//     battle: {
//         playerStates: {
//             "google-oauth2|107016487388322054821": {
//                 deck: "light",
//                 drawingDeck: ["Grandmaster Paladin", "Light Priest", "Archbishop"],
//                 bonusHealth: [0],
//                 casualties: [],
//                 onHand: [],
//                 mana: 0,
//                 manaCards: [],
//                 deployedCards: {},
//                 turnStage: 0,
//                 drawsPerTurn: 1
//             },
//             "google-oauth2|110032521141507503978": {
//                 deck: "darkness",
//                 drawingDeck: ["Grandmaster Paladin", "Light Priest", "Archbishop"],
//                 bonusHealth: [0],
//                 casualties: [],
//                 onHand: [],
//                 mana: 0,
//                 manaCards: [],
//                 deployedCards: {},
//                 turnStage: 0,
//                 drawsPerTurn: 1
//             }
//         },
//         turnOfPlayer: "google-oauth2|110032521141507503978",
//         timeLimit: 2700000,
//         turn: 0
//     },
//     randomMatch: false,
//     player1Id: "google-oauth2|107016487388322054821",
//     player2Id: "google-oauth2|110032521141507503978",
//     stage: "preparing"
// }