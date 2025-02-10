import {FC, useContext} from "react";
import {IconButton} from "../../components/Button.tsx";
import {AuthContext, ModalContext, UserContext} from "../../Context.tsx";
import ChangeAvatar from "./ChangeAvatar.tsx";

const UserPanel: FC = () => {

    const { openModal } = useContext(ModalContext);
    const { logout } = useContext(AuthContext);
    const { _user } = useContext(UserContext);

    return(
        _user &&
        <div className="user-panel" >
            <div className="user-name" >
                <h1 className="min-w-28 text-center" >
                    {_user.username}
                </h1>
            </div>
            <div className="user-avatar-container" >
                <img className="user-avatar" src={`./avatars/${_user.picture}.jpg`} alt="" />
                <IconButton
                    text="Edit"
                    icon="edit"
                    onClick={() => openModal(<ChangeAvatar/>)}
                />
            </div>
            <div className="settings" >
                <IconButton text="Music" icon="music" decorated onClick={() => alert("TODO")} />
                <IconButton text="Sound" icon="sound" decorated onClick={() => alert("TODO")} />
                <IconButton text="Log Out" icon="logout" decorated onClick={logout} />
            </div>
        </div>
    );
}

export default UserPanel;