import {customFetch, HttpMethod} from "./api.ts";

const namespace = "/match";

export const createGame = async (timeLimit?: number, invite?: string) => {

    let query;

    query = timeLimit || invite ? "?" : "";
    query += timeLimit ? `timeLimit=${timeLimit}` : "";
    query += timeLimit && invite ? "&" : "";
    query += invite ? `invite=${invite}` : "";

    return await customFetch(
        namespace + "/create" + query,
        HttpMethod.post,
    );
}

export const getLastCreatedGame = async () =>
    await customFetch(
        namespace + "/last-created"
    );

export const abandonMatch = async (key: string) =>
    await customFetch(
        namespace + "/abandon?key=" + key,
        HttpMethod.delete
    );

export const declineMatch = async (key: string) =>
    await customFetch(
        namespace + "/decline?key=" + key,
        HttpMethod.delete
    );

export const joinMatch = async (key: string) =>
    await customFetch(
        namespace + "/join?key=" + key,
        HttpMethod.put
    );

export const getActiveMatch = async () =>
    await customFetch(
        namespace + "/active"
    );

export const getMatchByKey = async (key: string) =>
    await customFetch(
        namespace + "?key=" + key
    );

export const leaveMatch = async () =>
    await customFetch(
        namespace + "/leave",
        HttpMethod.delete
    );

export const joinQueue = async () =>
    await customFetch(
        namespace + "/random",
        HttpMethod.put
    );

export const leaveQueue = async () =>
    await customFetch(
        namespace + "/leave-random",
        HttpMethod.delete
    );