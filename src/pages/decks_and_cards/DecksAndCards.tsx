import {FC, useEffect, useState} from "react";
import styles from "../../styles/decks_and_cards/DecksAndCards.module.css";
import decks from "../../assets/decks.json";
import { Frame } from "../../components/Frame.tsx";

const DeckStyles = {
    [decks.light.id]: {
        def: styles.light,
        prev: styles.prevLight,
    },
    [decks.darkness.id]: {
        def: styles.darkness,
        prev: styles.prevDarkness,
    },
    [decks.venom.id]: {
        def: styles.venom,
        prev: styles.prevVenom,
    },
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

    const [currDeck, setCurrDeck] = useState<Deck>(deck);
    const [prevDeck, setPrevDeck] = useState<Deck>(deck);

    useEffect(() => {
        setPrevDeck(currDeck);
        setCurrDeck(deck);
    }, [deck]);

    return (
        <Frame>
            <div className={styles.selectPanel}>
                <div className={`${DeckStyles[currDeck].def} ${DeckStyles[prevDeck].prev}`} >
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
            <div className={`${styles.deckButton} ${DeckStyles[id].def}`}>
                <h1>{name}</h1>
                <div>
                    <p>{description}</p>
                </div>
            </div>
        </Frame>
    );
};

export default DecksAndCards;