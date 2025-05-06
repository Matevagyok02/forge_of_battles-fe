import styles from "../../../styles/rules_page/Rules.module.css";
const TurnSequence = () => {

    return (
        <div className={styles.turnSequence} >
            <p>
                Each turn in Forge of Battles has 3 main phases. Here’s how they work:
            </p>
            <ul>
                <li>
                    <h1>1. Draw</h1>
                    <ol style={{ listStyle: "decimal" }} >
                        <li>
                            Draw 2 cards from your deck.
                        </li>
                        <li>
                            If you don’t like them, you can place both on the bottom of your draw deck and draw 2 new ones instead — but only once!
                        </li>
                        <li>
                            After that, check your battlefield. If any of your cards have passive abilities that need manual activation and a mana/resource cost, now’s your time to use them.
                        </li>
                    </ol>
                </li>
                <vertical-line/>
                <li>
                    <h1>2. Advance and Engage</h1>
                    <ol style={{ listStyle: "decimal" }} >
                        <li>
                            All cards in the right column of your battlefield move up one space.
                        </li>
                        <li>
                            <span>
                                If a card reaches the top-right spot (the Attack Position), it’s time to choose what to do with it:
                            </span>
                            <ol style={{ listStyle: "circle" }} >
                                <li>
                                    Attack: Kill enemy cards on the Frontliner or Vanguard position – or go straight for the opponent’s deck
                                    <small> (that’s their life total!)</small>
                                    . Your cards action ability will be triggered and the card will be added to your casualties afterwards.
                                </li>
                                <li>
                                    Convert to a Mana: Save it for later – it becomes a source of power you can spend during this turn.
                                </li>
                                <li>
                                    Make it Permanent: Move it to the Frontliner or Vanguard slot, this way its passive ability becomes permanent – but only if that spot is free!
                                </li>
                            </ol>
                        </li>
                    </ol>
                </li>
                <vertical-line/>
                <li>
                    <h1>3. Play Cards</h1>
                    <ol style={{ listStyle: "circle" }} >
                        <li>
                            If the Defender position on your battlefield is empty, you can deploy a card from your hand by paying its cost.
                            If the card has a free passive ability, it will be activated as soon as it's deployed.
                        </li>
                        <li>
                            You can also activate an action ability straight from your hand:
                            The effect will be applied immediately, and the card will be discarded (not played to the field).
                        </li>
                    </ol>
                </li>
            </ul>
        </div>
    );
}

export default TurnSequence;