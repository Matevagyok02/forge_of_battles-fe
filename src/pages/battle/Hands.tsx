import {FC, useContext, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import HandHeldCard from "./cards/HandHeldCard.tsx";
import {MatchContext} from "../../Context.tsx";

export const PlayerHand: FC = () => {

    const { loadCards, player } = useContext(MatchContext);
    const [cards, setCards] = useState<ICard[]>([]);
    const [cardRotations, setCardRotations] = useState<number[]>([]);

    useEffect(() => {
        loadCards(player!.onHand).then(setCards);
    }, [player!.onHand]);

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
                <div
                    className="hand-held-card-wrapper" key={index}
                >
                   <HandHeldCard card={card} rotation={cardRotations[index]} />
                </div>
            ))}
        </div>
    );
}

export const OpponentHand: FC = () => {

    const { player, opponent, socket } = useContext(MatchContext);
    const [cardRotations, setCardRotations] = useState<number[]>([]);

    useEffect(() => {
        setCardRotations(
            getCardRotationPoints(opponent!.onHand.length)
        );
    }, [opponent!.onHand.length]);

    return(
        <div className="opponent-hand"
             style={ opponent!.onHand.length > 4 ?
                 { justifyContent: "space-between" }
                 :
                 { justifyContent: "center", gap: "17vh" }
             }
        >
            {cardRotations.map((rotation, index) =>
                <div className="hand-held-card-wrapper" key={index} >
                    <div
                        className={`card-back card ${opponent!.deck + (opponent!.deck === player!.deck ? "-secondary" : "")}`}
                        style={{
                            rotate: `${rotation}deg`,
                            translate: `0 ${Math.abs(rotation)}%`
                        }}
                    >
                        <div style={{ rotate: `${rotation * 10}deg` }} ></div>
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