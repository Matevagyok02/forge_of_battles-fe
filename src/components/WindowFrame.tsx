import "../styles/window_frame.css";
import {FC, ReactNode} from "react";

const WindowFrame: FC<{children: ReactNode}> = ({children}) => {

    return (
        <div className="window-container" >
            <div className="window-inner-container" >
                {children}
                <div className="window-decor-container" >
                    <div className="window-top-left-corner" ></div>
                    <div className="window-top-right-corner" ></div>
                    <div className="window-bottom-left-corner" ></div>
                    <div className="window-bottom-right-corner" ></div>
                </div>
            </div>
        </div>
    );
}

export default WindowFrame;