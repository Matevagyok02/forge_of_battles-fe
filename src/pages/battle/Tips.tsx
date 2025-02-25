import {FC, useContext, useState} from "react";
import {MatchContext} from "../../Context.tsx";
import styles from "./Tips.module.css";
import {Icon, IconButton} from "../../components/Button.tsx";
import {createPortal} from "react-dom";

const Tips: FC = () => {

    const { tip } = useContext(MatchContext);
    const [showTips, setShowTips] = useState<boolean>(true);

    return(
        tip && showTips ?
            createPortal(
                <div className={styles.display} >
                    <p>
                        {tip}
                    </p>
                </div>,
                document.getElementById("battle-container") as HTMLElement
            )
            :
            !showTips &&
            <div className={styles.toggle} >
                <IconButton
                    text={"Show Tips"}
                    icon={Icon.question}
                    onClick={() => setShowTips(!showTips)}
                />
            </div>
    );
}

export default Tips;