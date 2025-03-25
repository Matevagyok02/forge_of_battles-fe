import {FC} from "react";
import loadingScreenStyles from "../styles/components/LoadingScreen.module.css"
import logo from "../assets/svg/logo.svg";
import {Frame} from "./Frame.tsx";

const LoadingScreen : FC <{loading ?: boolean}> = ({loading = true}) => {
    return( loading &&
        <div className={loadingScreenStyles.loadingScreen}>
            <div className={`w-24 h-24 relative`} >
                <img src={logo} alt="Logo" className={`animate-pulse ${loadingScreenStyles.logo}`} />
                <div className="h-full w-full relative">
                    <div className={`absolute ${loadingScreenStyles.customSpin1}`}>
                        <Frame>
                            <div className="w-24 h-24 aspect-square"/>
                        </Frame>
                    </div>
                    <div className={`absolute ${loadingScreenStyles.customSpin2}`}>
                        <Frame>
                            <div className="w-24 h-24 aspect-square"/>
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