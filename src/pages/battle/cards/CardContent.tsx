import {ICard} from "../../../interfaces.ts";
import {FC, useContext, useEffect, useState} from "react";
import styles from "../../../styles/battle_page/Cards.module.css";
import {MatchContext} from "../../../context.tsx";

enum AttrValue {
    buffed = "buffed",
    nerfed = "nerfed",
    normal = ""
}

interface AttributeValues {
    attack?: AttrValue;
    defense?: AttrValue;
}

const CardContent: FC<{ card: ICard, showModifiedAttributes?: boolean }> = ({ card, showModifiedAttributes = false }) => {

    const { match, loadCards } = useContext(MatchContext);
    const imageUrl = `../cards/${card.deck}/${card.name.toLowerCase().replace(/ /g, "_")}.jpg`;
    const [imageLoaded, setImageLoaded] = useState(true);
    const [attributeValues, setAttributeValues] = useState<AttributeValues>({});

    useEffect(() => {
        setImageLoaded(true);
    }, [card.deck, card.name]);

    const getAttributeValues = async () => {

        const compareValue = (original: number, current: number) => {
            if (original < current) {
                return AttrValue.buffed;
            } else if (original > current) {
                return AttrValue.nerfed;
            } else {
                return AttrValue.normal;
            }
        }

        if (showModifiedAttributes && match.battle.abilities.activatedAbilities.length > 0) {
            const originalCardArray = await loadCards([card.id]);
            const originalCard = originalCardArray[0];

            if (originalCard) {

                return {
                    attack: compareValue(originalCard.attack, card.attack),
                    defense: compareValue(originalCard.defence, card.defence)
                }
            }
        } else {
            return {};
        }
    }

    useEffect(() => {
        getAttributeValues().then(values => setAttributeValues(values));
    }, [match]);

    return(
        <>
            { imageLoaded ?
                <img className={styles.image} src={imageUrl} alt={""} onError={() => setImageLoaded(false)} />
                :
                <div className={styles.image} ></div>
            }

            <div className={styles.name}>
                <h1>
                    {card.name}
                </h1>
            </div>

            <ul className={styles.attributes} >
                <li className={styles.cost} >
                    <h1>
                        {card.cost}
                    </h1>
                </li>
                <li className={styles.defense} data-value={attributeValues.defense} >
                    <h1>
                        {card.defence}
                    </h1>
                </li>
                <li className={styles.attack} data-value={attributeValues.attack} >
                    <h1>
                        {card.attack}
                    </h1>
                </li>
            </ul>

            <ul className={styles.abilities} >
                <li className={styles.action} >
                    <FormatAbilityText text={card.actionAbility.description} />
                </li>
                <li className={styles.passive} >
                    <FormatAbilityText text={card.passiveAbility.description} />
                </li>
            </ul>
        </>
    )
}


export const FormatAbilityText: FC<{ text?: string }> = ({ text }) => {

    return (
        text && text.split(" ").map((word, index) => {
            switch (word) {
                case "MANA": return <i className={styles.mana} >&nbsp;&nbsp;&nbsp;</i>;
                case "SACRIFICE": return <i className={styles.sacrifice} >&nbsp;&nbsp;&nbsp;</i>;
                default: return " " + word;
            }
        })
    );
}

export default CardContent;