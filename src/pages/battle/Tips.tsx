import {FC, ReactNode, useContext, useEffect} from "react";
import {MatchContext} from "../../context.tsx";
import styles from "../../styles/battle_page/Tips.module.css";
import BattlePortalWrap from "../../components/BattlePortalWrap.tsx";
import tips from "../../assets/tips.json";
import {IPlayerState} from "../../interfaces.ts";

const Tips: FC = () => {

    const { tip, setTip, player } = useContext(MatchContext);

    const getTipByState = (playerState: IPlayerState) => {
        switch (playerState.turnStage) {
            case 1: {
                switch (playerState.drawsPerTurn) {
                    case 0: return tips.draw_cards;
                    case 1: return tips.change_cards_and_use_passive;
                    case 2: return tips.use_passive_and_advance;
                    default: return undefined;
                }
            }
            case 2: return tips.storm;
            case 3: return tips.deploy_use_action_and_end_turn;
            default: return undefined;
        }
    }

    useEffect(() => {
        if (!tip && player) {
            setTip(getTipByState(player));
        }
    }, [player, tip]);

    useEffect(() => {
        if (player) {
            setTip(getTipByState(player));
        }
    }, [player?.turnStage, player?.drawsPerTurn]);

    const parseTipText = (text: string) => {
        const stringArr: (string | ReactNode)[] = text
            .replace("_", " ")
            .replace("#", "")
            .split(".");

        let styleClass = "";

        switch (stringArr[1]) {
            case "btn":
                styleClass = styles.btn;
                break;
            case "acAbl":
                styleClass = styles.acAbl;
                break;
            case "paAbl":
                styleClass = styles.paAbl;
                break;
            case "mana":
                stringArr[0] = <>&nbsp;&nbsp;&nbsp;</>;
                styleClass = styles.mana;
                break;
            case "highlight":
                styleClass = styles.highlight;
                break;
            default: break;
        }

        return { text: stringArr[0], styleClass };
    }

    return(
        tip &&
            <BattlePortalWrap>
                <div className={styles.display}  >
                    <i title="Hints" className="fa-solid fa-question-circle" ></i>
                    <p>
                        { tip.split(" ").map((word, i) => {
                            if (word.includes("#")) {
                                const { text, styleClass } = parseTipText(word);
                                return(
                                    <span key={i} className={styleClass} >{text}</span>
                                );
                            } else {
                                return " " +  word + " ";
                            }
                        })}
                    </p>
                </div>
            </BattlePortalWrap>
    );
}

export default Tips;