import styles from "../styles/frame.module.css";
import {FC, ReactNode} from "react";

const Frame: FC<{ children: ReactNode }> = ({children}) => {

    return(
        <div className={styles.frameContainer}>
            <div className={styles.frameContent} >{children}</div>
            <div className={styles.frameDecorContainer} >
                <div className={styles.frameBorder}></div>
                <div className={styles.innerFrameContainer}>
                    <div className={styles.topRightInnerBorder} ></div>
                    <div className={styles.topLeftInnerBorder} ></div>
                    <div className={styles.bottomRightInnerBorder} ></div>
                    <div className={styles.bottomLeftInnerBorder} ></div>
                </div>
                <div className={styles.topRightCorner}></div>
                <div className={styles.topLeftCorner}></div>
                <div className={styles.bottomRightCorner}></div>
                <div className={styles.bottomLeftCorner}></div>
            </div>
        </div>
    )
}

export default Frame;

