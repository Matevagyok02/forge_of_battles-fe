import {FC} from "react";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import styles from "./Home.module.css";

const TutorialAndCards: FC = () => {

    return(
        <Modal>
            <div className={styles.tutorialAndCardsPanel} >
                <div>
                    <div className={`${styles.decorativeHex} ${styles.tutorial}`} >

                    </div>
                    <p>
                        Play the tutorial to learn the game mechanics and how to play
                    </p>
                    <Button text="Tutorial  " onClick={() => alert("TODO")} />
                </div>
                <span className="vr" ></span>
                <div>
                    <div className={`${styles.decorativeHex} ${styles.cards}`} >

                    </div>
                    <p>
                        Check our set of rules to learn how to play the game
                    </p>
                    <Button text="Rules     " onClick={() => alert("TODO")} />
                </div>
                <span className="vr" ></span>
                <div>
                    <div className={`${styles.decorativeHex} ${styles.rules}`} >
                    </div>
                    <p>
                        Browse cards from each deck, learn their about their abilities and how to use them
                    </p>
                    <Button text="Cards     " onClick={() => alert("TODO")} />
                </div>
            </div>
        </Modal>
    );
}

export default TutorialAndCards;