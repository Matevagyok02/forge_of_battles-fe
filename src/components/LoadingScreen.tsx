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
                            <div className="w-24 h-24 aspect-square" ></div>
                        </Frame>
                    </div>
                    <div className={`absolute ${loadingScreenStyles.customSpin2}`}>
                        <Frame>
                            <div className="w-24 h-24 aspect-square" ></div>
                        </Frame>
                    </div>
                </div>
            </div>
         </div>
    )
}
export default LoadingScreen