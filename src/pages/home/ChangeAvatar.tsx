import {FC, useContext, useState} from "react";
import {changePicture} from "../../api/user.ts";
import Modal from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {ModalContext, UserContext} from "../../Context.tsx";
import avatarList from "../../assets/avatars.json";

const ChangeAvatar: FC = () => {

    const { closeModal } = useContext(ModalContext);
    const { _user ,setUser } = useContext(UserContext);

    const [selected, setSelected] = useState<string>(_user?.picture || avatarList[0]);
    const [changed, setChanged] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(false);

    const changeAvatar = () => {
        changePicture(selected).then(result => {
            setChanged(result.ok);

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
            <div className="change-avatar" >
                { typeof changed === "undefined" ?
                    <>
                        <ul className="avatar-selector" >
                            {avatarList.map(avatar =>
                                <li
                                    key={avatar}
                                    onClick={() => setSelected(avatar)}
                                    className={selected === avatar ? "selected" : ""}
                                >
                                    <img className="user-avatar" src={`./avatars/${avatar}.jpg`} alt="" />
                                </li>
                            )}
                        </ul>
                        <div className="hr" ></div>
                        <Button
                            text={"Change Avatar"}
                            loading={loading}
                            onClick={changeAvatar}
                            disabled={selected === _user?.picture}
                        />
                    </>
                    :
                    <>
                        { changed ?
                            <>
                                <p className="px-4" >
                                    Your avatar was changed successfully
                                </p>
                                <div className="hr" ></div>
                                <Button text={"Ok"} onClick={closeModal} />
                            </>
                            :
                            <>
                                <p className="error-text px-4" >
                                    Something went wrong, please try again
                                </p >
                                <div className="hr" ></div>
                                <Button text={"Ok"} onClick={closeModal} />
                            </>
                        }
                    </>
                }
            </div>
        </Modal>
    )
}

export default ChangeAvatar;