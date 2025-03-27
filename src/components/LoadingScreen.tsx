import {FC, Suspense} from "react";
import styles from "../styles/components/LoadingScreen.module.css"
import {Frame} from "./Frame.tsx";

const LoadingScreen : FC <{loading ?: boolean}> = ({loading = true}) => {

    return( loading &&
        <div className={styles.loadingScreen}>
            <div>
                <i className={`animate-pulse ${styles.logo}`} ></i>
                <div className={`${styles.spinningFrame} ${styles.reverseSpin}`}>
                    <Frame>
                        <div className={styles.frameContentPlaceholer} ></div>
                    </Frame>
                </div>
                <div className={`${styles.spinningFrame} ${styles.spin}`}>
                    <Frame>
                        <div className={styles.frameContentPlaceholer} ></div>
                    </Frame>
                </div>
                <div className={styles.loadingText}>
                    <h1>loading</h1>
                    <span>
                        <h1 className={styles.typewriter}>...</h1>
                    </span>
                </div>
            </div>
        </div>
    )
}
export default LoadingScreen