import {FC, useContext, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import CardContent from "./cards/CardContent.tsx";
import {createPortal} from "react-dom";
import {IconButton} from "../../components/Button.tsx";
import {MatchContext} from "../../Context.tsx";

export const DrawPile: FC<{
    cardIds: string[],
    deck: string
}> = ({ cardIds, deck}) => {

    const [rotations, setRotations] = useState<number[]>([]);

    useEffect(() => {
        setRotations(generateRotations(cardIds, rotations));
    }, [cardIds]);

    return (
        cardIds.map((card, index) => (
            <div
                className={`card-back card ${deck}`}
                style={{ rotate: `${rotations[index]}deg` }}
                key={index}
            >
                <div style={{ rotate: `${rotations[index] * 1000}deg` }} ></div>
            </div>
        ))
    )
}

export const DiscardPile: FC<{ cardIds: string[], deck: string }> = ({ cardIds, deck }) => {

    const [rotations, setRotations] = useState<number[]>([]);

    useEffect(() => {
        setRotations(generateRotations(cardIds, rotations));
    }, [cardIds]);

    const { loadCards } = useContext(MatchContext);
    const [showOverview, setShowOverview] = useState(false);
    const [cards, setCards] = useState<ICard[]>([]);

    useEffect(() => {
        loadCards(cardIds).then(setCards);
    }, [cardIds]);

    const DiscardOverview: FC = () => {

        useEffect(() => {
            document.onkeydown = (e) => {
                if(e.key === "Escape") setShowOverview(false);
            }

            return () => {
                document.onkeydown = null;
            }
        }, []);

        return(
            createPortal(
                <div className="battle-overlay" >
                    <div className="discard-overview" >
                        <div className="cancel-discard-overview-btn" >
                            <IconButton text="Cancel" icon="cancel" onClick={() => setShowOverview(false)} />
                        </div>
                        <div className="discard-overview-cards" >
                            {cards.map((card, index) => (
                                <div
                                    onClick={() => setShowOverview(true)}
                                    className={`discarded-card card ${deck}`}
                                    key={index}
                                >
                                    <CardContent card={card} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.getElementById("battle-container") as HTMLElement
            )
        );
    }

    return(
        <>
            {cards.map((card, index) => (
                <div
                    onClick={() => setShowOverview(true)}
                    className={`discarded-card card ${deck}`}
                    style={{ rotate: `${rotations[index]}deg` }}
                    key={index}
                >
                    <CardContent card={card} />
                </div>
            ))}
            {showOverview && <DiscardOverview />}
        </>
    );
}

const generateRotations = (cardIds: string[], rotations?: number[]) => {
    if (rotations) {
        if (rotations.length < cardIds.length) {
            const newRotations = cardIds.slice(rotations.length).map(() => Math.random() * 10);
            return [...rotations, ...newRotations];
        }
        else if (rotations.length > cardIds.length) {
            return rotations.slice(0, cardIds.length);
        }
        else {
            return rotations;
        }
    } else {
        return cardIds.map(() => Math.random() * 10);
    }
}