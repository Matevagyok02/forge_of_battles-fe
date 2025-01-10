import {customFetch} from "./api.ts";

export const getUser = async () =>
    await customFetch(
        "/user"
    );

export const getOnlineFriends = async () =>
    await customFetch(
        "/friend/online"
    );

export const getUnseenMsg = async () =>
    await customFetch(
        "/chat/unseen"
    );

export const findFriendByUsername = async (username: string) =>
    await customFetch(
        "/user/find?username=" + username
    );

export const sendFriendInvite = async (id: string) =>
    await customFetch(
        "/friend/request?to=" + id,
        "POST"
    );

export const changePicture = async (id: string) =>
    await customFetch(
        "/user/picture?id=" + id,
        "PUT"
    );

export const registerNewUser = async (username: string, picture?: string) =>
    await customFetch(
        "/user/register",
        "POST",
        {username, picture}
    );

export const acceptFriendRequest = async (id: string) =>
    await customFetch(
        "/friend/accept?from=" + id,
        "PUT"
    );

export const declineFriendRequest = async (id: string) =>
    await customFetch(
        "/friend/decline?from=" + id,
        "DELETE"
    );

export const getChatMessages = async (id: string) =>
    await customFetch(
        "/chat?from=" + id
    );

export const sendChatMessage = async (id: string, text: string) =>
    await customFetch(
        "/chat?to=" + id,
        "POST",
        {to: id, text: text}
    );

export const createGame = async (timeLimit?: number, invite?: string) => {

    let query;

    query = timeLimit || invite ? "?" : "";
    query += timeLimit ? `timeLimit=${timeLimit}` : "";
    query += timeLimit && invite ? "&" : "";
    query += invite ? `invite=${invite}` : "";

    return await customFetch(
        "/match/create" + query,
        "POST",
    );
}

export const getLastCreatedGame = async () =>
    await customFetch(
        "/match/last-created"
    );

export const abandonMatch = async (key: string) =>
    await customFetch(
        "/match/abandon?key=" + key,
        "DELETE"
    );

export const declineMatch = async (key: string) =>
    await customFetch(
        "/match/decline?key=" + key,
        "DELETE"
    );

export const joinMatch = async (key: string) =>
    await customFetch(
        "/match/join?key=" + key,
        "PUT"
    );

export const getActiveMatches = async () =>
    await customFetch(
        "/match"
    );

