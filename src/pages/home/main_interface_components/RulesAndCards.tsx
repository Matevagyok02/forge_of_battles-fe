import {FC} from "react";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import styles from "../../../styles/home_page/OptionCardContent.module.css";
import {useNavigate} from "react-router-dom";

const RulesAndCards: FC = () => {
    const navigate = useNavigate()

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

                <vertical-line/>

                <div className={styles.cards} >
                    <i></i>
                    <p>
                        Browse cards from each deck, learn their about their abilities and how to use them
                    </p>
                    <Button text="Cards     " onClick={() => navigate("decks-and-cards")} />
                </div>
            </div>
        </Modal>
    );
}

export default RulesAndCards;