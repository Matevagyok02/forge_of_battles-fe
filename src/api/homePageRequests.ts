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

