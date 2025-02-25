import {customFetch} from "./api.ts";
const namespace = "/cards";

export const addCard = async (card: object) =>
    await customFetch(
        namespace + "/add",
        "POST",
        card
    );

export const getCardsById = async (ids: string[]) =>
    await customFetch(
        namespace + "?cards=" + ids.join(",")
    );