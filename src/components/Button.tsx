import Frame from "./Frame.tsx";
import {FC} from "react";
import "../styles/button.css"

//TODO: Add prop for button width

interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

interface IconButtonProps {
    icon: Icon;
    text?: string;
    decorated?: boolean;
    onClick?: () => void;
    deactivated?: boolean;
}

export enum Icon {
    logout = "right-from-bracket",
    music = "music",
    sound = "volume-high",
    friends = "user-group",
    settings = "gear",
    notification = "bell",
    cancel = "xmark",
    edit = "pen-to-square",
    options = "ellipsis-vertical",
    remove = "trash-can",
    add = "plus",
    message = "comment-dots",
    minimize = "minus",
    send = "paper-plane",
    copy = "copy",
    question = "circle-question",
}

const isNegative = (text: string) => {
    switch (text) {
        case "Cancel":
        case "Decline":
        case "Remove":
        case "Abandon":
        case "Delete":
        case "No":
        case "Leave":
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

    const getWidth = () => {
        const length = props.text.length;

        if (length < 5)
            return "w-32";
        else if (length < 10)
            return "w-40";
        else
            return "w-52";
    }

    return(
        <button
            onClick={handleClick}
            disabled={props.disabled}
            className={`h-fit w-fit framed-button cursor-pointer ${props.disabled ? 'grayscale' : ''} ${props.disabled || props.loading ? 'pointer-events-none' : ''}`}
            style={{pointerEvents: props.disabled || props.loading ? 'none' : 'auto'}}
        >
            <Frame>
                <span className={`${getWidth()} h-full flex justify-center items-center`} >
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

    const iconName = Object.keys(Icon).find(key => Icon[key as keyof typeof Icon] === props.icon);

    const text = props.text ? props.text : iconName ? iconName[0].toUpperCase() + iconName.slice(1) : "";

    return(
        <button
            title={props.text}
            className={`${props.decorated ? "decorative-hex" : ""} icon-btn ${iconName} ${props.deactivated ? "deactivated" : ""}`}
            onClick={props.onClick}
        >
            <i className={`fa-solid fa-${props.icon} ${isNegative(text) ? "text-red-600" : "btn-text"}`} ></i>
        </button>
    )
}