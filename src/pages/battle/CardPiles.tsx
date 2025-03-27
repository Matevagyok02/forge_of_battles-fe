import {FC, useContext, useEffect, useState} from "react";
import {ICard} from "../../interfaces.ts";
import CardContent from "./cards/CardContent.tsx";
import {Icon, IconButton} from "../../components/Button.tsx";
import {MatchContext} from "../../context.tsx";
import PortalWrap from "./components/PortalWrap.tsx";
import MenuOverlay from "./components/MenuOverlay.tsx";
import styles from "../../styles/battle_page/Cards.module.css";

export const DrawPile: FC<{
    cardIds: string[],
    deckColor: string
}> = ({ cardIds, deckColor}) => {

    const [rotations, setRotations] = useState<number[]>([]);

    useEffect(() => {
        setRotations(generateRotations(cardIds, rotations));
    }, [cardIds]);

    return (
        cardIds.map((cardId , index) => (
            <div
                className={`${styles.cardBack} ${deckColor}`}
                style={{ rotate: `${rotations[index]}deg` }}
                key={index + "-" + cardId}
            >
                <div style={{ rotate: `${rotations[index] * 1000}deg` }} ></div>
            </div>
        ))
    )
}

export const DiscardPile: FC<{ cardIds: string[], deckColor: string }> = ({ cardIds, deckColor }) => {

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
            <PortalWrap>
                <MenuOverlay>
                    <menu className={styles.discard} >
                        <IconButton text={"Close"} icon={Icon.cancel} onClick={() => setShowOverview(false)} />
                        <ul>
                            {cards.map((card, index) => (
                                <li
                                    onClick={() => setShowOverview(true)}
                                    className={styles.card}
                                    key={index}
                                >
                                    <CardContent card={card} />
                                </li>
                            ))}
                        </ul>
                    </menu>
                </MenuOverlay>
            </PortalWrap>
        );
    }

    return(
        <>
            {cards.map((card, index) => (
                <li
                    onClick={() => setShowOverview(true)}
                    className={styles.card}
                    style={{ rotate: `${rotations[index]}deg` }}
                    key={index}
                >
                    <CardContent card={card} />
                </li>
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