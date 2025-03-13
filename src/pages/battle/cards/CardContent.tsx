import {ICard} from "../../../interfaces.ts";
import {FC, useEffect, useState} from "react";

const CardContent: FC<{ card: ICard }> = ({ card }) => {

    const [imageLoaded, setImageLoaded] = useState(true);

    useEffect(() => {
        setImageLoaded(true);

    }, [card.deck, card.name]);

    return(
        <>
            { imageLoaded ?
                <img
                    src={`../cards/${card.deck}/${card.name.toLowerCase().replace(/ /g, "_")}.jpg`}
                    alt=""
                    onError={() => setImageLoaded(false)}
                />
                :
                <div className="card-image-placeholder" ></div>
            }
            <div className="card-name" >
                <h1 className="gold-text" >
                    {card.name}
                </h1>
            </div>
            <div className="card-attribute-icon cost" >
                <h1>
                    {card.cost}
                </h1>
            </div>
            <div className="card-attribute-icon def" >
                <h1>
                    {card.defence}
                </h1>
            </div>
            <div className="card-attribute-icon att" >
                <h1>
                    {card.attack}
                </h1>
            </div>
            <div className="card-abilities" >
                <p className="action-ability" >
                    <FormatAbilityText text={card.actionAbility.description} />
                </p>
                <p className="passive-ability" >
                    <FormatAbilityText text={card.passiveAbility.description} />
                </p>
            </div>
        </>
    )
}

export const FormatAbilityText: FC<{ text?: string }> = ({ text }) => {

    return (
        text && text.split(" ").map((word, index) =>
            word === "MANA" ?
                <span key={index} className="mana-icon" >&nbsp;&nbsp;&nbsp;</span>
                :
                " " + word
        )
    );
}

export default CardContent;