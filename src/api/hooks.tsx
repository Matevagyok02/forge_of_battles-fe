import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryResult
} from "@tanstack/react-query";
import {
    changePicture,
    getActiveMatches,
    ActiveMatchesResponse,
    getAllUsernames,
    getUser,
    registerUser,
    findByUsername,
    sendFriendRequest,
    MessageResponse,
    OnlineFriend,
    getOnlineFriends,
    UnseenMessage,
    getUnseenMsg,
    acceptFriendRequest,
    declineFriendRequest,
    joinGame,
    declineGame,
    findUserById,
    joinQueue,
    leaveQueue,
    leaveMatch,
    abandonMatch,
    createMatch,
    MatchCrereationParams,
    getChatMessages,
    sendChatMessage,
    ChatMessageParams, addCard, getCardsByDeck
} from "./api.ts";
import {AxiosError, AxiosResponse} from "axios";
import {ICard, IMatch, IUser} from "../interfaces.ts";
import {IFriend} from "../pages/home/friends_panel/FriendsPanel.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {Message} from "../pages/home/chat/ChatTab.tsx";

export const invalidateQuery = async (queryClient: QueryClient, keys: string[]) => {
    await queryClient.invalidateQueries({ queryKey: keys });
}

type DefaultError = AxiosError<MessageResponse>;

type QueryRes<T> = UseQueryResult<AxiosResponse<T>, DefaultError>;

const defaultQueryOptions = {
    refetchOnWindowFocus: false,
    retry: false
}

export const useUser = (): QueryRes<{ user: IUser, friends: IFriend[] }> => useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: useAuth0().isAuthenticated,
    ...defaultQueryOptions
});

export const useUsernames = (): QueryRes<string[]> => useQuery({
    queryKey: ["usernames"],
    queryFn: getAllUsernames,
    ...defaultQueryOptions
});

export const useRegistration = () => {
    const queryClient = useQueryClient();
    type RegistrationData = { username: string, picture: string };

    const registration = useMutation<AxiosResponse<MessageResponse>, DefaultError, RegistrationData>({
        mutationFn: registerUser
    });

    const register = (data: RegistrationData) => {
        registration.mutate(data);
    }

    const finish = async () => {
        await invalidateQuery(queryClient, ["user"]);
    }

    return {
        ...registration,
        register,
        finish
    }
}

export const useChangeAvatar = () => {
    const queryClient = useQueryClient();

    const avatarChange = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: changePicture,
        onSuccess: () => invalidateQuery(queryClient, ["user"]),
    });

    const change = (id: string) => {
        avatarChange.mutate(id);
    }

    return {
        ...avatarChange,
        change
    }
}

export const useUserByUsername = (query: string): QueryRes<IFriend> => useQuery({
    queryKey: ["user", query],
    queryFn: () => findByUsername(query),
    enabled: false,
    ...defaultQueryOptions
});

export const useUserById = (id?: string): QueryRes<IUser> => useQuery({
    queryKey: ["opponent", id],
    queryFn: () => findUserById(id!),
    enabled: !!id,
    ...defaultQueryOptions
});

export const useActiveMatches = (): QueryRes<ActiveMatchesResponse> => useQuery({
    queryKey: ["activeMatches"],
    queryFn: getActiveMatches,
    enabled: useAuth0().isAuthenticated,
    ...defaultQueryOptions
});

export const useSendFriendRequest = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: sendFriendRequest,
        onSuccess: () => invalidateQuery(queryClient, ["user"]),
    });

    const sendRequest = (id: string) => {
        mutation.mutate(id);
    }

    return {
        ...mutation,
        sendRequest
    }
}

export const useResolveFriendRequest = () => {
    const queryClient = useQueryClient();

    const acceptMutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: acceptFriendRequest,
        onSuccess: () => invalidateQuery(queryClient, ["user"]),
    });

    const declineMutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: declineFriendRequest,
        onSuccess: () => invalidateQuery(queryClient, ["user"]),
    });

    const accept = (id: string) => {
        acceptMutation.mutate(id);
    }

    const decline = (id: string) => {
        declineMutation.mutate(id);
    }

    return {
        acceptMutation,
        declineMutation,
        accept,
        decline
    }
}

export const useOnlineFriends = (): QueryRes<OnlineFriend[]> => useQuery({
    queryKey: ["onlineFriends"],
    queryFn: getOnlineFriends,
    enabled: useAuth0().isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...defaultQueryOptions
});

export const useUnseenMessages = (): QueryRes<UnseenMessage[]> =>  useQuery({
    queryKey: ["unseenMessages"],
    queryFn: getUnseenMsg,
    enabled: useAuth0().isAuthenticated,
    ...defaultQueryOptions
});

export const useChatMessages = (id: string): QueryRes<Message[]> => useQuery({
    queryKey: ["chat", id],
    queryFn: () => getChatMessages(id),
    enabled: false,
    ...defaultQueryOptions
});

export const useSendChatMessage = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, ChatMessageParams>({
        mutationFn: sendChatMessage
    });

    const send = (to: string, text: string) => {
        mutation.mutate({ to, text });
    }

    return {
        ...mutation,
        send
    }
}

export const useResolveGameRequest = () => {
    const acceptMutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: joinGame
    });

    const declineMutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: declineGame
    });

    const accept = (id: string) => {
        acceptMutation.mutate(id);
    }

    const decline = (id: string) => {
        declineMutation.mutate(id);
    }

    return {
        acceptMutation,
        declineMutation,
        accept,
        decline
    }
}

export const useJoinGame = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: joinGame,
    });

    const join = (id: string) => {
        mutation.mutate(id);
    }

    return {
        ...mutation,
        join
    }
}

export const useJoinRandomGame = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError>({
        mutationFn: joinQueue
    });

    const join = () => {
        mutation.mutate();
    }

    return {
        ...mutation,
        join
    }
}

export const useLeaveRandomGame = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError>({
        mutationFn: leaveQueue
    });

    const leave = () => {
        mutation.mutate();
    }

    return {
        ...mutation,
        leave
    }
}

export const useCreateMatch = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<AxiosResponse<IMatch>, DefaultError, MatchCrereationParams>({
        mutationFn: createMatch,
        onSuccess: () => invalidateQuery(queryClient, ["activeMatches"])
    });

    const create = (timeLimit?: number, invite?: string) => {
        mutation.mutate({ timeLimit, invite });
    }

    return {
        ...mutation,
        create
    }
}

export const useLeaveMatch = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError>({
        mutationFn: leaveMatch
    });

    const leave = () => {
        mutation.mutate();
    }

    return {
        ...mutation,
        leave
    }
}

export const useAbandonMatch = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, string>({
        mutationFn: abandonMatch
    });

    const abandon = (key: string) => {
        mutation.mutate(key);
    }

    return {
        ...mutation,
        abandon
    }
}

export const useAddCard = () => {
    const mutation = useMutation<AxiosResponse<MessageResponse>, DefaultError, ICard>({
        mutationFn: addCard,
    });

    const add = (card: ICard) => {
        mutation.mutate(card);
    }

    return {
        ...mutation,
        add
    }
}

export const useCardByDeck = (deck: string): QueryRes<ICard[]> => useQuery({
    queryKey: ["cards", deck],
    queryFn: () => getCardsByDeck(deck)
});