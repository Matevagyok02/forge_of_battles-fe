import {FC, useContext, useEffect, useState} from "react";
import {MatchContext} from "../../../context.tsx";
import {ICard} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import {Button} from "../../../components/Button.tsx";
import PortalWrap from "../components/PortalWrap.tsx";
import MenuOverlay from "../components/MenuOverlay.tsx";
import styles from "../../../styles/battle_page/Cards.module.css";

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
        <PortalWrap>
            <MenuOverlay>
                <menu className={styles.sacrifice} >
                    <ul>
                        {selectedCards.map(({ card, selected }, index) =>
                            <li
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`${styles.card} ${selected ? styles.selected : ""}`}
                            >
                                <CardContent card={card} />
                            </li>
                        )}
                    </ul>

                    <p>
                        Click on the cards you are willing to sacrifice to select them
                    </p>

                    <horizontal-line/>

                    <menu>
                        <Button text="Cancel" onClick={handleCancelClick} />
                        <Button text={`Accept${countSelected(selectedCards) > 0 ? " (" + countSelected(selectedCards) + ")" : "    "}`} onClick={handleAcceptClick} />
                    </menu>

                </menu>
            </MenuOverlay>
        </PortalWrap>
    );
}

export default SelectSacrifice;