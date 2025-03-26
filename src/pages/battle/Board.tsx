import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import {MatchContext} from "../../context.tsx";
import "./Board.css";
import styles from "../../styles/battle_page/Board.module.css";
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

export const deckColorStyles = {
    primary: {
        light: styles.light,
        darkness: styles.darkness,
        venom: styles.venom,
    },
    secondary: {
        light: styles.lightSecondary,
        darkness: styles.darknessSecondary,
        venom: styles.venomSecondary,
    }
}

const Board: FC = () => {

    return(
        <div className={styles.container} >
            <div className={styles.board} >
                <OpponentCardPiles />

                <div className={styles.battlefield} >
                    {warTrackPositions.map((slot: WarTrackSlot, index) =>
                        <CardSlot
                            key={index}
                            pos={slot.pos}
                            owner={slot.owner}
                        />
                    )}
                </div>

                <PlayerCardPiles />
            </div>
        </div>
    );
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
        <div className={styles.cardPiles} data-value={"right"} >
            <div className={`${styles.discardPile} ${player.deck}`} >
                <DiscardPile cardIds={player!.casualties} deck={player.deck} />
            </div>
            <div
                ref={playerDrawPileRef}
                className={`${styles.drawPile} ${player.deck} ${drawPileHovered ? "hovered" : ""}`}
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
                                    <h1
                                        className={`draw-pile-btn ${player.deck}`}
                                        onClick={ canDraw ? drawCards : () => setOpenRedraw(true) }
                                        onMouseEnter={() => setDrawPileHovered(true)}
                                        onMouseLeave={() => setDrawPileHovered(false)}
                                    >
                                        { canDraw ? "Draw" : "Redraw" }
                                    </h1>
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
        <div className={styles.cardPiles} data-value={"left"}  >
            <div className={styles.drawPile} >
                <DrawPile cardIds={opponent.drawingDeck} deck={color} />
            </div>
            <div className={`${styles.drawPile} ${color}`} >
                <DiscardPile cardIds={opponent.casualties} deck={color} />
            </div>
        </div>
    )
}

export default Board;