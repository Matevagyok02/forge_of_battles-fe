import {FC, useContext, useEffect, useState} from "react";
import {IMatch, ISender} from "../../interfaces.ts";
import {IFriend} from "./friends_panel/FriendsPanel.tsx";
import {ForcedModal} from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {FriendsContext, ModalContext} from "../../context.tsx";
import {useNavigate} from "react-router-dom";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import {useResolveFriendRequest, useResolveGameRequest} from "../../api/hooks.tsx";

const Requests: FC<{
    gameReq: IMatch[],
    friendReq: ISender[]
    setGameReq: (req: IMatch[]) => void,
    setFriendReq: (req: ISender[]) => void
}> = ({ gameReq, friendReq, setGameReq, setFriendReq }) => {

    const {openForcedModal, closeForcedModal} = useContext(ModalContext);

    useEffect(() => {
        if (gameReq && gameReq!.length > 0) {
            openForcedModal(
                <GameRequest
                    match={gameReq[0]}
                    onResolve={() => setGameReq(gameReq!.slice(1, gameReq.length - 1))}
                />
            );
        } else if (friendReq && friendReq!.length > 0) {
            openForcedModal(
                <FriendRequest
                    sender={friendReq[0]}
                    onResolve={() => setFriendReq(friendReq.slice(1, friendReq!.length - 1))}
                />
            );
        } else {
            closeForcedModal();
        }
    }, [friendReq, gameReq]);

    return null;
}

const FriendRequest: FC<{ sender: ISender, onResolve: () => void }> = ({sender, onResolve}) => {
    const resolve = useResolveFriendRequest();

    // const addFriend = (friend: IFriend) => {
    //     setFriends(prevState => {
    //         if (prevState) {
    //             return {
    //                 friends: [...prevState.friends, friend],
    //                 pending: prevState.pending
    //             }
    //         } else {
    //             return prevState;
    //         }
    //     });
    // }

    useEffect(() => {
        if (resolve.acceptMutation.isSuccess || resolve.declineMutation.isSuccess) {
            onResolve();
        }
    }, [resolve.acceptMutation.isSuccess, resolve.declineMutation.isSuccess]);

    useEffect(() => {
        if (resolve.declineMutation.isError || resolve.acceptMutation.isError) {
            location.reload();
        }
    }, [resolve.acceptMutation.isError, resolve.declineMutation.isError]);

    return(
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <div className="flex items-end gap-2 h-10" >
                    <AvatarDisplay avatar={sender.picture} />
                    <h1 className="text-2xl" >{sender.username}</h1>
                </div>
                <div className="text-xl" >
                    wants to be your friend
                </div>
                <horizontal-line/>
                <div className="flex gap-4" >
                    <Button
                        text="Decline"
                        onClick={() => resolve.decline(sender.userId)}
                        loading={resolve.declineMutation.isPending}
                        disabled={resolve.declineMutation.isPending || resolve.acceptMutation.isPending}
                    />
                    <Button
                        text="Accept"
                        onClick={() => resolve.accept(sender.userId)}
                        loading={resolve.acceptMutation.isPending}
                        disabled={resolve.declineMutation.isPending || resolve.acceptMutation.isPending}
                    />
                </div>
            </div>
        </ForcedModal>
    );
}

const GameRequest: FC<{match: IMatch, onResolve: () => void}> = ({match, onResolve}) => {

    const navigate = useNavigate();
    const [inviter, setInviter] = useState<IFriend>();
    const [searchInterval, setSearchInterval] = useState<number | undefined>();

    const { openInfoModal } = useContext(ModalContext);
    const { getFriendById } = useContext(FriendsContext);

    const resolve = useResolveGameRequest();

    useEffect(() => {
        if (resolve.acceptMutation.isSuccess) {
            setTimeout(
                () => navigate("/preparation/" + match.key),
                10
            )
        }
    }, [resolve.acceptMutation.isSuccess]);

    useEffect(() => {
        if (resolve.acceptMutation.isError) {
            openInfoModal(
                <p>
                    The match could not be joined, try again later
                </p>
            )
        }
    }, [resolve.acceptMutation.isError]);

    useEffect(() => {
        if (
            resolve.declineMutation.isSuccess ||
            resolve.declineMutation.isError ||
            resolve.acceptMutation.isSuccess ||
            resolve.acceptMutation.isError
        ) {
            onResolve();
        }
    }, [
        resolve.declineMutation.isSuccess,
        resolve.acceptMutation.isSuccess,
        resolve.declineMutation.isError,
        resolve.declineMutation.isError
    ]);

    useEffect(() => {
        let interval: number | undefined;

        const friend = getFriendById(match.player1Id);
        if (friend) {
            interval = setInterval(() => {
                setInviter(
                    friend
                );
            }, 1000);

            setSearchInterval(interval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        }
    }, []);

    useEffect(() => {
        if (inviter && searchInterval) {
            clearInterval(searchInterval);
        }
    }, [inviter]);

    return(
        inviter &&
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <div className="flex items-end gap-2 h-10" >
                    <AvatarDisplay avatar={inviter.picture} />
                    <h1 className="text-2xl" >{inviter.username}</h1>
                </div>
                <div className="text-xl" >
                    has invited you for a battle
                </div>
                <horizontal-line/>
                <div className="flex gap-4" >
                    <Button
                        text={"Decline"}
                        onClick={() => resolve.decline(match.key)}
                        loading={resolve.declineMutation.isPending}
                        disabled={resolve.declineMutation.isPending || resolve.acceptMutation.isPending}
                    />
                    <Button
                        text={"Accept"}
                        onClick={() => resolve.accept(match.key)}
                        loading={resolve.acceptMutation.isPending}
                        disabled={resolve.declineMutation.isPending || resolve.acceptMutation.isPending}
                    />
                </div>
            </div>
        </ForcedModal>
    );
}

export default Requests;