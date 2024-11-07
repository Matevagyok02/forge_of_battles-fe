import {FC, memo, useEffect, useState} from "react";
import {Button, IconButton} from "./Button.tsx";
import {findFriendByUsername, getOnlineFriends, getUnseenMsg, sendFriendInvite} from "../api/homePageRequests.ts";
import Modal from "./Modal.tsx";
import {CustomResponse} from "../api/api.ts";

export interface Friends {
    friends: Friend[];
    pending: Friend[];
}

export interface Friend {
    userId: string;
    username: string;
    picture?: string;
    status?: string;
    unseenMessage?: boolean;
}

const FriendsPanel: FC<{ friends: Friends, modalSetter: any }> = memo(({friends, modalSetter}) => {

    const [open, setOpen] = useState(false);
    const [friendList, setFriendList] = useState<Friend[]>([]);
    const [pendingList, setPendingList] = useState<Friend[]>([]);

    const ListedFriend: FC<Friend> = ((friend) => {

        return(
            <li key={friend.userId} className={`friend ${friend.status}`} >
                <div className={`user-avatar-container ${friend.unseenMessage ? "unseen-msg" : ""}`}>
                    <div className="status-indicator" title={friend.status}></div>
                    <img src={`./avatars/${friend.picture || "1"}.jpg`} alt=""/>
                </div>
                <div>
                    <h1 className="px-2">
                        {friend.username}
                    </h1>
                    <div className="flex mt-1 ml-2 relative" >
                        <small className="status-title" >
                            {friend.status}
                        </small>
                        { friend.status !== "pending" &&
                            <div className="friend-options" >
                                <IconButton text="Message" icon="message" onClick={() => alert("TODO")} />
                                <IconButton text="Invite" icon="add" onClick={() => alert("TODO")} />
                                <IconButton text="Remove" icon="remove" onClick={() => alert("TODO")} />
                            </div>
                        }
                    </div>
                </div>
            </li>
        )
    });

    const AddFriend = () => {

        const [loading, setLoading] = useState(false);
        const [searchResult, setSearchResult] = useState<Friend>();
        const [inviteResult, setInviteResult] = useState<CustomResponse>();
        const [found, setFound] = useState(true);
        const [searchQuery, setSearchQuery] = useState("");

        const inviteFriend = async () => {
            if (searchResult) {
                setLoading(true);
                sendFriendInvite(searchResult.userId).then(result => {
                    setInviteResult(result);

                    if(result.ok) {
                        const invitedFriend = {
                            userId: searchResult.userId,
                            username: searchResult.username,
                            picture: searchResult.picture,
                            status: "pending"
                        }

                        setPendingList([...pendingList, invitedFriend]);
                    }
                });
            }
        }

        const findFriend = async () => {
            if (searchQuery) {
                setLoading(true);
                findFriendByUsername(searchQuery).then(result => {
                    if (result.ok && result.body) {
                        setSearchResult(result.body as Friend);
                        setFound(true);
                    } else {
                        setFound(false);
                    }
                    setLoading(false);
                });
            }
        }

        return(
            <Modal close={() => modalSetter(null)} >
                <div className="flex flex-col gap-4 p-5 items-center w-fit" >
                    { searchResult ?
                        <>
                            <div className="flex items-end gap-2" >
                                <img src={`./avatars/${searchResult.picture || "1"}.jpg`} alt="" />
                                <h1 className="text-2xl" >{searchResult.username}</h1>
                            </div>
                            <div className="hr" ></div>
                            <div className="flex gap-4" >
                                <Button text="Back" onClick={() => setSearchResult(undefined)} />
                                <Button text="Invite" onClick={inviteFriend} />
                            </div>
                        </>
                        :
                        <>
                            { inviteResult ?
                                <>
                                    { inviteResult.body && "message" in inviteResult.body &&
                                        <p className={`text-center max-w-80 px-4 ${inviteResult.ok ? "" : "error-text"}`} >
                                            {inviteResult.body.message}
                                        </p>
                                    }
                                    <div className="hr" ></div>
                                    <Button text={"Close"} onClick={() => modalSetter(null)} />
                                </>
                                :
                                <>
                                    <p className="text-center px-4" >
                                        Enter the username of the friend you want to add
                                    </p>
                                    <div className="hr" ></div>
                                    { !found &&
                                        <p className="error-text text-sm text-center px-4" >
                                            The user you are looking for was not found
                                        </p>
                                    }
                                    <div className="flex gap-4 items-center" >
                                        <input
                                            className=""
                                            type="text"
                                            placeholder="Friend Username"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Button text="Search" onClick={findFriend} loading={loading} />
                                    </div>
                                </>
                            }
                        </>
                    }
                </div>
            </Modal>
        );
    }

    const getOnlineFriendsAndUnseenMsg = async (friends: Friend[]) => {
        const onlineFriends = await getOnlineFriends();
        const unseenMessages = await getUnseenMsg();
        const tempFriendList = friends;

        tempFriendList.forEach(friend => {
            friend.status = "offline";
        });

        if (
            onlineFriends.ok &&
            typeof onlineFriends.body === "object" &&
            "onlineFriends" in onlineFriends.body &&
            Array.isArray(onlineFriends.body.onlineFriends)
        ) {
            onlineFriends.body.onlineFriends.forEach(friend => {
                tempFriendList[friends.findIndex(entry => entry.userId === friend.userId)].status =
                    friend["busy"] ? "busy" : "online";
            });
        }

        if (unseenMessages.ok
            && typeof unseenMessages.body === "object"
            && Array.isArray(unseenMessages.body)
        ) {
            unseenMessages.body.forEach(friend => {
                tempFriendList[tempFriendList.findIndex(entry => entry.userId === friend["otherUserId"][0].userId)].unseenMessage = true;
            });
        }

        setFriendList(tempFriendList);
    }

    useEffect(() => {
        if (friends && friends.friends.length > 0) {
            getOnlineFriendsAndUnseenMsg(friends.friends);
        }
        setPendingList(friends.pending);
    }, [friends]);

    const handlePanelOpenClick = () => {
        if (friendList.length < 1 && friends.pending.length < 1) {
            modalSetter(<AddFriend/>);
        } else {
            setOpen(!open);
        }
    }

    return(
        <div className={`friends-panel-container ${open ? "friends-open" : "friends-closed"}`} >
            <IconButton text="Friends" icon="friends" decorated onClick={handlePanelOpenClick} />
            <div className="friends-panel">
                <div className="friends-panel-frame" ></div>
                <div className="friends-panel-content" >
                    <div className="flex w-full justify-center" >
                    </div>
                    <ul>
                        {friendList && friendList.map(friend =>
                            <ListedFriend
                                userId={friend.userId}
                                username={friend.username}
                                picture={friend.picture}
                                status={friend.status}
                                unseenMessage={friend.unseenMessage}
                                key={friend.userId}
                            />
                        )}
                        {pendingList.map(friend =>
                            <ListedFriend
                                userId={friend.userId}
                                username={friend.username}
                                picture={friend.picture}
                                status="pending"
                                key={friend.userId}
                            />
                        )}
                    </ul>
                    <div className="flex w-full justify-center items-center p-2" >
                        <Button text="+ Friend" onClick={() => modalSetter(<AddFriend/>)} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FriendsPanel;