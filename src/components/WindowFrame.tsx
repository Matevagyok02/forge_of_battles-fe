import styles from "../styles/window_frame.module.css";
import {FC, ReactNode} from "react";

const WindowFrame: FC<{children: ReactNode}> = ({children}) => {

    return (
        <div className={styles.windowContainer} >
            <div className={styles.windowInnerContainer} >
                {children}
                <div className={styles.windowDecorContainer} >
                    <div className={styles.windowTopLeftCorner} ></div>
                    <div className={styles.windowTopRightCorner} ></div>
                    <div className={styles.windowBottomLeftCorner} ></div>
                    <div className={styles.windowBottomRightCorner} ></div>
                </div>
            </div>
        </div>
    );
}

export default WindowFrame;