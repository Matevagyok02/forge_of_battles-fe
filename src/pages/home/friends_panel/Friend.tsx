import {FC, useContext} from "react";
import {getIcon, Icon, IconButton} from "../../../components/Button.tsx";
import CreateGame from "../main_interface_components/CreateGame.tsx";
import {FriendStatus, IFriend} from "./FriendsPanel.tsx";
import {ModalContext} from "../../../context.tsx";
import styles from "../../../styles/home_page/FriendsPanel.module.css";
import AvatarDisplay from "../../../components/AvatarDisplay.tsx";

const Friend: FC<{ friend: IFriend, openChat?: () => void, removeUnseenMsg?: () => void }> = ({ friend, openChat, removeUnseenMsg }) => {

    const { openModal } = useContext(ModalContext);

    const openChatWithFriend = () => {
        if (friend.status !== FriendStatus.pending && removeUnseenMsg && openChat) {
            removeUnseenMsg();
            openChat();
        }
    }

    return (
        <li
            className={styles.friend}
            data-value={friend.status}
            onClick={openChatWithFriend}
        >
            <div>
                <i className={styles.statusIndicator} title={friend.status} ></i>
                <AvatarDisplay avatar={friend.picture} />
            </div>
            <div>
                <h1>
                    {friend.username}
                </h1>
                <div>
                    <h1 className={styles.status} >
                        {friend.status}
                    </h1>
                    {friend.status !== FriendStatus.pending &&
                        <menu className={styles.menu} >
                            <IconButton icon={Icon.message} onClick={openChatWithFriend} />
                            { friend.status === FriendStatus.online &&
                                <IconButton
                                    text={"Invite"}
                                    icon={Icon.add}
                                    onClick={() => openModal(<CreateGame friend={friend} />)}
                                />
                            }
                        </menu>
                    }
                </div>
            </div>
            { friend.unseenMessage &&
                <div className={styles.message} >
                    <i className={getIcon(Icon.unseenMessage)} ></i>
                </div>
            }
        </li>
    )
}

export default Friend;