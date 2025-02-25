import {FC, useContext, useEffect, useState} from "react";
import {MatchContext} from "../../../Context.tsx";
import {ICard} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import {createPortal} from "react-dom";
import {Button} from "../../../components/Button.tsx";

const SelectSacrifice: FC<{
    cardToBeUsed: string,
    setSacrifice: (sacrifice: string[]) => void,
    cancel: () => void
}> = ({ setSacrifice, cardToBeUsed, cancel }) => {

    const { player, loadCards } = useContext(MatchContext);

    const initSelectableCards = (cardIds: string[]) => {
        loadCards(cardIds).then(cards => {
            setSelectedCards(
                cards.map(card => {
                    return {
                        card,
                        selected: false
                    };
                })
            );
        });
    }

    const [selectedCards, setSelectedCards] = useState<{ card: ICard, selected: boolean }[]>([]);

    useEffect(() => {
        if (player) {
            initSelectableCards(player.onHand.splice(player.onHand.indexOf(cardToBeUsed), 1));
        }
    }, [player?.onHand]);

    const confirmSelection = () => {
        setSacrifice(selectedCards.filter(card => card.selected).map(e => e.card.id));
    }

    const handleCardClick = (index: number) => {
        setSelectedCards(prevState => {
            if (prevState[index]) {
                return prevState.map((card, i) => {
                    if (i === index) {
                        return {
                            ...card,
                            selected: !prevState[index].selected
                        };
                    }
                    return card;
                });
            }
            return prevState;
        });
    }

    return (
        createPortal(
            <div className="battle-overlay" >
                <div className="flex flex-col gap-4" >
                    <div className="flex flex-wrap justify-center items-center gap-4 max-w-[60vw] px-4">
                        {selectedCards.map(({ card, selected }, index) =>
                            <div
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`card-small card ${selected ? "selected" : ""}`}
                            >
                                <CardContent card={card} />
                            </div>
                        )}
                    </div>
                    <div className="hr" ></div>
                    <div className="flex justify-center gap-4 px-4" >
                        <Button text="Cancel" onClick={cancel} />
                        <Button text="Accept" onClick={confirmSelection} />
                    </div>
                </div>
            </div>,
            document.getElementById("battle-container") as HTMLElement
        )
    );
}

export default SelectSacrifice;