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

export const Button: FC<ButtonProps> = (props) => {

    const handleClick = () => {
        if (!props.loading && props.onClick) {
            props.onClick();
        }
    }

    const isNegative = () => {
        switch (props.text) {
            case "Cancel":
            case "Decline":
            case "Remove":
                return true;
            default:
                return false;
        }
    }

    return(
        <button
            onClick={handleClick}
            disabled={props.disabled}
            className={
            `h-fit w-fit framed-button cursor-pointer 
            ${props.disabled ? 'grayscale pointer-events-none' : ''}
            ${props.loading ? 'pointer-events-none glow' : ''}`}
        >
            <Frame>
                <span className={`${props.text.length < 10 ? "w-40" : "w-52"} h-full flex justify-center items-center`} >
                    { props.loading ?
                        <div className="loader absolute" ></div>
                        :
                        <label
                            className={`absolute font-amarante text-xl cursor-pointer ${isNegative() ? "red-text" : "gold-text"}`}
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
        message: "comment-dots"
    }

    const icon = icons[props.icon];

    return(
        icon &&
        <button
            title={props.text}
            className={`${props.decorated ? "decorative-hex" : ""} icon-btn ${props.icon}`}
            onClick={props.onClick}
        >
            <i className={`fa-solid fa-${icon} text-gold`} ></i>
        </button>
    )
}