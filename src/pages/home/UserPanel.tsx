import {FC, useContext} from "react";
import {IconBtnDecoration, IconButton} from "../../components/Button.tsx";
import {AuthContext, ModalContext, UserContext} from "../../Context.tsx";
import ChangeAvatar from "./ChangeAvatar.tsx";
import styles from "./Home.module.css";
import appStyles from "../../styles/App.module.css";

const UserPanel: FC = () => {

    const { openModal } = useContext(ModalContext);
    const { logout } = useContext(AuthContext);
    const { _user } = useContext(UserContext);

    return(
        _user &&
        <div className={styles.userPanel} >
            <div className={styles.userName} >
                <h1 className="min-w-28 text-center" >
                    {_user.username}
                </h1>
            </div>
            <div className={styles.userAvatarContainer} >
                <img className={appStyles.userAvatar} src={`./avatars/${_user.picture}.jpg`} alt="" />
                <IconButton
                    text="Edit"
                    icon="edit"
                    onClick={() => openModal(<ChangeAvatar/>)}
                />
            </div>
            <div className={styles.settings} >
                <IconButton text="Music" icon="music" decorated={IconBtnDecoration.vertical} onClick={() => alert("TODO")} />
                <IconButton text="Sound" icon="sound" decorated={IconBtnDecoration.vertical} onClick={() => alert("TODO")} />
                <IconButton text="Log Out" icon="logout" decorated={IconBtnDecoration.vertical} onClick={logout} />
            </div>
        </div>
    );
}

export default UserPanel;