import {customFetch, HttpMethod} from "./api.ts";
const namespace = "/cards";

export const addCard = async (card: object) =>
    await customFetch(
        namespace + "/add",
        HttpMethod.post,
        card
    );

export const getCardsById = async (ids: string[]) =>
    await customFetch(
        namespace + "?cards=" + ids.join(",")
    );