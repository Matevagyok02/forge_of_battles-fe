import {FC} from "react";
import styles from "../../styles/preparation_page/Preparation.module.css";
import decksBaseInfo from "../../assets/decks.json";

export const deckNameStyles = {
    [decksBaseInfo.light.id]: styles.light,
    [decksBaseInfo.darkness.id]: styles.darkness,
    [decksBaseInfo.venom.id]: styles.venom
}

export const Animations = {
    centerToRight: styles.centerToRight,
    rightToLeft: styles.rightToLeft,
    leftToCenter: styles.leftToCenter,
    centerToLeft: styles.centerToLeft,
    rightToCenter: styles.rightToCenter,
    leftToRight: styles.leftToRight,
    none: ""
}

export type Animation = typeof Animations[keyof typeof Animations];

export const Positions = {
    center: styles.center,
    right: styles.right,
    left: styles.left
}

export type Pos = typeof Positions[keyof typeof Positions];

interface IDeckBaseInfo {
    name: string;
    id: string;
    description: string;
    locked?: boolean;
}

export interface IDeck {
    name: string;
    id: string;
    description: string;
    animation?: Animation;
    pos?: Pos;
    locked?: boolean;
}

const Deck: FC<{
    name: string,
    id: string,
    pos: Pos,
    animation: Animation,
    onClick: (pos: Pos) => void,
    locked?: boolean
}> = ({name, id, pos, animation, onClick, locked}) => {

    return(
        <div
            className={`${styles.deck} ${deckNameStyles[id]} ${animation} ${pos} ${locked ? styles.locked : ""}`}
            onClick={() => onClick(pos)}
        >
            <div className={styles.background}></div>
            { locked &&
                <div className={styles.lock}></div>
            }
            <span>
                <h1>{name}</h1>
            </span>
        </div>
    );
}

export const initDecks = () => {
    const decks: IDeck[] = [];
    const positions = Object.values(Positions);

    Object.values(decksBaseInfo).forEach((deck: IDeckBaseInfo) => {
        decks.push({
            ...deck,
            animation: Animations.none,
            pos: positions.shift()
        });
    });

    return decks;
}

export default Deck;