import {FC, useContext, useState} from "react";
import {Button, Icon, IconButton} from "../../components/Button.tsx";
import {AuthContext, ModalContext, UserContext} from "../../context.tsx";
import styles from "../../styles/home_page/UserPanel.module.css";
import avatars from "../../assets/avatars/avatars.ts";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import {changePicture} from "../../api/user.ts";
import Modal from "../../components/Modal.tsx";

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
                <IconButton bg icon={Icon.music} decorated onClick={() => alert("TODO")} />
                <IconButton bg icon={Icon.sound} decorated onClick={() => alert("TODO")} />
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
                <IconButton icon={Icon.music} text={"Music"} decorated onClick={() => alert("TODO")} />
                <IconButton icon={Icon.sound} text={"Sounds"} decorated onClick={() => alert("TODO")} />
                <IconButton icon={Icon.logout} text={"Log Out"}  decorated onClick={logout} />
            </menu>
        </div>
    );
}

const ChangeAvatar: FC = () => {

    const { closeModal } = useContext(ModalContext);
    const { _user ,setUser } = useContext(UserContext);

    const [selected, setSelected] = useState<string>(_user?.picture || "");
    const [change, setChange] = useState<{ requested: boolean, successful: boolean }>({ requested: false, successful: false});
    const [loading, setLoading] = useState(false);

    const changeAvatar = () => {
        setLoading(true);

        changePicture(selected).then(result => {
            setChange({
                requested: true,
                successful: result.ok
            });

            if (result.ok) {
                setUser(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            picture: selected
                        }
                    } else {
                        return prevState;
                    }
                });
            }

            setLoading(false);
        });
    }

    return(
        <Modal>
            <div className={styles.changeAvatar} >
                { !change.requested ?
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
                            loading={loading}
                            onClick={changeAvatar}
                            disabled={selected === _user?.picture}
                        />
                    </>
                    :
                    <>
                        <p className={!change.successful ? styles.error : ""} >
                            { change.successful ?
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