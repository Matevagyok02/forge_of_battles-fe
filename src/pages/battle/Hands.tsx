import {FC, useContext, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import HandHeldCard, {HandHeldCardBack} from "./cards/HandHeldCard.tsx";
import {MatchContext} from "../../context.tsx";
import styles from "../../styles/battle_page/Battle.module.css";
import {deckColorStyles} from "./Board.tsx";

export const PlayerHand: FC = () => {

    const { loadCards, player } = useContext(MatchContext);
    const [cards, setCards] = useState<ICard[]>([]);
    const [cardRotations, setCardRotations] = useState<number[]>([]);

    const [interacting, setInteracting] = useState(false);
    const [cancelInteractionTimeout, setCancelInteractionTimeout] = useState<number>();

    useEffect(() => {
        loadCards(player.onHand).then(setCards);
    }, [player.onHand]);

    useEffect(() => {
        setCardRotations(
            getCardRotationPoints(cards.length)
        );
    }, [cards]);

    const startInteraction = () => {
        if (cancelInteractionTimeout) {
            clearTimeout(cancelInteractionTimeout);
            setCancelInteractionTimeout(undefined);
        }
        setInteracting(true);
    }

    const cancelInteraction = () => {
        const timeout = setTimeout(() => {
            setInteracting(false);
            setCancelInteractionTimeout(undefined);
        }, 400);
        setCancelInteractionTimeout(timeout);
    }

    return(
        <div
            onMouseEnter={startInteraction}
            onMouseLeave={cancelInteraction}
            className={styles.playerHand}
            style={ interacting ? { zIndex: 10 } : {} }
        >
            <ul style={ getListStyle(player.onHand.length) } >
                {cardRotations && cards.map((card, index) => (
                    <li key={index} >
                        <HandHeldCard card={card} rotation={cardRotations[index]} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export const OpponentHand: FC = () => {

    const { player, opponent } = useContext(MatchContext);
    const [cardRotations, setCardRotations] = useState<number[]>([]);

    useEffect(() => {
        setCardRotations(
            getCardRotationPoints(opponent.onHand.length)
        );
    }, [opponent.onHand.length]);

    const color = opponent.deck === player.deck ?
        deckColorStyles.secondary[opponent.deck]
        :
        deckColorStyles.primary[opponent.deck];

    return(
        <div className={styles.opponentHand} >
            <ul style={ getListStyle(opponent.onHand.length) }>
                {cardRotations.map((rotation, index) =>
                    <li key={index} >
                        <HandHeldCardBack rotation={rotation} color={color} />
                    </li>
                )}
            </ul>
        </div>
    )
}

const getListStyle = (cardCount: number) => {
    return cardCount > 4 ?
        { justifyContent: "space-between" }
        :
        { justifyContent: "center", gap: "17vh" }
}

export const getCardRotationPoints = (cardCount: number) => {
    const cardRotationPoints = [-14, -12, -10, -8, -6, -4, -2, 2, 4, 6, 8, 10, 12, 14];

    return cardRotationPoints.slice(
        cardRotationPoints.length / 2 - Math.floor(cardCount / 2),
        cardRotationPoints.length / 2 + Math.ceil(cardCount / 2),
    )
}