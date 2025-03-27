import {FC, useCallback, useContext, useEffect, useState} from "react";
import {Button} from "../../../components/Button.tsx";
import {MatchContext} from "../../../context.tsx";
import {ICard} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import PortalWrap from "../components/PortalWrap.tsx";
import {OutgoingBattleEvent} from "../Battle.tsx";
import MenuOverlay from "../components/MenuOverlay.tsx";
import styles from "../../../styles/battle_page/Cards.module.css";

const RedrawCards: FC<{ close: () => void }> = ({ close }) => {

    const { match, socket, player, loadCards } = useContext(MatchContext);
    const [cardToChange, setCardToChange] = useState<{ id: string, index: number }>();

    const [cards, setCards] = useState<ICard[]>([]);

    useEffect(() => {
        const drawnCardsAmount = match?.battle.turn === 1 ? 1 : 2;
        const drawnCards = player!.onHand.slice(player!.onHand.length - drawnCardsAmount, player!.onHand.length);

        loadCards(drawnCards).then(setCards);
    }, [player?.onHand.length, match?.battle.turn]);

    const handleCardClick = (id: string, index: number) => {
        setCardToChange(prevState => {
           if (prevState) {
               if (prevState.id === id && prevState.index === index) {
                   return undefined;
               } else {
                     return { id, index };
               }
           } else {
                return { id, index };
           }
        });
    }

    const redraw = useCallback(() => {
        if (socket) {
            if (cardToChange) {
                socket.emit(OutgoingBattleEvent.redraw, { cardId: cardToChange.id });
            } else {
                socket.emit(OutgoingBattleEvent.redraw);
            }
            close();
        }
    }, [cardToChange]);

    const isSelected = useCallback((id: string, index: number) => {
        return cardToChange && cardToChange.id === id && cardToChange.index === index && cards.length > 1;
    }, [cardToChange, cards]);

    return (
        <PortalWrap>
            <MenuOverlay>
                <menu className={styles.redraw} >
                    <ul>
                        {cards?.map((card, index) =>
                            <li
                                key={index}
                                onClick={() => handleCardClick(card.id, index)}
                                className={`${styles.card} ${isSelected(card.id, index)  ? styles.selected : ""}`}
                            >
                                <CardContent card={card} />
                            </li>
                        )}
                    </ul>

                    <p>
                        Select the card you want to change, or select none to change both
                    </p>

                    <horizontal-line/>

                    <menu>
                        <Button text={"Cancel"} onClick={close} />
                        <Button text={"Redraw"} onClick={redraw} />
                    </menu>
                </menu>
            </MenuOverlay>
        </PortalWrap>
    )
}

export default RedrawCards;