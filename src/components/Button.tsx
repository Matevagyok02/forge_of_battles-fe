import Frame from "./Frame.tsx";
import {FC} from "react";
import "../styles/button.css"

interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

interface IconButtonProps {
    text: string;
    icon: string;
    decorated?: boolean;
    onClick?: () => void;
}

const isNegative = (text: string) => {
    switch (text) {
        case "Cancel":
        case "Decline":
        case "Remove":
        case "Abandon":
            return true;
        default:
            return false;
    }
}

export const Button: FC<ButtonProps> = (props) => {

    const handleClick = () => {
        if (!props.loading && props.onClick) {
            props.onClick();
        }
    }

    return(
        <button
            onClick={handleClick}
            disabled={props.disabled}
            className={`h-fit w-fit framed-button cursor-pointer ${props.disabled ? 'grayscale' : ''} ${props.disabled || props.loading ? 'pointer-events-none' : ''}`}
            style={{pointerEvents: props.disabled || props.loading ? 'none' : 'auto'}}
        >
            <Frame>
                <span className={`${props.text.length < 10 ? "w-40" : "w-52"} h-full flex justify-center items-center`} >
                    { props.loading ?
                        <div className="loader absolute" ></div>
                        :
                        <label
                            className={`absolute font-bold text-xl cursor-pointer ${isNegative(props.text) ? "red-text" : "btn-text"}`}
                        >
                            {props.text}
                        </label>
                    }
                </span>
            </Frame>
        </button>
    )
}

export const IconButton: FC<IconButtonProps> = (props) => {

    const icons: { [key: string]: string } = {
        logout: "right-from-bracket",
        music: "music",
        sound: "volume-high",
        friends: "user-group",
        settings: "gear",
        notification: "bell",
        cancel: "xmark",
        edit: "pen-to-square",
        options: "ellipsis-vertical",
        remove: "trash-can",
        add: "plus",
        message: "comment-dots",
        minimize: "minus",
        send: "paper-plane",
        copy: "copy"
    }

    const icon = icons[props.icon];

    return(
        icon &&
        <button
            title={props.text}
            className={`${props.decorated ? "decorative-hex" : ""} icon-btn ${props.icon}`}
            onClick={props.onClick}
        >
            <i className={`fa-solid fa-${icon} ${isNegative(props.text) ? "text-red-600" : "btn-text"}`} ></i>
        </button>
    )
}