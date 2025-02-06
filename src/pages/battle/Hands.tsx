import {FC, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import HandHeldCard from "./cards/HandHeldCard.tsx";
import {CardProto} from "../addCard/cardCreationInterfaces.ts";

export const PlayerHand: FC<{ cards: ICard[] | CardProto[] }> = ({ cards }) => {

    const [cardRotations, setCardRotations] = useState<number[]>([]);

    useEffect(() => {
        setCardRotations(
            getCardRotationPoints(cards.length)
        );
    }, [cards]);

    return(
        <div
            className="player-hand"
            style={ cards.length > 4 ?
                { justifyContent: "space-between" }
                :
                { justifyContent: "center", gap: "17vh" }
            }
        >
            {cardRotations && cards.map((card, index) => (
                <div className="hand-held-card-wrapper" key={index} >
                   <HandHeldCard card={card} rotation={cardRotations[index]} />
                </div>
            ))}
        </div>
    );
}

export const OpponentHand: FC<{ cardCount: number, deck: string }> = ({ cardCount, deck }) => {

    const [cardRotations, setCardRotations] = useState<number[]>([]);

    useEffect(() => {
        setCardRotations(
            getCardRotationPoints(cardCount)
        );
    }, [cardCount]);

    return(
        <div className="opponent-hand"
             style={ cardCount > 4 ?
                 { justifyContent: "space-between" }
                 :
                 { justifyContent: "center", gap: "17vh" }
             }
        >
            {cardRotations.map((rotation, index) =>
                <div className="hand-held-card-wrapper" key={index} >
                    <div
                        className={`card-back card ${deck}`}
                        style={{
                            rotate: `${rotation}deg`,
                            translate: `0 ${Math.abs(rotation)}%`
                        }}
                    >
                        <div style={{ rotate: `${Math.random() * 1000}deg` }} ></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export const getCardRotationPoints = (cardCount: number) => {
    const cardRotationPoints = [-14, -12, -10, -8, -6, -4, -2, 2, 4, 6, 8, 10, 12, 14];

    return cardRotationPoints.slice(
        cardRotationPoints.length / 2 - Math.floor(cardCount / 2),
        cardRotationPoints.length / 2 + Math.ceil(cardCount / 2),
    )
}