import Frame from "./Frame.tsx";
import {FC} from "react";

interface ButtonProps {
    text?: string;
    onClick?: () => void;
}

const Button: FC<ButtonProps> = ({text, onClick}) => {

    const defaultClickHandler = () => {
        console.log("You pressed a button");
    }

    return(
        <button onClick={onClick? onClick : defaultClickHandler} className="h-fit w-fit framed-button cursor-pointer" >
            <Frame>
                <span className="h-full w-52 flex justify-center" >
                    <label className="absolute text-gold font-amarante text-xl cursor-pointer" >
                        {text? text : ""}
                    </label>
                </span>
            </Frame>
        </button>
    )
}

export default Button;