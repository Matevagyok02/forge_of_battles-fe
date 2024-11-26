import {createContext, Dispatch, ReactElement, SetStateAction} from "react";
import {IUser} from "./interfaces.ts";
import {User} from "@auth0/auth0-react";
import {Friends} from "./pages/home/FriendsPanel.tsx";

export interface IModalContext {
    openInfoModal: (content: ReactElement) => void;
    closeInfoModal: (index: number) => void;
    openedModal: ReactElement | null;
    openModal: (value: ReactElement) => void;
    closeModal: () => void;
    openedForcedModal: ReactElement | null;
    openForcedModal: (value: ReactElement) => void;
    closeForcedModal: () => void;
}

export interface IAuthContext {
    user?: User;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

export interface IUserContext {
    _user?: IUser;
    setUser: (value: IUser | ((prevState: IUser | undefined) => IUser | undefined)) => void;
}

export interface IFriendsContext {
    friends: Friends;
    setFriends: Dispatch<SetStateAction<Friends>>;
}

export const ModalContext = createContext<IModalContext>({} as IModalContext);

export const AuthContext = createContext({} as IAuthContext);

export const UserContext = createContext({} as IUserContext);

export const FriendsContext = createContext({} as IFriendsContext);