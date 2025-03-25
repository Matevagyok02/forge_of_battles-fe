import {ICard} from "../../../interfaces.ts";
import {FC, useEffect, useState} from "react";
import styles from "../../../styles/battle_page/CardContent.module.css";
//TODO: show modified attributes
const CardContent: FC<{ card: ICard, showModifiedAttributes?: boolean }> = ({ card, showModifiedAttributes = false }) => {

    const imageUrl = `../cards/${card.deck}/${card.name.toLowerCase().replace(/ /g, "_")}.jpg`;
    const [imageLoaded, setImageLoaded] = useState(true);

    useEffect(() => {
        setImageLoaded(true);

    }, [card.deck, card.name]);

    return(
        <>
            { imageLoaded ?
                <img className={styles.image} src={imageUrl} alt={""} onError={() => setImageLoaded(false)} />
                :
                <div className={styles.image} ></div>
            }

            <div className={styles.name} >
                <h1>
                    {card.name}
                </h1>
            </div>

            <ul>
                <li className={styles.cost} >
                    <h1>
                        {card.cost}
                    </h1>
                </li>
                <li className={styles.defense} >
                    <h1>
                        {card.defence}
                    </h1>
                </li>
                <li className={styles.attack} >
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
        text && text.split(" ").map((word, index) =>
            word === "MANA" ?
                <i key={index} className="mana-icon" >&nbsp;&nbsp;&nbsp;</i>
                :
                " " + word
        )
    );
}

export default CardContent;