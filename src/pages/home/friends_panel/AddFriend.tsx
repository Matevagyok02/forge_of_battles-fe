import {FC, useContext, useEffect, useState} from "react";
import Modal from "../../../components/Modal.tsx";
import {Button} from "../../../components/Button.tsx";
import {IFriend} from "./FriendsPanel.tsx";
import {ModalContext} from "../../../context.tsx";
import styles from "../../../styles/home_page/FriendsPanel.module.css";
import textInputStyles from "../../../styles/components/textInput.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";
import {useSendFriendRequest, useUserByUsername} from "../../../api/hooks.tsx";

const AddFriend: FC = () => {

    const { closeModal } = useContext(ModalContext);

    const [inviteResult, setInviteResult] = useState<string>();
    const [searchResult, setSearchResult] = useState<IFriend | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUserByUsername = useUserByUsername(searchQuery);
    const request = useSendFriendRequest();

    const sendInvite = async () => {
        if (searchResult) {
            request.sendRequest(searchResult.userId);
        }
    }

    useEffect(() => {
        if (fetchUserByUsername.isSuccess) {
            setSearchResult(fetchUserByUsername.data.data);
        }
    }, [fetchUserByUsername.data]);

    useEffect(() => {
        if (request.isSuccess) {
            setInviteResult(request.data?.data.message);
        }
    }, [request.isSuccess]);

    useEffect(() => {
        if (request.error) {
            setInviteResult(request.error.response?.data.message);
        }
    }, [request.isError]);

    const search = async () => {
        await fetchUserByUsername.refetch();
    }

    return (
        <Modal>
            <div className={styles.addFriendPanel}>
                { searchResult && (request.isPending || request.isIdle) ?
                    <>
                        <div className={styles.searchResult} >
                            <AvatarDisplay avatar={searchResult.picture} />
                            <h1>{searchResult.username}</h1>
                        </div>
                        <horizontal-line/>
                        <menu>
                            <Button text={"Invite"} loading={request.isPending} onClick={sendInvite} />
                            <Button text={"Cancel"} onClick={() => setSearchResult(null)} />
                        </menu>
                    </>
                    :
                    inviteResult ?
                        <>
                            <p className={ request.isError ? styles.error : "" } >
                                {inviteResult}
                            </p>
                            <horizontal-line/>
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
                                {fetchUserByUsername.isError &&
                                    <p className={styles.error}>
                                        The user you are looking for was not found
                                    </p>
                                }
                                <Button
                                    text={"Search"}
                                    onClick={search}
                                    loading={fetchUserByUsername.isLoading}
                                    disabled={!searchQuery.trim()}
                                />
                            </menu>
                        </>
                }
            </div>
        </Modal>
    );
}

export default AddFriend;