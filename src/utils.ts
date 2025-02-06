import {IBattle, IMatch} from "./interfaces.ts";

export const parseTimeLimit = (match: IMatch): number | undefined => {
    const timeLimit = (match.battle as IBattle).timeLimit;

    return timeLimit
        ? timeLimit / 1000 / 60
        : undefined;
}