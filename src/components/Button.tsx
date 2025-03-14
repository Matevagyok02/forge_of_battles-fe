import Frame from "./Frame.tsx";
import {FC, ReactNode} from "react";
import "../styles/button.css"

const negativeTexts = ["cancel", "decline", "remove", "abandon", "delete", "no", "leave"];

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

export interface OptionButton {
    text: string;
    callback?: (args?: any) => void;
    hint?: string;
    subOptions?: SubOptionButton[];
}

export interface SubOptionButton {
    text: string;
    callback: (args?: any) => void;
    hint?: string;
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

const deactivated = (state: boolean | undefined) => {
    return state ? "deactivated" : "";
}

const negative = (text: string) => {
    return negativeTexts.includes(text.toLowerCase()) ? "negative-btn" : "";
}

const decorated = (decorated: boolean | undefined) => {
    return decorated ? "decorative-hex" : "";
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
                            className={`absolute text-xl cursor-pointer ${negative(props.text)}`}
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
            className={`icon-btn ${decorated(props.decorated)} ${iconName} ${deactivated(props.deactivated)} ${negative(text)}`}
            onClick={props.onClick}
        >
            <i className={`fa-solid fa-${props.icon}`} ></i>
        </button>
    )
}

export const MultipleOptionsButton: FC<{ options: OptionButton[] }> = ({ options}) => {

    const formatText = (text: string): string | ReactNode => {
        if (text.includes("#")) {
            const textArray = text.split(" ");

            return(
                textArray.map((word, index) => {
                    if (word.includes("#")) {
                        const formattedWord = word.replace("#", "");
                        let styleClass: string;

                        switch (formattedWord) {
                            case "sacrifice":
                                styleClass = "sacrifice-icon";
                                break;
                            case "mana":
                                styleClass = "mana-icon";
                                break;
                            default:
                                styleClass = "";
                        }

                        return <span key={index} className={styleClass} >&nbsp;&nbsp;&nbsp;</span>;
                    } else {
                        return " " + word + " ";
                    }
                })
            )
        } else {
            return text;
        }
    }

    const Hint: FC<{ hint: string }> = ({ hint }) => {

        return( hint &&
            <span className="hint" >
                <i className="fa-solid fa-question-circle" ></i>
                <p>{formatText(hint)}</p>
            </span>
        )
    }

    return(
        <ul className="multipleOptionsBtnList" >
            { options.map((option, index) =>
                option.subOptions ?
                    <ul key={index} >
                        <h1>
                            {formatText(option.text)}
                        </h1>
                        <ul>
                            { option.subOptions.map((subOption, index) =>
                                <li
                                    key={index}
                                    className={negative(subOption.text)}
                                    onClick={subOption.callback}
                                >
                                    <h1>
                                        {formatText(subOption.text)}
                                    </h1>
                                    { subOption.hint && <Hint hint={subOption.hint} /> }
                                </li>
                            )}
                        </ul>
                    </ul>
                    :
                    option.callback && (
                        <li
                            key={index}
                            className={negative(option.text)}
                            onClick={option.callback}
                        >
                            <h1>
                                {formatText(option.text)}
                            </h1>
                            { option.hint && <Hint hint={option.hint} /> }
                        </li>
                    )
            )}
        </ul>
    );
}