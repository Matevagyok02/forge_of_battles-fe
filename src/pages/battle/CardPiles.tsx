import {FC, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import CardContent from "./cards/CardContent.tsx";
import {createPortal} from "react-dom";
import {IconButton} from "../../components/Button.tsx";

export const DrawPile: FC<{ cards: string[], deck: string }> = ({ cards, deck }) => {

    return (
        cards.map((card, index) => (
            <div
                className={`card-back card ${deck}`}
                style={{ rotate: `${Math.random() * 10}deg` }}
                key={`${index}-${card}`}
            >
                <div style={{ rotate: `${Math.random() * 1000}deg` }} ></div>
            </div>
        ))
    )
}

export const DiscardPile: FC<{ cards: ICard[], deck: string }> = ({ cards, deck }) => {

    const [showOverview, setShowOverview] = useState(false);

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
                    style={{ rotate: `${Math.random() * 10}deg` }}
                    key={index}
                >
                    <CardContent card={card} />
                </div>
            ))}
            {showOverview && <DiscardOverview />}
        </>
    );
}