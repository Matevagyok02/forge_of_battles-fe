import {FC, useEffect, useRef, useState} from "react";
import styles from "../../styles/decks_and_cards_page/DecksAndCards.module.css";
import cardStyles from "../../styles/battle_page/Cards.module.css";
import decks from "../../assets/decks.json";
import {Frame} from "../../components/Frame.tsx";
import {useCardByDeck} from "../../api/hooks.tsx";
import {ICard} from "../../interfaces.ts";
import CardContent from "../battle/cards/CardContent.tsx";
import LoadingScreen from "../../components/LoadingScreen.tsx";
import {deckNameStyles} from "../preparation/Deck.tsx";
import {Icon, IconButton} from "../../components/Button.tsx";
import {useNavigate} from "react-router-dom";
import {MusicVolumeControl} from "../../components/BgMusic.tsx";

const DeckStyles = {
    [decks.light.id]: styles.light,
    [decks.darkness.id]:  styles.darkness,
    [decks.venom.id]: styles.venom,
};

type Deck = keyof typeof decks;

const DecksAndCards = () => {
    const [deck, setDeck] = useState<Deck>(decks.light.id as Deck);
    const [cards, setCards] = useState<ICard[]>([]);

    const navigate = useNavigate();
    const fetchDeck = useCardByDeck(deck as string);

    useEffect(() => {
        if (fetchDeck.isSuccess) {
            setCards(fetchDeck.data.data);
            console.log(fetchDeck.data.data);
        }
    }, [fetchDeck.data]);

    return ( fetchDeck.isLoading ?
            <LoadingScreen/>
            :
            <main className={styles.decksAndCards}>
                <div className={`${styles.background} ${deckNameStyles[deck]}`} ></div>
                <menu>
                    <IconButton icon={Icon.left} text={"Home"} showText onClick={() => navigate("/")} />
                    <MusicVolumeControl />
                </menu>
                <div className={styles.cardDisplay} >
                    <h1 className={deckNameStyles[deck]} >
                        {decks[deck].name}
                    </h1>
                    <ul>
                        {cards.map((card) => (
                            <li key={card.id} className={`${cardStyles.card} ${cardStyles.large}`} >
                                <CardContent card={card} />
                            </li>
                        ))}
                    </ul>
                </div>
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
                            onClick={() => setDeck(d.id as Deck)}
                            className={`${d.locked ? styles.locked : ""} ${deck === d.id ? styles.selected : ""}`}
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