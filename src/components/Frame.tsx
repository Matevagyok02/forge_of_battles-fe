import "../styles/frame.css";
import {FC, ReactNode} from "react";

const Frame: FC<{ children: ReactNode }> = ({children}) => {

    return(
        <div className="frame-container">
            <div className="frame-content" >{children}</div>
            <div className="frame-decor-container" >
                <div className="frame-border"></div>
                <div className="inner-frame-container">
                    <div className="top-right-inner-border" ></div>
                    <div className="top-left-inner-border" ></div>
                    <div className="bottom-right-inner-border" ></div>
                    <div className="bottom-left-inner-border" ></div>
                </div>
                <div className="top-right-corner"></div>
                <div className="top-left-corner"></div>
                <div className="bottom-right-corner"></div>
                <div className="bottom-left-corner"></div>
            </div>
        </div>
    )
}

export default Frame;