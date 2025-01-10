import {customFetch} from "./api.ts";

export const getMatchByKey = async (key: string) =>
    await customFetch(
        "/match?key=" + key
    );

export const findPlayerById = async (id: string) =>
    await customFetch(
        "/user/find?id=" + id
    );