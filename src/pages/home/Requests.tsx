import {FC, useContext, useEffect, useState} from "react";
import {IMatch, ISender} from "../../interfaces.ts";
import {acceptFriendRequest, declineFriendRequest} from "../../api/friend.ts";
import {Friend, getFriendById} from "./FriendsPanel.tsx";
import {ForcedModal} from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {FriendsContext, ModalContext} from "../../Context.tsx";
import {useNavigate} from "react-router-dom";
import {declineMatch, joinMatch} from "../../api/match.ts";

export const FriendRequest: FC<{sender: ISender, onResolve: () => void}> = ({sender, onResolve}) => {

    const [loading, setLoading] = useState(false);
    const { setFriends } = useContext(FriendsContext);

    const addFriend = (friend: Friend) => {
        setFriends(prevState => {
            if (prevState) {
                return {
                    friends: [...prevState.friends, friend],
                    pending: prevState.pending
                }
            } else {
                return prevState;
            }
        });
    }

    const acceptRequest = () => {
        setLoading(true);

        acceptFriendRequest(sender.userId).then(result => {
            if (result.ok) {
                addFriend(sender as Friend);
                onResolve();
            } else {
                setLoading(false);
                alert("An unexpected server error has occurred");
            }
        });
    }

    const declineRequest = () => {
        setLoading(true);

        declineFriendRequest(sender.userId).then(result => {
            if (result.ok) {
                onResolve();
            } else {
                setLoading(false);
                alert("An unexpected server error has occurred");
            }
        });
    }

    return(
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <div className="flex items-end gap-2" >
                    <img className="user-avatar" src={`./avatars/${sender.picture || "1"}.jpg`} alt="" />
                    <h1 className="text-2xl" >{sender.username}</h1>
                </div>
                <div className="text-xl" >
                    wants to be your friend
                </div>
                <div className="hr" ></div>
                <div className="flex gap-4" >
                    <Button
                        text="Decline"
                        onClick={declineRequest}
                        loading={loading}
                    />
                    <Button
                        text="Accept"
                        onClick={acceptRequest}
                        loading={loading}
                    />
                </div>
            </div>
        </ForcedModal>
    );
}

export const GameRequest: FC<{match: IMatch, onResolve: () => void}> = ({match, onResolve}) => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [inviter, setInviter] = useState<Friend>();
    const [searchInterval, setSearchInterval] = useState<number | undefined>();

    const { openInfoModal } = useContext(ModalContext);
    const { friends } = useContext(FriendsContext);

    const acceptRequest = () => {
        setLoading(true);

        if (match) {
            setLoading(true);

            joinMatch(match.key).then(result => {
                if (result.ok) {
                    onResolve();
                    setTimeout(
                        () => navigate("/preparation/" + match.key),
                        10
                    )
                } else {
                    setLoading(false);
                    openInfoModal(
                        <p>
                            The match could not be joined, try again later
                        </p>
                    )
                }
                setLoading(false);
                onResolve();
            });
        }
    }

    const declineRequest = () => {
        if (match) {
            setLoading(true);
            declineMatch(match.key).then(() => {
                onResolve();
            });
        }
    }

    useEffect(() => {
        let interval: number | undefined;

        if (friends && "player1Id" in match) {
            const friend = getFriendById(match.player1Id, friends.friends);
            if (friend) {
                interval = setInterval(() => {
                    setInviter(
                        friend
                    );
                }, 1000);

                setSearchInterval(interval);
            }
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
                <div className="flex items-end gap-2" >
                    <img className="user-avatar" src={`./avatars/${inviter.picture || "1"}.jpg`} alt="" />
                    <h1 className="text-2xl" >{inviter.username}</h1>
                </div>
                <div className="text-xl" >
                    has invited you for a battle
                </div>
                <div className="hr" ></div>
                <div className="flex gap-4" >
                    <Button
                        text="Decline"
                        onClick={declineRequest}
                        loading={loading}
                    />
                    <Button
                        text="Accept"
                        onClick={acceptRequest}
                        loading={loading}
                    />
                </div>
            </div>
        </ForcedModal>
    );
}