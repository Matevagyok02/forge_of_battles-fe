import {customFetch} from "./api.ts";
const namespace = "/chat";

export const getUnseenMsg = async () =>
    await customFetch(
        namespace + "/unseen"
    );



export const getChatMessages = async (id: string) =>
    await customFetch(
        namespace + "?from=" + id
    );

export const sendChatMessage = async (id: string, text: string) =>
    await customFetch(
        namespace + "?to=" + id,
        "POST",
        {to: id, text: text}
    );