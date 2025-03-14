import {IBattle, IMatch} from "./interfaces.ts";
import {CSSProperties} from "react";

export const parseTimeLimit = (match: IMatch): number | undefined => {
    const timeLimit = (match.battle as IBattle).timeLimit;

    return timeLimit
        ? timeLimit / 1000 / 60
        : undefined;
}

export const parseElementRectStyles = (element: Element): CSSProperties => {
    const rect = element.getBoundingClientRect();

    return {
        position: "fixed",
        top: rect.top + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        height: rect.height + "px"
    } as CSSProperties;
}