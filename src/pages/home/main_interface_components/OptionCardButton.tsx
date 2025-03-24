import {FC, ReactElement, useContext} from "react";
import create_game_bg from "../../../assets/background/create_game.jpg";
import join_game_bg from "../../../assets/background/join_game.jpg";
import rules_and_cards_bg from "../../../assets/background/rules_and_cards.jpg";
import option_card_content from "../../../assets/option_card_content.json";
import CreateGame from "./CreateGame.tsx";
import JoinGame from "./JoinGame.tsx";
import RulesAndCards from "./RulesAndCards.tsx";
import {AuthContext, ModalContext} from "../../../context.tsx";
import AuthRequiredDialog from "../../../components/AuthRequiredDialog.tsx";
import styles from "../../../styles/home_page/OptionCardButtons.module.css";

interface OptionCardButtonProps {
    title: string;
    description: string;
    bgImage: string;
    content: ReactElement;
    authRequired: boolean;
}

export const optionCardContent: OptionCardButtonProps[] = [
    {
        ...option_card_content.create_game,
        bgImage: create_game_bg,
        content: <CreateGame />,
        authRequired: true
    },
    {
        ...option_card_content.join_game,
        bgImage: join_game_bg,
        content: <JoinGame />,
        authRequired: true
    },
    {
        ...option_card_content.rules_and_cards,
        bgImage: rules_and_cards_bg,
        content: <RulesAndCards />,
        authRequired: false
    }
];

const OptionCardButtons: FC = () => {

    return(
        <div className={styles.container}>
            { Object.values(optionCardContent).map((props, index) => (
                <OptionCard key={index} props={props} />
            ))}
        </div>
    )
}

const OptionCard: FC<{ props: OptionCardButtonProps }> = ({props}) => {

    const {openModal} = useContext(ModalContext);
    const {isAuthenticated} = useContext(AuthContext);

    const openContent = () => {
        if (props.authRequired && !isAuthenticated) {
            openModal(<AuthRequiredDialog modalToBeOpened={props.content} />);
        } else {
            openModal(props.content);
        }
    }

    return(
        <div
            className={styles.button}
            onClick={openContent}
            style={{backgroundImage: `url(${props.bgImage})`}}
        >
            <div>
                <h1 className="gold-text" >
                    {props.title}
                </h1>
                <p>
                    {props.description}
                </p>
            </div>
        </div>
    )
}

export default OptionCardButtons;