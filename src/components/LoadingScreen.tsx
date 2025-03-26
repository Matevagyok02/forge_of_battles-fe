import {FC} from "react";
import styles from "../styles/components/LoadingScreen.module.css"
import {Frame} from "./Frame.tsx";

const LoadingScreen : FC <{loading ?: boolean}> = ({loading = true}) => {
    return( loading &&
        <div className={styles.loadingScreen}>
            <div className={`w-32 h-32 relative`} >
                <i className={`animate-pulse ${styles.logo}`} ></i>
                <div className="h-full w-full relative">
                    <div className={`absolute ${styles.customSpin1}`}>
                        <Frame>
                            <div className={styles.frameContentPlaceholder} ></div>
                        </Frame>
                    </div>
                    <div className={`absolute ${styles.customSpin2}`}>
                        <Frame>
                            <div className="w-32 h-32 aspect-square" ></div>
                        </Frame>
                    </div>
                </div>
                <div className={loadingScreenStyles.loadingText}>
                    <h1>loading</h1>
                    <span>
                        <h1 className={loadingScreenStyles.typewriter}>...</h1>
                    </span>
                </div>
            </div>
         </div>
    )
}
export default LoadingScreen