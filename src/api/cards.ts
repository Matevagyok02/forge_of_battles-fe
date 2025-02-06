import {customFetch} from "./api.ts";
const namespace = "/cards";

export const addCard = async (card: object) =>
    await customFetch(
        namespace,
        "POST",
        card
    );