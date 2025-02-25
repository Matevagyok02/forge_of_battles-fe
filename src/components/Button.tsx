import Frame from "./Frame.tsx";
import {FC} from "react";
import buttonStyles from "../styles/button.module.css"
import appStyles from "../styles/app.module.css"

interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export enum IconBtnDecoration {
    horizontal = 1,
    vertical = 2
}

interface IconButtonProps {
    text: string;
    icon: string;
    decorated?: IconBtnDecoration;
    onClick?: () => void;
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
            className={`h-fit w-fit ${appStyles.framedButton} cursor-pointer ${props.disabled ? 'grayscale' : ''} ${props.disabled || props.loading ? 'pointer-events-none' : ''}`}
            style={{pointerEvents: props.disabled || props.loading ? 'none' : 'auto'}}
        >
            <Frame>
                <span className={`${getWidth()} h-full flex justify-center items-center`} >
                    { props.loading ?
                        <div className="loader absolute" ></div>
                        :
                        <label
                            className={`absolute font-bold text-xl cursor-pointer ${isNegative(props.text) ? buttonStyles.redText : "btn-text"}`}
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
        copy: "copy",
        arrowRight: "arrow-right",
        arrowLeft: "arrow-left",
    }

    const icon = icons[props.icon];

    return(
        icon &&
        <button
            title={props.text}
            className={`${props.decorated ? (props.decorated === IconBtnDecoration.horizontal ? buttonStyles.decorativeHex : buttonStyles.decorativeHexHorizontal) : ""} ${buttonStyles.iconBtn} ${props.icon}`}
            onClick={props.onClick}
        >
            <i className={`fa-solid fa-${icon} ${isNegative(props.text) ? "text-red-600" : "btn-text"}`} ></i>
        </button>
    )
}