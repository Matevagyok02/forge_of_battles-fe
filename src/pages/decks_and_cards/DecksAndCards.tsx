import {FC, useEffect, useRef, useState} from "react";
import styles from "../../styles/decks_and_cards_page/DecksAndCards.module.css";
import decks from "../../assets/decks.json";
import { Frame } from "../../components/Frame.tsx";

const DeckStyles = {
    [decks.light.id]: styles.light,
    [decks.darkness.id]:  styles.darkness,
    [decks.venom.id]: styles.venom,
};

type Deck = keyof typeof DeckStyles;

const DecksAndCards = () => {
    const [deck, setDeck] = useState<Deck>(decks.light.id);

    return (
        <main className={styles.decksAndCards}>
            <DeckSelectPanel deck={deck} setDeck={setDeck} />
        </main>
    );
};

const DeckSelectPanel: FC<{ deck: Deck; setDeck: (deck: Deck) => void }> = ({ deck, setDeck }) => {

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                ref.current?.classList?.remove(styles.bgTransition);
                }, 500
            );
        }
    }, [deck]);

    return (
        <Frame>
            <div className={styles.selectPanel}>
                <div ref={ref} className={`${DeckStyles[deck]} ${styles.bgTransition}`} >
                    {Object.values(decks).map((d) => (
                        <button
                            key={d.id}
                            onClick={() => setDeck(d.id)}
                            className={deck === d.id ? styles.selected : ""}
                        >
                            <DeckButton
                                name={d.name}
                                id={d.id}
                                description={d.description}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </Frame>
    );
};

const DeckButton: FC<{ name: string; id: string; description: string }> = ({ name, id, description }) => {

    return (
        <Frame>
            <div className={`${styles.deckButton} ${DeckStyles[id]}`}>
                <h1>{name}</h1>
                <div>
                    <p>{description}</p>
                </div>
            </div>
        </Frame>
    );
};

export default DecksAndCards;