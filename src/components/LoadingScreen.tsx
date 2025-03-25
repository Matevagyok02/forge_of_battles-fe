import {FC, ReactNode} from "react";
import loadingScreenStyles from "../styles/LoadingScreen.module.css"
import logo from "../assets/svg/logo.svg";
import Frame from "./Frame.tsx";

const LoadingScreen : FC <{children: ReactNode, loading ?: boolean}> = ({children, loading = true}) => {
    return( loading &&
        <div className={loadingScreenStyles.loadingScreen}>
            <div className={`w-24 h-24 relative`} >
                <img src={logo} alt="Logo" className={`animate-pulse ${loadingScreenStyles.logo}`} />
                <div className="h-full w-full relative">
                    <div className={`absolute ${loadingScreenStyles.customSpin1}`}>
                        <Frame>
                            <div className="w-24 h-24 aspect-square" >{children}</div>
                        </Frame>
                    </div>
                    <div className={`absolute ${loadingScreenStyles.customSpin2}`}>
                        <Frame>
                            <div className="w-24 h-24 aspect-square" >{children}</div>
                        </Frame>
                    </div>
                </div>
            </div>
         </div>
    )
}
export default LoadingScreen