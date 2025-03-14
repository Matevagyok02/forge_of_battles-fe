import {customFetch, HttpMethod} from "./api.ts";
const namespace = "/friend";

export const getOnlineFriends = async () =>
    await customFetch(
        namespace + "/online"
    );

export const sendFriendInvite = async (id: string) =>
    await customFetch(
        namespace + "/request?to=" + id,
        HttpMethod.post
    );

export const acceptFriendRequest = async (id: string) =>
    await customFetch(
        namespace + "/accept?from=" + id,
        HttpMethod.put
    );

export const declineFriendRequest = async (id: string) =>
    await customFetch(
        namespace + "/decline?from=" + id,
        HttpMethod.delete
    );