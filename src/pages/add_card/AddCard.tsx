import {FC, useCallback, useState} from "react";
import {ICard} from "../../interfaces.ts";
import {addCard} from "../../api/cards.ts";
import {AbilityProto, CardProto, InstantAblProto} from "./cardCreationInterfaces.ts";
import BaseForm from "./BaseForm.tsx";
import AbilityForm from "./AbilityForm.tsx";
import styles from "../../styles/add_card_page/AddCard.module.css";
import CardPreview from "./CardPreview.tsx";

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

    const [showPreview, setShowPreview] = useState(false);

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

    const previewJson = () => {
        alert(formatJsonString(assembleCard()));
    }

    return(
        <main className={styles.addCard} >
            <div>
                <BaseForm cardBase={cardBase} setCardBase={setCardBase} />

                <CardPreview card={assembleCard() as ICard} />

                <menu>
                    <button className={styles.save} onClick={save} >
                        Save
                    </button>
                    <button className={styles.preview} onClick={previewJson} >
                        Preview JSON
                    </button>
                    <button className={styles.reset} onClick={reset} >
                        Reset
                    </button>
                </menu>
            </div>
            <AbilityForm ability={actionAbility} setAbility={setActionAbility} />
            <AbilityForm ability={passiveAbility} setAbility={setPassiveAbility} />
        </main>
    );
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