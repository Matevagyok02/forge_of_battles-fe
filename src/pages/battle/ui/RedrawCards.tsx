import {FC, useCallback, useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {Button} from "../../../components/Button.tsx";
import {MatchContext} from "../../../Context.tsx";
import {ICard} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";

const RedrawCards: FC<{ close: () => void }> = ({ close }) => {

    const { match, socket, player, loadCards } = useContext(MatchContext);
    const [cardToChange, setCardToChange] = useState<{ id: string, index: number }>();

    const [cards, setCards] = useState<ICard[]>();

    useEffect(() => {
        const drawnCardsAmount = match?.battle.turn === 1 ? 1 : 2;
        const drawnCards = player!.onHand.slice(player!.onHand.length - drawnCardsAmount, player!.onHand.length);

        // const drawnCards = player!.onHand.slice(0, drawnCardsAmount);
        console.log(drawnCards);

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
                socket.emit("redraw", { cardId: cardToChange.id });
            } else {
                socket.emit("redraw");
            }
            close();
        }
    }, [cardToChange]);

    const isSelected = useCallback((id: string, index: number) => {
        return cardToChange && cardToChange.id === id && cardToChange.index === index && cards?.length > 1;
    }, [cardToChange, cards]);

    return (
        createPortal(
            <div className="battle-overlay" >
                <div className="flex flex-col gap-4 items-center" >
                    <div className="flex gap-4 px-4" >
                        {cards?.map((card, index) =>
                            <div
                                key={index}
                                onClick={() => handleCardClick(card.id, index)}
                                className={`redrawable-card card ${isSelected(card.id, index)  ? "selected" : ""}`}
                            >
                                <CardContent card={card} />
                            </div>
                        )}
                    </div>
                    <div className="text-sm px-4" >
                        Select the card you want to change, or select none to change both
                    </div>
                    <div className="hr" ></div>
                    <div className="flex gap-4" >
                        <Button text={"Cancel"} onClick={close} />
                        <Button text={"Redraw"} onClick={redraw} />
                    </div>
                </div>
            </div>,
            document.getElementById("battle-container") as HTMLElement
        )
    )
}

export default RedrawCards;