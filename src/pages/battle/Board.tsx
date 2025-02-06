import {FC, memo, useCallback, useContext, useEffect, useState} from "react";
import cardSlots from "../../assets/card_slots.json";
import {AuthContext, MatchContext} from "../../Context.tsx";
import "./Board.css";
import {DiscardPile, DrawPile} from "./CardPiles.tsx";
import {ICard} from "../../interfaces.ts";
import DeployedCard from "./cards/DeployedCard.tsx";

const Board: FC = () => {

    const { user } = useContext(AuthContext);
    const { match, opponent, player } = useContext(MatchContext);

    const posNames: { [key: string]: string } = cardSlots.posNames;

    const [deckColors, setDeckColors] = useState<{ player: string, opponent: string }>();

    useEffect(() => {
        if (user) {
            setDeckColors({
                player: player().deck,
                opponent: opponent().deck
            });
        }
    }, [user]);

    const getDeckColorClasses = useCallback((owner: number) => {
        if (deckColors) {
            switch (owner) {
                case 1:
                    return `${deckColors?.player}`
                case 2:
                    return`${deckColors?.opponent}${deckColors?.opponent === deckColors.player ? "-secondary" : ""}`;
                default:
                    return `${deckColors?.player}-${deckColors?.opponent}`;

            }
        } else {
            return "";
        }
    }, [deckColors]);

    const getCardForSlot = useCallback((slotId: string, owner: number) => {
        if (owner === 1) {
            return player().deployedCards[slotId] as ICard;
        }
        else if (owner === 2) {
            return opponent().deployedCards[slotId] as ICard;
        } else {
            if (player().deployedCards[slotId]) {
                return player().deployedCards[slotId] as ICard;
            }
            else if (opponent().deployedCards[slotId]) {
                return opponent().deployedCards[slotId] as ICard;
            } else {
                return undefined;
            }
        }
    }, [match]);

    const CardSlot: FC<{
        card?: ICard,
        slotId: string,
        slotName: string,
        owner: number,
    }> = ({card, slotId, slotName, owner}) => {

        return(
            <div className={`card-slot ${slotId}`} >
                { card ?
                    <DeployedCard card={card} />
                    :
                    <div className={`card-slot-placeholder ${getDeckColorClasses(owner)}`}>
                        <h1>
                            {slotName}
                        </h1>
                    </div>
                }
            </div>
        );
    }

    return(
        <div className="board-container" >
            { deckColors &&
                <div className="board" >
                    <div className="left-card-piles" >
                        <div className={`draw-pile`} >
                            <DrawPile cards={sampleDrawableCards} deck={getDeckColorClasses(2)} />
                        </div>
                        <div className={`discard-pile ${getDeckColorClasses(2)}`} >
                            <DiscardPile cards={sampleDiscardedCards as ICard[]} deck={getDeckColorClasses(2)} />
                        </div>
                    </div>

                    <div className="war-track" >
                        {cardSlots.warTrackPositions.map((slot: { pos: string, owner: number }, index) =>
                            <CardSlot
                                card={getCardForSlot(slot.pos, slot.owner)}
                                key={index}
                                slotId={slot.pos}
                                slotName={posNames[slot.pos]}
                                owner={slot.owner}
                            />
                        )}
                    </div>

                    <div className="right-card-piles" >
                        <div className={`discard-pile ${getDeckColorClasses(1)}`} >
                            <DiscardPile cards={sampleDiscardedCards as ICard[]} deck={getDeckColorClasses(1)} />
                        </div>
                        <div className={`draw-pile`} >
                            <DrawPile cards={sampleDrawableCards} deck={getDeckColorClasses(1)} />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

const sampleDiscardedCards = [
    {
        id: "0",
        name: "1",
        deck: "light",
        cost: 4,
        attack: 5,
        defence: 7,
        pieces: 1
    },
    {
        id: "1",
        name: "2",
        deck: "light",
        cost: 1,
        attack: 2,
        defence: 2,
        pieces: 3
    },
    {
        id: "2",
        name: "3",
        deck: "light",
        cost: 2,
        attack: 7,
        defence: 3,
        pieces: 1
    },
    {
        id: "0",
        name: "4",
        deck: "light",
        cost: 4,
        attack: 5,
        defence: 7,
        pieces: 1
    },
    {
        id: "1",
        name: "5",
        deck: "light",
        cost: 1,
        attack: 2,
        defence: 2,
        pieces: 3
    },
    {
        id: "2",
        name: "6",
        deck: "light",
        cost: 2,
        attack: 7,
        defence: 3,
        pieces: 1
    },
    {
        id: "0",
        name: "7",
        deck: "light",
        cost: 4,
        attack: 5,
        defence: 7,
        pieces: 1
    },
    {
        id: "1",
        name: "8 ",
        deck: "light",
        cost: 1,
        attack: 2,
        defence: 2,
        pieces: 3
    },
    {
        id: "2",
        name: "9",
        deck: "light",
        cost: 2,
        attack: 7,
        defence: 3,
        pieces: 1
    },
    {
        id: "0",
        name: "10",
        deck: "light",
        cost: 4,
        attack: 5,
        defence: 7,
        pieces: 1
    },
    {
        id: "1",
        name: "11",
        deck: "light",
        cost: 1,
        attack: 2,
        defence: 2,
        pieces: 3
    },
    {
        id: "2",
        name: "12",
        deck: "light",
        cost: 2,
        attack: 7,
        defence: 3,
        pieces: 1
    },
    {
        id: "2",
        name: "13",
        deck: "light",
        cost: 2,
        attack: 7,
        defence: 3,
        pieces: 1
    }
];

const sampleDrawableCards = ['card1', 'card2', 'card3', 'card4', 'card5','card1', 'card2', 'card3', 'card4', 'card5','card1', 'card2', 'card3', 'card4', 'card5'];

export default memo(Board, () => true);