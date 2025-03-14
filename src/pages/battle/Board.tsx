import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import {MatchContext} from "../../context.tsx";
import "./Board.css";
import {DiscardPile, DrawPile} from "./CardPiles.tsx";
import {IPlayerState} from "../../interfaces.ts";
import RedrawCards from "./ui/RedrawCards.tsx";
import VirtualParent from "../../components/VirtualParent.tsx";
import CardSlot, {WarTrackPos} from "./cards/CardSlot.tsx";
import {OutgoingBattleEvent} from "./Battle.tsx";

interface WarTrackSlot {
    pos: WarTrackPos;
    owner: 0 | 1 | 2;
}

const warTrackPositions: WarTrackSlot[] = [
    { pos: WarTrackPos.defender, owner: 2 },
    { pos: WarTrackPos.frontLiner, owner: 2 },
    { pos: WarTrackPos.attacker, owner: 1 },
    { pos: WarTrackPos.supporter, owner: 2 },
    { pos: WarTrackPos.vanguard, owner: 0 },
    { pos: WarTrackPos.supporter, owner: 1 },
    { pos: WarTrackPos.attacker, owner: 2 },
    { pos: WarTrackPos.frontLiner, owner: 1 },
    { pos: WarTrackPos.defender, owner: 1 }
];

const Board: FC = () => {

    return(
        <div className="board-container" >
            <div className="board" >
                <OpponentCardPiles />
                <WarTrack />
                <PlayerCardPiles />
            </div>
        </div>
    );
}

const WarTrack: FC = () => {

    return(
        <div className="war-track" >
            {warTrackPositions.map((slot: WarTrackSlot, index) =>
                <CardSlot
                    key={index}
                    pos={slot.pos}
                    owner={slot.owner}
                />
            )}
        </div>
    )
}

const PlayerCardPiles: FC = () => {

    const getCanDraw = (player: IPlayerState | undefined) => {
        if (player) {
            return player?.drawsPerTurn < 1 && player.turnStage === 1 && player.drawingDeck.length > 0;
        } else {
            return false;
        }
    }

    const getCanRedraw = (player: IPlayerState | undefined) => {
        if (player) {
            return player?.drawsPerTurn === 1 && player?.turnStage === 1 && player?.drawingDeck.length > 0;
        } else {
            return false;
        }
    }

    const { socket, player } = useContext(MatchContext);

    const [canDraw, setCanDraw] = useState<boolean>(getCanDraw(player));
    const [canRedraw, setCanRedraw] = useState<boolean>(getCanRedraw(player));
    const [openRedraw, setOpenRedraw] = useState<boolean>(false);
    const [drawPileHovered, setDrawPileHovered] = useState<boolean>(false);

    const playerDrawPileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setCanDraw(getCanDraw(player));
        setCanRedraw(getCanRedraw(player));
    }, [player.drawsPerTurn, player.turnStage, player.drawingDeck.length]);

    const drawCards = useCallback(() => {
        if (socket && canDraw) {
            socket.emit(OutgoingBattleEvent.draw);
        }
    }, [canDraw, socket]);

    const closeRedraw = () => setOpenRedraw(false);

    return(
        <div className="right-card-piles" >
            <div className={`discard-pile ${player.deck}`} >
                <DiscardPile cardIds={player!.casualties} deck={player.deck} />
            </div>
            <div
                ref={playerDrawPileRef}
                id="player-draw-pile"
                className={`draw-pile ${player.deck} ${drawPileHovered ? "hovered" : ""}`}
            >
                <DrawPile cardIds={player!.drawingDeck} deck={player.deck} />
                { playerDrawPileRef.current &&
                    <>
                        { player!.drawingDeck.length > 0 &&
                            <VirtualParent virtualParent={playerDrawPileRef.current as Element} >
                                <div className={`draw-pile-size-indicator`} >
                                    <div>
                                        <h1>
                                            {player!.drawingDeck.length}
                                        </h1>
                                    </div>
                                </div>
                            </VirtualParent>
                        }
                        { (canDraw || canRedraw) &&
                            <VirtualParent virtualParent={playerDrawPileRef.current as Element} >
                                <div className={`draw-pile-btn-container`} >
                                    { canDraw ?
                                        <h1
                                            className={`draw-pile-btn ${player.deck}`}
                                            onClick={drawCards}
                                            onMouseEnter={() => setDrawPileHovered(true)}
                                            onMouseLeave={() => setDrawPileHovered(false)}
                                        >
                                            Draw
                                        </h1>
                                        :
                                        <h1
                                            className={`draw-pile-btn ${player.deck}`}
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
                    </>
                }
                { canRedraw && openRedraw &&
                    <RedrawCards close={closeRedraw} />
                }
            </div>
        </div>
    )
}

const OpponentCardPiles: FC = () => {

    const { opponent, player } = useContext(MatchContext);
    const color = opponent.deck + (opponent.deck === player.deck ? "-secondary" : "");

    return(
        <div className="left-card-piles" >
            <div className={`draw-pile`} >
                <DrawPile cardIds={opponent.drawingDeck} deck={color} />
            </div>
            <div className={`discard-pile ${color}`} >
                <DiscardPile cardIds={opponent.casualties} deck={color} />
            </div>
        </div>
    )
}

export default Board;