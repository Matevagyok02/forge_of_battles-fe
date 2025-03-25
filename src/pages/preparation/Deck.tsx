import {FC} from "react";
import styles from "../../styles/preparation_page/Preparation.module.css";
import decksBaseInfo from "../../assets/decks.json";
import light_deck_bg from "../../assets/decks/light.jpg";
import darkness_deck_bg from "../../assets/decks/darkness.jpg";
import venom_deck_bg from "../../assets/decks/venom.jpg";

const deckBackgrounds = {
    [decksBaseInfo.light.id]: light_deck_bg,
    [decksBaseInfo.darkness.id]: darkness_deck_bg,
    [decksBaseInfo.venom.id]: venom_deck_bg
};

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

export interface IDeck {
    name: string;
    id: string;
    description: string;
    background: string;
    animation?: Animation;
    pos?: Pos;
}

const Deck: FC<{
    name: string,
    background: string,
    id: string,
    pos: Pos,
    animation: Animation,
    onClick: (pos: Pos) => void
}> = ({name, background, pos, animation, onClick}) => {

    return(
        <div
            className={`${styles.deck} ${animation} ${pos}`}
            onClick={() => onClick(pos)}
            style={{backgroundImage: `url(${background})`}}
        >
            <span>
                <h1>{name}</h1>
            </span>
        </div>
    );
}

export const initDecks = () => {
    const decks: IDeck[] = [];
    const positions = Object.values(Positions);

    Object.values(decksBaseInfo).forEach(deck => {
        decks.push({
            name: deck.name,
            background: deckBackgrounds[deck.id] as string,
            id: deck.id,
            description: deck.description,
            animation: Animations.none,
            pos: positions.shift()
        });
    });

    return decks;
}

export default Deck;