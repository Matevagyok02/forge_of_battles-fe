import {Frame} from "./Frame.tsx";
import {FC, ReactNode} from "react";
import styles from "../styles/components/Buttons.module.css"
import iconStyles from "../styles/battle_page/Cards.module.css";

const negativeTexts = ["cancel", "decline", "remove", "abandon", "delete", "no", "leave"];

enum ButtonWidth {
    small = 128,
    medium = 160,
    large = 208
}

interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    bg?: boolean;
    width?: ButtonWidth;
}

interface IconButtonProps {
    icon: Icon;
    text?: string;
    decorated?: boolean;
    onClick?: () => void;
    deactivated?: boolean;
    bg?: boolean;
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
    cancel = "xmark",
    edit = "pen-to-square",
    options = "ellipsis-vertical",
    remove = "trash-can",
    add = "plus",
    unseenMessage = "envelope",
    message = "comment-dots",
    minimize = "minus",
    send = "paper-plane",
    copy = "copy",
    question = "circle-question",
    refresh = "rotate"
}

export const getIcon = (icon: Icon) => {
    return `fa-solid fa-${icon}`;
}

export const negative = (text: string) => {
    return negativeTexts.includes(text.toLowerCase()) ? styles.negative : "";
}

export const Button: FC<ButtonProps> = (props) => {

    const handleClick = () => {
        if (!props.loading && props.onClick) {
            props.onClick();
        }
    }

    const getWidth = () => {
        if (props.width) return props.width;
        if (props.text.length < 5) return ButtonWidth.small;
        if (props.text.length < 10) return ButtonWidth.medium;
        return ButtonWidth.large;
    }

    const styleClasses = [
        styles.framedButton,
        props.disabled ? styles.disabled : "",
        props.loading ? styles.loading : ""
    ]

    return(
        <button
            onClick={handleClick}
            disabled={props.disabled}
            className={styleClasses.join(" ")}
        >
            <Frame>
                <span className={styles.content} style={{ width: getWidth() + "px" }} >
                    { props.loading ?
                        <i className={styles.loader} ></i>
                        :
                        <label className={negative(props.text)} >
                            {props.text}
                        </label>
                    }
                    { props.bg &&
                        <div className={styles.bg} ></div>
                    }
                </span>
            </Frame>
        </button>
    )
}

export const IconButton: FC<IconButtonProps> = (props) => {

    const iconName = Object.keys(Icon).find(key => Icon[key as keyof typeof Icon] === props.icon);

    const text = props.text ? props.text : iconName ? iconName[0].toUpperCase() + iconName.slice(1) : "";

    const styleClasses = [
        styles.iconButton,
        "_" + iconName,
        props.decorated ? styles.decorated : "",
        props.deactivated ? styles.deactivated : "",
        props.bg ? styles.bg : "",
        negative(text)

    ]

    return(
        <button
            title={props.text}
            className={styleClasses.join(" ")}
            onClick={props.onClick}
        >
            <i className={getIcon(props.icon)} ></i>
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
                                styleClass = iconStyles.sacrifice;
                                break;
                            case "mana":
                                styleClass = iconStyles.mana;
                                break;
                            default:
                                styleClass = "";
                                break;
                        }

                        return <i key={index} className={styleClass} >&nbsp;&nbsp;&nbsp;</i>;
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
            <span className={styles.hint} >
                <i className="fa-solid fa-question-circle" ></i>
                <p>{formatText(hint)}</p>
            </span>
        )
    }

    return(
        <ul className={styles.multipleOptionsBtnList} >
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