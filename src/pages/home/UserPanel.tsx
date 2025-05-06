import {FC, useContext, useState} from "react";
import {Button, Icon, IconButton} from "../../components/Button.tsx";
import {AuthContext, ModalContext, UserContext} from "../../context.tsx";
import styles from "../../styles/home_page/UserPanel.module.css";
import avatars from "../../assets/avatars/avatars.ts";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import Modal from "../../components/Modal.tsx";
import {useChangeAvatar} from "../../api/hooks.tsx";
import {MusicVolumeControl} from "../../components/BgMusic.tsx";

export const AuthPanel: FC = () => {

    const { isAuthenticated, login } = useContext(AuthContext);

    return(
        <div className={styles.authPanel} >
            { !isAuthenticated &&
                <>
                    <Button bg text={"Log In"} onClick={login} />
                    <Button bg text={"Register"} onClick={login} />
                </>
            }
            <menu>
                <MusicVolumeControl />
                {/*<IconButton bg icon={Icon.sound} decorated onClick={() => alert("TODO")} />*/}
            </menu>
        </div>
    );
}

export const UserPanel: FC = () => {

    const { openModal } = useContext(ModalContext);
    const { logout } = useContext(AuthContext);
    const { _user } = useContext(UserContext);

    return(
        _user &&
        <div className={styles.userPanel} >
            <div className={styles.name} >
                <h1>{_user.username}</h1>
            </div>
            <div className={styles.avatar} >
                <AvatarDisplay avatar={_user.picture} />
                <div className={styles.changeAvatarBtn} >
                    <IconButton icon={Icon.edit} text={"Change Avatar"} onClick={() => openModal(<ChangeAvatar/>)} />
                </div>
            </div>
            <menu>
                <MusicVolumeControl />
                {/*<IconButton icon={Icon.sound} text={"Sounds"} bg decorated onClick={() => alert("TODO")} />*/}
                <IconButton icon={Icon.logout} text={"Log Out"} bg decorated onClick={logout} />
            </menu>
        </div>
    );
}

const ChangeAvatar: FC = () => {

    const { _user } = useContext(UserContext);
    const [selected, setSelected] = useState<string>(_user?.picture || "");
    const { closeModal } = useContext(ModalContext);

    const avatarChange = useChangeAvatar();

    const change = async () => {
        if (selected !== _user?.picture) {
            avatarChange.change(selected);
        }
    }

    return(
        <Modal>
            <div className={styles.changeAvatar} >
                { avatarChange.isPending || avatarChange.isIdle ?
                    <>
                        <ul>
                            { Object.keys(avatars).map(avatar =>
                                <li
                                    key={avatar}
                                    onClick={() => setSelected(avatar)}
                                    className={selected === avatar ? styles.selected : ""}
                                >
                                    <AvatarDisplay avatar={avatar} />
                                </li>
                            )}
                        </ul>

                        <horizontal-line/>

                        <Button
                            text={"Change Avatar"}
                            loading={avatarChange.isPending}
                            onClick={change}
                            disabled={selected === _user?.picture}
                        />
                    </>
                    :
                    <>
                        <p className={ !avatarChange.isSuccess ? styles.error : ""} >
                            { avatarChange.isSuccess ?
                                "Your avatar was changed successfully"
                                :
                                "Something went wrong, please try again"
                            }
                        </p>
                        <horizontal-line/>
                        <Button text={"Ok"} onClick={closeModal} />
                    </>
                }
            </div>
        </Modal>
    )
}