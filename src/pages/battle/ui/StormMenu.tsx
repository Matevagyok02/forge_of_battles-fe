import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import CardContent from "../cards/CardContent.tsx";
import {MultipleOptionsButton, OptionButton, SubOptionButton} from "../../../components/Button.tsx";
import {MatchContext} from "../../../context.tsx";
import {ICard, IPlayerState} from "../../../interfaces.ts";
import Animations from "../animations/Animations.ts";
import {OutgoingBattleEvent} from "../Battle.tsx";
import MenuOverlay from "../components/MenuOverlay.tsx";
import { attack_directly, attack_frontliner, attack_vanguard, convert_to_mana, move_to_frontline, move_to_vanguard } from "../../../assets/hints.json";
import styles from "../../../styles/battle_page/Cards.module.css";
import {BattlefieldPos} from "../cards/CardSlot.tsx";
import {deckColorStyles} from "../Board.tsx";

const StormMenu: FC = () => {

    const { player, opponent, socket } = useContext(MatchContext);
    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [stormerCard, setStormerCard] = useState<ICard>();
    const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);
    const stormerRef = useRef<HTMLDivElement | null>(null);
    const [options, setOptions] = useState<OptionButton[]>([]);

    useEffect(() => {
        if (stormerRef.current && !animationPlayed && stormerCard) {
            Animations.stormerAppear(stormerRef.current!).then(() => setAnimationPlayed(true));
        }
    }, [stormerCard]);

    useEffect(() => {
        if (player?.deployedCards.stormer) {
            setStormerCard(player.deployedCards.stormer);
        }

        if (player && opponent) {
            setOptions(generateOptions(player, opponent));
        }
    }, [opponent?.deployedCards, player?.deployedCards]);

    const canMoveToFrontline = (playerState: IPlayerState, opponentState: IPlayerState) => {
        return !playerState.deployedCards.frontLiner ||
            (!playerState.deployedCards.vanguard && !opponentState.deployedCards.vanguard)
    }

    const moveToFrontline = useCallback(() => {
        if (socket) {
            socket.emit(OutgoingBattleEvent.moveToFront);
            setOpenMenu(false);
        }
    }, [socket, player, opponent]);

    const attack = useCallback(() => {
        if (socket) {
            socket.emit(OutgoingBattleEvent.storm);
            setOpenMenu(false);
        }
    }, [socket, opponent?.deployedCards]);

    const attackPosition = useCallback((position: BattlefieldPos) => {
        if (socket && opponent && position in opponent.deployedCards) {
            socket.emit(OutgoingBattleEvent.storm, { posToAttack: position });
            setOpenMenu(false);
        }
    }, [socket, opponent?.deployedCards]);

    const convertToMana = useCallback(() => {
        if (socket) {
            socket.emit(OutgoingBattleEvent.addMana);
            setOpenMenu(false);
        }
    }, [socket]);

    const generateOptions = (playerState: IPlayerState, opponentState: IPlayerState) => {
        const options: OptionButton[] = [];
        const attackOptions: SubOptionButton[] = [];

        if (opponentState.deployedCards.frontLiner) {
            attackOptions.push({
                text: "Frontliner",
                callback: () => attackPosition(BattlefieldPos.vanguard),
                hint: attack_frontliner
            });
        }

        if (opponentState.deployedCards.vanguard) {
            attackOptions.push({
                text: "Vanguard",
                callback: () => attackPosition(BattlefieldPos.vanguard),
                hint: attack_vanguard
            });
        }

        if (attackOptions.length > 0) {
            attackOptions.unshift({
                text: "Direct",
                callback: attack,
                hint: attack_directly
            });

            options.push({
                text: "Attack",
                subOptions: attackOptions
            });
        } else {
            options.push({
                text: "Attack",
                callback: attack,
                hint: attack_directly
            });
        }

        if (canMoveToFrontline(playerState, opponentState)) {
            const text = "Move to " + (playerState.deployedCards.frontLiner ? "Vanguard" : "Frontline");
            options.push({
                text: text,
                callback: moveToFrontline,
                hint: playerState.deployedCards.frontLiner ? move_to_frontline : move_to_vanguard
            });
        }

        options.push({ text: "Convert to #mana", callback: convertToMana, hint: convert_to_mana });

        options.push({ text: "Cancel", callback: () => setOpenMenu(false) });

        return options;
    }

    return( stormerCard && (
            openMenu ?
                <MenuOverlay>
                    <menu className={styles.storm} >
                        <div
                            className={styles.card}
                            onClick={() => setOpenMenu(true)}
                        >
                            <CardContent card={stormerCard} />
                        </div>
                        <MultipleOptionsButton options={options} />
                    </menu>
                </MenuOverlay>
                :
                <div className={`${styles.stormButton} ${deckColorStyles.primary[stormerCard.deck]}`}  >
                    <div
                        ref={stormerRef}
                        className={`${styles.card} ${deckColorStyles.primary[stormerCard.deck]}`}
                        onClick={() => setOpenMenu(true)}
                    >
                        <CardContent card={stormerCard} />
                    </div>
                    { animationPlayed &&
                        <div className={styles.button} >
                            <h1>
                                Storm
                            </h1>
                        </div>
                    }
                </div>
        )
    );
}

export default StormMenu;