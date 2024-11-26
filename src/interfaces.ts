import {Friend} from "./pages/home/FriendsPanel.tsx";

export interface IUserResponseBody {
    user: IUser;
    friends: Friend[];
}

export interface IFriendRequest {
    fromId: string;
    toId: string;
    userProps: { username: string, picture?: string };
}

export interface IReceiver {
    userId: string;
    username: string;
    picture?: string;
    status: string;
    unseenMessage: boolean;
}

export interface ISender {
    userId: string;
    username: string;
    picture?: string;
}

export interface IMatch {
    key: string;
    player1Id: string;
    player2Id: string;
    battle: object;
    randomMatch: boolean;
    started: boolean;
}

export interface IUser {
    userId: string;
    username: string;
    picture: string;
    friends: string[];
    requests: IFriendRequest[];
}
