import styles from "../../../styles/rules_page/Rules.module.css";
import cardStyles from "../../../styles/battle_page/Cards.module.css";
import boardStyles from "../../../styles/battle_page/Board.module.css";

const Overview = () => {

    const cards = [
        boardStyles.darkness,
        boardStyles.light,
        boardStyles.venom
    ]

    return (
        <div className={styles.overview} >
            <p>
                <i>Forge of Battles </i>
                is a deeply strategic, two-player card game where calculated moves and careful planning determine the outcome of a relentless war of attrition. As a battlefield commander, you must lead your forces with foresight and precision, aiming to wear down your opponent and outlast their defenses.
                Each card in your deck is a versatile resource, offering multiple tactical options. Every decision—whether to attack, defend, or sacrifice—comes with weight and consequence. Success demands not just boldness, but the ability to anticipate and adapt to your opponent’s strategy.
                In the Forge of Battles, victory doesn’t go to the quickest hand, but to the sharpest mind.
            </p>
            <ul>
                {cards.map((card, index) =>
                    <li key={index} className={`${cardStyles.cardBack} ${card}`} >
                        <div></div>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default Overview;