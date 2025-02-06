import {useParams} from "react-router-dom";
import {FC, useCallback, useState} from "react";
import "./Battle.css";
import "./cards/Cards.css";
import {IBattle, IMatch, IPlayerState} from "../../interfaces.ts";
import {MatchContext} from "../../Context.tsx";
import Board from "./Board.tsx";
import Hud from "./Hud.tsx";
import BattleChat, {IBattleMessage} from "./BattleChat.tsx";
import {PlayerHand, OpponentHand} from "./Hands.tsx";
import {Button} from "../../components/Button.tsx";
import {CardProto} from "../addCard/cardCreationInterfaces.ts";

const Battle: FC = () => {

    const key = useParams().key;
    const [match, setMatch] = useState<IMatch>(sampleMatch);
    const [messages, setMessages] = useState<IBattleMessage[]>(sampleMessages);

    // const {user} = useContext(UserContext);
    const user = {
        sub: "google-oauth2|107016487388322054821"
    }

    const sendMessage = (msg: string) => {
        setMessages(sampleMessages);
        console.log(msg, key);
    };

    const opponent = useCallback(() => {
        const opponentId = match.player1Id === user.sub ? match.player2Id : match.player1Id;
        return (match.battle as IBattle).playerStates.get(opponentId)  as IPlayerState;
    }, [match, user]);

    const player = useCallback(() => {
        return (match.battle as IBattle).playerStates.get(user.sub) as IPlayerState;
    }, [match, user]);

    return(
        <main id="battle" >
            <MatchContext.Provider value={{
                match,
                setMatch,
                player,
                opponent
            }} >
                <div id="battle-container" >
                    <div className="hud-container" >
                        <Hud />
                        <Hud />
                    </div>
                    <OpponentHand
                        cardCount={8}
                        deck={
                            opponent().deck + (opponent().deck === player().deck ? "-secondary" : "")
                        }
                    />
                    <PlayerHand cards={sampleCards} />
                    <Board />
                    <BattleChat messages={messages} sendMessage={sendMessage} />
                    <div className="battle-interface" >
                        <Button text="End Turn" onClick={() => alert("TODO")} />
                    </div>
                </div>
            </MatchContext.Provider>
        </main>
    );
}

export default Battle;

const sampleCards: CardProto[] = [
    {
        name: "Grandmaster Paladin",
        deck: "light",
        cost: 4,
        attack: 5,
        pieces: 1,
        defence: 7
    },
    {
        name: "Light Priest",
        deck: "light",
        cost: 1,
        attack: 2,
        pieces: 3,
        defence: 2
    },
    {
        name: "Archbishop",
        deck: "light",
        cost: 2,
        attack: 7,
        pieces: 1,
        defence: 3
    }
];

const sampleMessages = [
    {
        emitter: "google-oauth2|107016487388322054821",
        message: "Hello, how are you? I have a lot of question, so this is going to be a really long message",
    },
    {
        emitter: "google-oauth2|110032521141507503978",
        message: "I'm fine, thank you!",
    },
    {
        message: "The game has started!",
    },
    {
        emitter: "google-oauth2|107016487388322054821",
        message: "Hello, how are you?",
    },
    {
        emitter: "google-oauth2|110032521141507503978",
        message: "I'm fine, thank you!",
    },
    {
        message: "The game has started!",
    },
    {
        emitter: "google-oauth2|107016487388322054821",
        message: "Hello, how are you?",
    },
    {
        emitter: "google-oauth2|110032521141507503978",
        message: "I'm fine, thank you!",
    },
    {
        message: "The game has started!",
    },
    {
        emitter: "google-oauth2|107016487388322054821",
        message: "Hello, how are you?",
    },
    {
        emitter: "google-oauth2|110032521141507503978",
        message: "I'm fine, thank you!",
    },
    {
        message: "The game has started!",
    }
]

const sampleMatch: IMatch = {
    key: "XXXXXX",
    battle: {
        playerStates: {
            "google-oauth2|110032521141507503978": {
                deck: "darkness",
                drawingDeck: [],
                bonusHealth: [],
                casualties: [],
                onHand: [],
                mana: 0,
                manaCards: [],
                deployedCards: {},
                timeLeft: {
                    turnStartedAt: 0,
                    timeLeft: 2700000
                },
                turnStage: 0,
                drawsPerTurn: 0
            },
            "google-oauth2|107016487388322054821": {
                deck: "light",
                drawingDeck: [],
                bonusHealth: [],
                casualties: [],
                onHand: [],
                mana: 0,
                manaCards: [],
                deployedCards: {
                    defender: {
                        id: "0",
                        name: "Grandmaster Paladin",
                        deck: "light",
                        cost: 4,
                        attack: 5,
                        defense: 7,
                        piecesInDeck: 1
                    }
                },
                timeLeft: {
                    turnStartedAt: 0,
                    timeLeft: 2700000
                },
                turnStage: 0,
                drawsPerTurn: 0
            }
        },
        turnOfPlayer: "google-oauth2|110032521141507503978",
        abilities: {
            activatedAbilities: []
        },
        timeLimit: 2700000,
        turn: 0
    },
    randomMatch: false,
    player1Id: "google-oauth2|107016487388322054821",
    player2Id: "google-oauth2|110032521141507503978",
    stage: "preparing"
}