import {FC, useContext} from "react";
import {IUser} from "../../interfaces.ts";
import {IconButton} from "../../components/Button.tsx";
import {AuthContext, ModalContext, UserContext} from "../../Context.tsx";
import ChangeAvatar from "./ChangeAvatar.tsx";

const UserPanel: FC = () => {

    const { openModal } = useContext(ModalContext);
    const { logout } = useContext(AuthContext);
    const user: IUser | undefined = useContext(UserContext)._user;

    return(
        user &&
        <div className="user-panel" >
            <div className="user-name" >
                <h1 className="min-w-28 text-center" >
                    {user.username}
                </h1>
            </div>
            <div className="user-avatar-container" >
                <img src={`./avatars/${user.picture}.jpg`} alt="" />
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