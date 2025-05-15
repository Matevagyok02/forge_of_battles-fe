import {forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useState} from "react";
import styles from "../../../styles/battle_page/AttackAnimationDisplay.module.css";
import {deckColorStyles} from "../Board.tsx";
import {MatchContext} from "../../../context.tsx";

export interface AttackAnimationHandle {
    playerAttack: () => void;
    opponentAttack: () => void;
}

const AttackAnimationDisplay = forwardRef((_, ref) => {

    const { opponent, player } = useContext(MatchContext);
    const [color, setColor] = useState<keyof deckColorStyles | null>(null);
    const [isOpponentAttack, setIsOpponentAttack] = useState<boolean>(false);

    const playerAttack = () => {
        if (player) {
            setColor(deckColorStyles.primary[player.deck]);
            setIsOpponentAttack(false);
        }
    }

    const opponentAttack = () => {
        if (opponent) {
            const color = player.deck === opponent.deck ?
                deckColorStyles.secondary[opponent.deck]
                :
                deckColorStyles.primary[opponent.deck];

            setColor(color);
            setIsOpponentAttack(true);
        }
    }

    useImperativeHandle( ref, ()  => ({
        playerAttack,
        opponentAttack
    }), [opponent, player]);

    useEffect(() => {
        let timeout: number;

        if (color) {
            timeout = setTimeout(() => {
                setColor(null);
                setIsOpponentAttack(false);
            }, 3000);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [color]);

    return ( color &&
        <div className={`${styles.attackDisplay} ${color} ${isOpponentAttack ? styles.opponentAttack : ""}`}>
            <i className={styles.sword} ></i>
        </div>
    );
});

export default AttackAnimationDisplay;