import styles from "../styles/components/Frames.module.css";
import {FC, ReactNode} from "react";

export const Frame: FC<{ children: ReactNode, bg?: boolean }> = ({children, bg = false }) => {

    return(
        <div className={styles.frame} >
            <div className={`${styles.content} ${bg ? styles.background : ""}`} >
                {children}
            </div>

            <div className={styles.decorationContainer} >
                <div className={styles.border} ></div>

                <div className={styles.corners} >
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}

export const WindowFrame: FC<{children: ReactNode}> = ({children}) => {

    return (
        <div className={styles.windowFrame} >
            <div>
                {children}

                <div className={styles.decoration} >
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    );
}


