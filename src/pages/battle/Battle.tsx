import {useParams} from "react-router-dom";
import {FC, useCallback, useState} from "react";
import "./Battle.css";
import "./cards/Cards.css";
import {IBattle, ICard, IMatch} from "../../interfaces.ts";
import {MatchContext} from "../../Context.tsx";
import Board from "./Board.tsx";
import Hud from "./Hud.tsx";
import BattleChat, {IBattleMessage} from "./BattleChat.tsx";
import {PlayerHand, OpponentHand} from "./Hands.tsx";
import {Button} from "../../components/Button.tsx";
import {CardProto} from "../addCard/cardCreationInterfaces.ts";

const Battle: FC = () => {

    const key = useParams().key;
    const [match, setMatch] = useState<IMatch>(sampleMatch as IMatch);
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
        return match?.battle?.playerStates?.[opponentId]!;
    }, [match, user]);

    const player = useCallback(() => {
        return match?.battle?.playerStates?.[user.sub]!;
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

export const sampleCards: ICard[] = [
    {
        id: "light-1",
        name: "Purifier",
        deck: "light",
        cost: 5,
        attack: 7,
        defence: 5,
        pieces: 1,
        actionAbility: {
            cardId: "1",
            description: "Increase attack by 2",
            type: "action",
            usageType: "turnBased",
            subtype: "attributeModifier",
            requirements: {
                mana: 2
            },
            targetPositions: {
                self: ["frontline"],
                opponent: ["defender"]
            }
        },
        passiveAbility: {
            cardId: "light-1",
            description: "Reduce damage taken by 1",
            type: "passive",
            usageType: "basic",
            subtype: "attributeModifier"
        }
    },
    {
        id: "light-2",
        name: "Thalion the Holy",
        deck: "light",
        cost: 3,
        attack: 2,
        defence: 4,
        pieces: 1,
        actionAbility: {
            cardId: "2",
            description: "Heal 3",
            type: "action",
            usageType: "instant",
            subtype: "instant",
            requirements: {
                mana: 1
            }
        },
        passiveAbility: {
            cardId: "light-2",
            description: "Increase defence by 1",
            type: "passive",
            usageType: "basic",
            subtype: "attributeModifier"
        }
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
            "google-oauth2|107016487388322054821": {
                deck: "light",
                drawingDeck: ["Grandmaster Paladin", "Light Priest", "Archbishop"],
                bonusHealth: [0],
                casualties: [],
                onHand: [],
                mana: 0,
                manaCards: [],
                deployedCards: {},
                turnStage: 0,
                drawsPerTurn: 1
            },
            "google-oauth2|110032521141507503978": {
                deck: "darkness",
                drawingDeck: ["Grandmaster Paladin", "Light Priest", "Archbishop"],
                bonusHealth: [0],
                casualties: [],
                onHand: [],
                mana: 0,
                manaCards: [],
                deployedCards: {},
                turnStage: 0,
                drawsPerTurn: 1
            }
        },
        turnOfPlayer: "google-oauth2|110032521141507503978",
        timeLimit: 2700000,
        turn: 0
    },
    randomMatch: false,
    player1Id: "google-oauth2|107016487388322054821",
    player2Id: "google-oauth2|110032521141507503978",
    stage: "preparing"
}