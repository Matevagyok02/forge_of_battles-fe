import {FC} from "react";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import styles from "../../../styles/home_page/OptionCardContent.module.css";

const RulesAndCards: FC = () => {

    return(
        <Modal>
            <div className={styles.rulesAndCardsPanel} >
                <div className={styles.rules} >
                    <i></i>
                    <p>
                        Check our set of rules to learn how to play the game
                    </p>
                    <Button text="Rules     " onClick={() => alert("TODO")} />
                </div>
                <span className="vr" ></span>
                <div className={styles.cards} >
                    <i></i>
                    <p>
                        Browse cards from each deck, learn their about their abilities and how to use them
                    </p>
                    <Button text="Cards     " onClick={() => alert("TODO")} />
                </div>
            </div>
        </Modal>
    );
}

export default RulesAndCards;