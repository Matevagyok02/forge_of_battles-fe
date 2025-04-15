import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import {MatchContext} from "../../context.tsx";
import styles from "../../styles/battle_page/Board.module.css";
import {DiscardPile, DrawPile} from "./CardPiles.tsx";
import {IPlayerState} from "../../interfaces.ts";
import RedrawCards from "./ui/RedrawCards.tsx";
import VirtualParent from "./components/VirtualParent.tsx";
import CardSlot, {BattlefieldPos} from "./cards/CardSlot.tsx";
import {OutgoingBattleEvent} from "./Battle.tsx";
import decks from "../../assets/decks.json";

interface BattlefielSlot {
    pos: BattlefieldPos;
    owner: 0 | 1 | 2;
}

const battlefielPositions: BattlefielSlot[] = [
    { pos: BattlefieldPos.defender, owner: 2 },
    { pos: BattlefieldPos.frontLiner, owner: 2 },
    { pos: BattlefieldPos.attacker, owner: 1 },
    { pos: BattlefieldPos.supporter, owner: 2 },
    { pos: BattlefieldPos.vanguard, owner: 0 },
    { pos: BattlefieldPos.supporter, owner: 1 },
    { pos: BattlefieldPos.attacker, owner: 2 },
    { pos: BattlefieldPos.frontLiner, owner: 1 },
    { pos: BattlefieldPos.defender, owner: 1 }
];

export const deckColorStyles = {
    primary: {
        [decks.light.id]: styles.light,
        [decks.darkness.id]: styles.darkness,
        [decks.venom.id]: styles.venom
    },
    secondary: {
        [decks.light.id]: styles.lightSecondary,
        [decks.darkness.id]: styles.darknessSecondary,
        [decks.venom.id]: styles.venomSecondary
    }
}

const Board: FC = () => {

    return(
        <div className={styles.container} >
            <div className={styles.board} >
                <OpponentCardPiles />

                <div className={styles.battlefield} >
                    {battlefielPositions.map((slot: BattlefielSlot, index) =>
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
            <div className={`${styles.discardPile} ${deckColorStyles.primary[player.deck]}`} >
                <DiscardPile cardIds={player.casualties} />
            </div>
            <div
                ref={playerDrawPileRef}
                className={`${styles.drawPile} ${deckColorStyles.primary[player.deck]} ${drawPileHovered ? styles.hovered : ""}`}
            >
                <DrawPile cardIds={player.drawingDeck} deckColor={deckColorStyles.primary[player.deck]} />
                { playerDrawPileRef.current &&
                    <>
                        { player!.drawingDeck.length > 0 &&
                            <VirtualParent virtualParent={playerDrawPileRef.current as Element} >
                                <div className={styles.pileSizeIndicator} >
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
                                <div className={styles.drawButton} >
                                    <button
                                        className={deckColorStyles.primary[player.deck]}
                                        onClick={ canDraw ? drawCards : () => setOpenRedraw(true) }
                                        onMouseEnter={() => setDrawPileHovered(true)}
                                        onMouseLeave={() => setDrawPileHovered(false)}
                                    >
                                        { canDraw ? "Draw" : "Redraw" }
                                    </button>
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
    const color = opponent.deck === player.deck ?
        deckColorStyles.secondary[opponent.deck]
        :
        deckColorStyles.primary[opponent.deck]

    return(
        <div className={styles.cardPiles} data-value={"left"}  >
            <div className={styles.drawPile} >
                <DrawPile cardIds={opponent.drawingDeck} deckColor={color} />
            </div>
            <div className={`${styles.discardPile} ${color}`} >
                <DiscardPile cardIds={opponent.casualties} />
            </div>
        </div>
    )
}

export default Board;