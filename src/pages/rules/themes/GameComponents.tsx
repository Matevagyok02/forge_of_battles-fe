import {FC} from "react";
import board from "../../../assets/tutorial_images/board.png";
import hud from "../../../assets/tutorial_images/hud.png";
import styles from "../../../styles/rules_page/Rules.module.css";
import { battlefieldPositions } from "../../battle/Board.tsx";

export const CardPilesAndHand: FC = () => {

    return(
        <div className={styles.gameComponents} >
            <img src={board} alt={"Card Piles & Hand"} />
            <div>
                <ul className={styles.legend} >
                    <li>You</li>
                    <li>Opponent</li>
                </ul>
                <horizontal-line></horizontal-line>
                <ol className={styles.descriptions} >
                    <li>
                        <span>Hand</span>
                        Cards in your hand are not deployed yet, but you can play or sacrifice them during your turn.
                        In your opponent's hand you can see how many cards they have, to determine the effect of some
                        abilities.
                    </li>
                    <li>
                        <span>Draw Pile</span>
                        This is where you draw new cards at the beggining of your turn. The amount of cards left is also
                        indicated in the bottom right corner. Your opponent's draw pile serves only visual purposes.
                    </li>
                    <li>
                        <span>Discard Pile</span>
                        Casualties are stored here. By interacting with the pile, you can see both your and your
                        opponent's casualties.
                    </li>
                </ol>
            </div>
        </div>
    );
}

export const HUD: FC = () => {

    return(
        <div className={styles.gameComponents} >
            <img src={hud} alt={"HUD"} />
            <div>
                <p>
                    The <span>Heads Up Display</span> is where you can see your current stats. It consists of
                    the following elements:
                </p>
                <horizontal-line></horizontal-line>
                <ol className={styles.descriptions} >
                    <li>
                        <span>Mana</span>
                        This is your resource pool. You can gain Mana by converting your cards at engagements and use it
                        to play cards or activate abilities.
                    </li>
                    <li>
                        <span>Healt</span>
                        Your health is equal to the amount of cards in your draw pile and your bonus health points
                        (These can be gained by some abilities). If your health reaches 0, you lose the game.
                    </li>
                    <li>
                        <span>Effects</span>
                        Here you can see the effects of your cards that are currently active. The color and icon of the
                        effect indicate its type.
                    </li>
                    <li>
                        <span>Time Left</span>
                        In the case of a game with time limit, this is where you can see how much time you have left.
                    </li>
                </ol>
            </div>
        </div>
    );
}

export const Battlefield: FC = () => {

    return(
        <div className={`${styles.gameComponents} ${styles.battlefield}`} >
            <ul className={styles.visualBattlefield} >
                { battlefieldPositions.map((pos, index) =>
                    <li
                        key={index}
                        data-value={pos.owner}
                    >
                        { pos.pos[0].toUpperCase() + pos.pos.slice(1) }
                    </li>
                )}
            </ul>
            <div>
                <p>
                    This is where the action happens! The <span>Battlefield</span> is a 3 by 3 area where your deployed
                    cards will appear.
                </p>
                <horizontal-line></horizontal-line>
                <ol className={styles.descriptions} >
                    <li>
                        <span>Defender</span>
                        The card on this field protects you from incoming attack using its defense value. When you
                        deploy a new card, it will be placed in this position by default.
                    </li>
                    <li>
                        <span>Supporter</span>
                        When advancing, your Defender will move to this position.
                    </li>
                    <li>
                        <span>Attacker</span>
                        This is the position where your Supporter will move to when advancing. When your attacker moves
                        forward, you will be prompted to select one of the engagement options.
                    </li>
                    <li>
                        <span>Frontliner</span>
                        This field can be occupied by selecting the "Move to Front" option at engagement. The card on
                        this field will not move when you advance and its passive ability will be permanently available.
                    </li>
                    <li>
                        <span>Vanguard</span>
                        Works the same as the Frontliner, with a minor difference. The Vanguard field is contested,
                        meaning that both players can occupy it if it's empty, and the player alreay occuppied the
                        Frontliner field.
                    </li>
                </ol>
                <horizontal-line></horizontal-line>
                <ul className={styles.legend} >
                    <li>You</li>
                    <li>Opponent</li>
                </ul>
            </div>
        </div>
    );
}