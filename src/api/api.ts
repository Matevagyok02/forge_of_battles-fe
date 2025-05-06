import axios, {AxiosError, AxiosResponse} from "axios";
import {ICard, IMatch, IUser} from "../interfaces.ts";
import {IFriend} from "../pages/home/friends_panel/FriendsPanel.tsx";
import {Message} from "../pages/home/chat/ChatTab.tsx";

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: AxiosError
    }
}

export interface MessageResponse {
    message: string;
}
export interface ActiveMatchesResponse {
    created: IMatch | null;
    active: IMatch | null;
    inQueue: boolean;
}
export interface OnlineFriend {
    userId: string;
    busy: boolean;
}
export interface UnseenMessage {
    userId: string;
    lastSeenAt: Date;
}

export type R<T> = Promise<AxiosResponse<T, any>>;

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const getUser = (): R<{ user: IUser, friends: IFriend[] }> => api.get("/user");
export const getAllUsernames = (): R<string[]> => api.get("/user/usernames");
export const registerUser = (data: { username: string, picture: string }): R<MessageResponse> => api.post("/user/register", data);
export const changePicture = (id: string): R<MessageResponse> => api.put("/user/picture?id=" + id);
export const findByUsername = async (username: string): R<IFriend> => api.get("/user/find?username=" + username);
export const findUserById = (id: string): R<IUser> => api.get("/user/find?id=" + id);
export const getActiveMatches = (): R<ActiveMatchesResponse> => api.get("/match/active");
export const sendFriendRequest = (to: string): R<MessageResponse> => api.post("/friend/request", null, {
    params: {
        to
    }
});
export const acceptFriendRequest = (from: string): R<MessageResponse> => api.put("/friend/accept", null, {
    params: {
        from
    }
});
export const declineFriendRequest = (from: string): R<MessageResponse> => api.delete("/friend/decline", {
    params: {
        from
    }
});
export const getOnlineFriends = (): R<OnlineFriend[]> => api.get("/friend/online");
export const getUnseenMsg = (): R<UnseenMessage[]> => api.get("/chat/unseen");
export const getChatMessages = (from: string): R<Message[]> => api.get("/chat", {
    params: {
        from
    }
});
export interface ChatMessageParams {
    to: string;
    text: string;
}
export const sendChatMessage = (data: ChatMessageParams): R<MessageResponse> => api.post("/chat", data);
export const joinGame = (key: string): R<MessageResponse> => api.put("/match/join", null, {
    params: {
        key
    }
});
export const declineGame = (key: string): R<MessageResponse> => api.delete("/match/decline", {
    params: {
        key
    }
});
export const joinQueue = (): R<MessageResponse> => api.put("/match/random");
export const leaveQueue = (): R<MessageResponse> => api.delete("/match/leave-random");
export interface MatchCrereationParams {
    timeLimit?: number;
    invite?: string;
}
export const createMatch = (params: MatchCrereationParams ): R<IMatch> => api.post("/match/create", null,{
    params: {
        timeLimit: params.timeLimit,
        invite: params.invite
    }
});
export const leaveMatch = (): R<MessageResponse> => api.delete("/match/leave");
export const abandonMatch = (key: string): R<MessageResponse> => api.delete("/match/abandon", {
    params: {
        key
    }
});

export const isMatchAbandoned = (key: string): R<{ isAbandoned: boolean }> => api.get("/match/is-abandoned", {
    params: {
        key
    }
});

export const getCardsById = (ids: string[]): R<ICard[]> => api.get("/cards", {
    params: {
        cards: ids.join(",")
    }
});

export const addCard = (card: ICard): R<MessageResponse> => api.post("/cards/add", card);

export const getCardsByDeck = (deck: string) => api.get<ICard[]>("/cards", {
    params: {
        deck
    }
});