import {FC, useCallback, useContext, useEffect, useState} from "react";
import cardSlots from "../../assets/card_slots.json";
import {MatchContext} from "../../Context.tsx";
import "./Board.css";
import {DiscardPile, DrawPile} from "./CardPiles.tsx";
import {ICard} from "../../interfaces.ts";
import DeployedCard from "./cards/DeployedCard.tsx";
import RedrawCards from "./ui/RedrawCards.tsx";
import {createPortal} from "react-dom";
import VirtualParent from "../../components/VirtualParent.tsx";

const Board: FC = () => {

    const {
        match,
        opponent,
        player,
        socket
    } = useContext(MatchContext);

    const posNames: { [key: string]: string } = cardSlots.posNames;

    const [colors, setColors] = useState<{ player: string, opponent: string }>();
    const [canDraw, setCanDraw] = useState<boolean>(player?.drawsPerTurn < 1 && player?.turnStage === 1 && player?.drawingDeck.length > 0);
    const [canRedraw, setCanRedraw] = useState<boolean>(player?.drawsPerTurn === 1 && player?.turnStage === 1 && player?.drawingDeck.length > 0);
    const [openRedraw, setOpenRedraw] = useState<boolean>(false);
    const [drawPileHovered, setDrawPileHovered] = useState<boolean>(false);

    useEffect(() => {
        setColors({
            player: player!.deck,
            opponent: opponent!.deck + (opponent!.deck === player!.deck ? "-secondary" : "")
        });
    }, []);

    const getCardForSlot = useCallback((slotId: string, owner: number) => {
        if (owner === 1) {
            return player!.deployedCards[slotId] as ICard;
        }
        else if (owner === 2) {
            return opponent!.deployedCards[slotId] as ICard;
        } else {
            if (player!.deployedCards[slotId]) {
                return player!.deployedCards[slotId] as ICard;
            }
            else if (opponent!.deployedCards[slotId]) {
                return opponent!.deployedCards[slotId] as ICard;
            } else {
                return undefined;
            }
        }
    }, [match]);

    const CardSlot: FC<{
        card?: ICard,
        slotId: string,
        slotName: string,
    }> = ({card, slotId, slotName, owner}) => {

        const getColor = (owner: number) => {
            switch (owner) {
                case 1:
                    return player!.deck;
                case 2:
                    return opponent!.deck + (opponent!.deck === player!.deck ? "-secondary" : "");
                default:
                    return "";
            }
        }

        return(
            <div className={`card-slot ${slotId}`} >
                { card ?
                    <DeployedCard card={card} />
                    :
                    <div className={`card-slot-placeholder ${getColor(owner)}`}>
                        <h1>
                            {slotName}
                        </h1>
                    </div>
                }
            </div>
        );
    }

    useEffect(() => {
        setCanDraw(player?.drawsPerTurn < 1 && player?.turnStage === 1 && player?.drawingDeck.length > 0);
        setCanRedraw(player?.drawsPerTurn === 1 && player?.turnStage === 1 && player?.drawingDeck.length > 0);
    }, [player?.drawsPerTurn, player?.turnStage, player?.drawingDeck.length]);

    const drawCards = useCallback(() => {
        if (socket && canDraw) {
            socket.emit("draw");
        }
    }, [canDraw, socket]);

    const closeRedraw = () => setOpenRedraw(false);

    return(
        <div className="board-container" >
            { colors &&
                <div className="board" >
                    <div className="left-card-piles" >
                        <div className={`draw-pile`} >
                            <DrawPile cardIds={opponent!.drawingDeck} deck={colors.opponent} />
                        </div>
                        <div className={`discard-pile ${colors.opponent}`} >
                            <DiscardPile cardIds={opponent!.casualties} deck={colors.opponent} />
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
                        <div className={`discard-pile ${colors.player}`} >
                            <DiscardPile cardIds={player!.casualties} deck={colors.player} />
                        </div>
                        <div
                            id="player-draw-pile"
                            className={`draw-pile ${colors.player} ${drawPileHovered ? "hovered" : ""}`}
                        >
                            <DrawPile cardIds={player!.drawingDeck} deck={colors.player} />
                            { (canDraw || canRedraw) &&
                                <VirtualParent
                                    virtualParent={document.getElementById("player-draw-pile") as HTMLElement}
                                    actualParent={document.getElementById("battle-container") as HTMLElement}
                                >
                                    <div className={`draw-pile-btn-container`} >
                                        { canDraw ?
                                            <h1
                                                className={`draw-pile-btn ${colors.player}`}
                                                onClick={drawCards}
                                                onMouseEnter={() => setDrawPileHovered(true)}
                                                onMouseLeave={() => setDrawPileHovered(false)}
                                            >
                                                Draw
                                            </h1>
                                            :
                                            <h1
                                                className={`draw-pile-btn ${colors.player}`}
                                                onClick={() => setOpenRedraw(true)}
                                                onMouseEnter={() => setDrawPileHovered(true)}
                                                onMouseLeave={() => setDrawPileHovered(false)}
                                            >
                                                Redraw
                                            </h1>
                                        }
                                    </div>
                                </VirtualParent>
                            }
                            { canRedraw && openRedraw &&
                                <RedrawCards close={closeRedraw} />
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

const sampleDrawableCards = ['card1', 'card2', 'card3', 'card4', 'card5','card1', 'card2', 'card3', 'card4', 'card5','card1', 'card2', 'card3', 'card4', 'card5'];

export default Board;