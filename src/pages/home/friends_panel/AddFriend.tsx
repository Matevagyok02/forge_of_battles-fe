import {FC, useContext, useState} from "react";
import {CustomResponse} from "../../../api/api.ts";
import {sendFriendInvite} from "../../../api/friend.ts";
import {findByUsername} from "../../../api/user.ts";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import {IFriend} from "./FriendsPanel.tsx";
import {ModalContext} from "../../../context.tsx";
import styles from "../../../styles/home_page/FriendsPanel.module.css";
import textInputStyles from "../../../styles/components/textInput.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";

const AddFriend: FC<{ add: (friend: IFriend) => void }> = ({ add }) => {

    const { closeModal } = useContext(ModalContext);

    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<IFriend | null>(null);
    const [inviteResult, setInviteResult] = useState<CustomResponse>();
    const [found, setFound] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const inviteFriend = async () => {
        if (searchResult) {
            setLoading(true);
            sendFriendInvite(searchResult.userId).then(result => {
                if (result.ok) {
                    const invitedFriend = {
                        userId: searchResult.userId,
                        username: searchResult.username,
                        picture: searchResult.picture,
                        status: "pending"
                    }
                    add(invitedFriend);
                }
                setInviteResult(result);
                setLoading(false);
            });
        }
    }

    const findFriend = async () => {
        if (searchQuery.trim()) {
            setLoading(true);

            findByUsername(searchQuery).then(result => {
                if (result.ok && result.body) {
                    setSearchResult(result.body as IFriend);
                    setFound(true);
                } else {
                    setFound(false);
                }
                setLoading(false);
            });
        }
    }

    return (
        <Modal>
            <div className={styles.addFriendPanel}>
                {searchResult && !inviteResult ?
                    <>
                        <div className={styles.searchResult} >
                            <AvatarDisplay avatar={searchResult.picture} />
                            <h1>{searchResult.username}</h1>
                        </div>
                        <div className="hr"></div>
                        <menu>
                            <Button text={"Invite"} onClick={inviteFriend} />
                            <Button text={"Cancel"} onClick={() => setSearchResult(null)} />
                        </menu>
                    </>
                    :
                    inviteResult ?
                        <>
                            {inviteResult.body && "message" in inviteResult.body &&
                                <p>
                                    {inviteResult.body.message}
                                </p>
                            }
                            <div className="hr"></div>
                            <Button text={"Close"} onClick={closeModal} />
                        </>
                        :
                        <>
                            <p>
                                Enter the username of the friend you want to add
                            </p>
                            <menu>
                                <input
                                    className={textInputStyles.textInput}
                                    type={"text"}
                                    placeholder={"Username"}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {!found &&
                                    <p className={styles.error}>
                                        The user you are looking for was not found
                                    </p>
                                }
                                <Button text={"Search"} onClick={findFriend} loading={loading} disabled={!searchQuery.trim()} />
                            </menu>
                        </>
                }
            </div>
        </Modal>
    );
}

export default AddFriend;