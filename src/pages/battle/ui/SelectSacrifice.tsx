import {FC, useContext, useEffect, useState} from "react";
import {MatchContext} from "../../../context.tsx";
import {ICard} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import {Button} from "../../../components/Button.tsx";
import BattlePortalWrap from "../../../components/BattlePortalWrap.tsx";
import BattleInterfaceOverlay from "../../../components/BattleInterfaceOverlay.tsx";

const SelectSacrifice: FC<{
    cardToBeUsed?: string,
    setSacrifice: (sacrifice: string[]) => void,
    cancel: () => void
}> = ({ setSacrifice, cardToBeUsed, cancel }) => {

    const { player, loadCards } = useContext(MatchContext);

    const initSelectableCards = (cardIds: string[]) => {
        let cardsToLoad = cardIds;

        if (cardToBeUsed && cardIds.includes(cardToBeUsed)) {
            const cleanCardIds = [...cardIds];
            cleanCardIds.splice(cleanCardIds.indexOf(cardToBeUsed), 1);
            cardsToLoad = cleanCardIds;
        }

        loadCards(cardsToLoad).then(cards => {
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
            initSelectableCards(player.onHand);
        }
    }, [player?.onHand]);

    const handleAcceptClick = () => {
        setSacrifice(selectedCards.filter(card => card.selected).map(e => e.card.id));
        cancel();
    }

    const handleCancelClick = () => {
        setSacrifice([]);
        cancel();
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

    const countSelected = (arr: { card: ICard, selected: boolean }[]) => arr.filter(card => card.selected).length;

    return (
        <BattlePortalWrap>
            <BattleInterfaceOverlay>
                <div className="flex flex-col gap-4" >
                    <div className="flex flex-wrap justify-center items-center gap-4 max-w-[56vw] max-h-[80vh] px-4">
                        {selectedCards.map(({ card, selected }, index) =>
                            <div
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`card-min card ${selected ? "selected" : ""}`}
                            >
                                <CardContent card={card} />
                            </div>
                        )}
                    </div>
                    <div className="w-full text-center" >
                        Click on the cards you are willing to sacrifice to select them
                    </div>
                    <horizontal-line/>
                    <div className="flex justify-center gap-4 px-4" >
                        <Button text="Cancel" onClick={handleCancelClick} />
                        <Button text={`Accept${countSelected(selectedCards) > 0 ? " (" + countSelected(selectedCards) + ")" : "    "}`} onClick={handleAcceptClick} />
                    </div>
                </div>
            </BattleInterfaceOverlay>
        </BattlePortalWrap>
    );
}

export default SelectSacrifice;