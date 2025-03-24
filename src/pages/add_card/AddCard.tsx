import {FC, useCallback, useEffect, useState} from "react";
import CardContent from "../battle/cards/CardContent.tsx";
import {ICard} from "../../interfaces.ts";
import {createPortal} from "react-dom";
import {addCard} from "../../api/cards.ts";
import {AbilityProto, CardProto, InstantAblProto} from "./cardCreationInterfaces.ts";
import BaseForm from "./BaseForm.tsx";
import AbilityForm from "./AbilityForm.tsx";

const emptyAbility: AbilityProto = {
    description: "",
    type: "",
    usageType: "",
    subtype: ""
}

const emptyCard: CardProto = {
    name: "",
    deck: "",
    pieces: 1,
    attack: 0,
    defence: 0,
    cost: 0,
}

const AddCard: FC = () => {

    const [cardBase, setCardBase] = useState<CardProto>(emptyCard);
    const [actionAbility, setActionAbility] = useState<AbilityProto>({...emptyAbility, type: AbilityType.action});
    const [passiveAbility, setPassiveAbility] = useState<AbilityProto>({...emptyAbility, type: AbilityType.passive});

    const assembleCard = useCallback(() => {
        return {
            ...cardBase,
            actionAbility: actionAbility,
            passiveAbility: passiveAbility
        };
    }, [cardBase, actionAbility, passiveAbility]);

    const reset = () => {
        setCardBase({...emptyCard});
        setActionAbility({...emptyAbility, type: AbilityType.action});
        setPassiveAbility({...emptyAbility, type: AbilityType.passive});
    };

    const save = useCallback(() => {
        if (
            (actionAbility as InstantAblProto).args && typeof (actionAbility as InstantAblProto).args !== "object" ||
            (passiveAbility as InstantAblProto).args && typeof (passiveAbility as InstantAblProto).args !== "object"
        ) {
            alert("Please provide a valid JSON string for the 'args' parameter.");
        } else {
            addCard(assembleCard()).then(response => {
                if (response.ok) {
                    alert(`Card inserted successfully.
${formatJsonString(assembleCard())}
                    `);
                } else {
                    alert("An error occurred while inserting the card.");
                }
            });
        }
    }, [cardBase, actionAbility, passiveAbility]);

    useEffect(() => {
        import("./AddCard.css");
    }, []);

    return(
        <main id={"add-card-form"} >
            <div>
                <BaseForm cardBase={cardBase} setCardBase={setCardBase} />
                <AbilityForm ability={actionAbility} setAbility={setActionAbility} />
                <AbilityForm ability={passiveAbility} setAbility={setPassiveAbility} />
            </div>
            <CardPreview card={assembleCard() as ICard} />
            <span className="flex gap-6 m-8 absolute left-0 bottom-0" >
                <button id="reset-form-btn" onClick={reset} >
                    <i className="fa-solid fa-rotate-left bg-transparent" ></i>
                </button>
                <button id="save-form-btn" onClick={save} >
                    Save
                </button>
            </span>
        </main>
    );
}

const CardPreview: FC<{ card: ICard }> = ({ card }) => {

    return(createPortal(
        <div className="card card-preview" >
            <CardContent card={card as ICard} />
        </div>,
        document.body
    ));
}

export const formatNumber = (numberString: string): number => {
    const num = Number(numberString);
    return isNaN(num) ? 0 : Math.floor(num);
};

export const formatVariableName = (name: string): string => {
    const formattedWords= [];
    let formattedName = "";
    let lastUppercasePos = 0;

    for (let i = 0; i < name.length; i++) {
        if (name[i] === name[i].toUpperCase()) {
            formattedWords.push(name.slice(lastUppercasePos, i));
            lastUppercasePos = i;
        }
    }

    if (lastUppercasePos < name.length) {
        formattedWords.push(name.slice(lastUppercasePos));
    }

    formattedWords[0] = formattedWords[0].slice(0, 1).toUpperCase() + formattedWords[0].slice(1);

    formattedWords.forEach(word => {
        formattedName += word + " ";
    });

    return formattedName.trim();
}

const formatJsonString = (json: object): string => {
    return JSON.stringify(json, null, 10);
}

export enum AbilityType {
    action = "action",
    passive = "passive"
}

export enum AbilityUsageType {
    basic = "basic", //automatically applied when the card is placed on the war track and removed together with the card
    eventDriven = "eventDriven", //effect is applied when the specified event occurs
    turnBased = "turnBased", //lasts till the end of the turn/till the effect is used (these effects have a cost and always have modifier subtype)
    instant = "instant", //the effect is instantly applied after paying the cost (and lasts forever)
}

export enum AbilitySubtype {
    attributeModifier = "attributeModifier",
    costModifier = "costModifier",
    instant = "instant"
}

export enum TriggerEvent {
    draw = "draw",
    deploy = "deploy",
    useAction = "useAction",
    usePassive = "usePassive",
    storm = "storm",
    discard = "discard",
    cardDeath = "cardDeath",
    turn = "turn",
}

export default AddCard;