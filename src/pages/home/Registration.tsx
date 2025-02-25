import {FC, useContext, useState} from "react";
import {registerNewUser} from "../../api/user.ts";
import {ForcedModal} from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "../../Context.tsx";
import avatarList from "../../assets/avatars.json";
import styles from "./Home.module.css";
import appStyles from "../../styles/App.module.css";

const Registration: FC = () => {

    const [username, setUsername] = useState<string>("");
    const [picture, setPicture] = useState<string>("1");
    const [loading, setLoading] = useState<boolean>(false);
    const [registered, setRegistered] = useState<boolean | undefined>();
    const [errorMsg, setErrorMsg] = useState<string | undefined>();

    const { user, logout} = useContext(AuthContext);
    const { closeForcedModal } = useContext(ModalContext);
    const { setUser } = useContext(UserContext);
    const { setFriends } = useContext(FriendsContext);

    const usernameRegex = /^[a-zA-Z0-9]{0,16}$/;
    const universalErrorMsg = "Username must be 8-16 characters and contain only letters and numbers";

    const register = () => {
        if (username.match(usernameRegex) && username.length > 7) {
            setLoading(true);

            registerNewUser(username, picture).then(result => {
                if (result.status === 409) {
                    setErrorMsg(() => {
                        if (result.body && "message" in result.body) {
                            return result.body.message;
                        } else {
                            return "This username is already taken";
                        }
                    });
                } else {
                    setRegistered(result.ok);
                }
                setLoading(false);
            });
        } else {
            setErrorMsg(universalErrorMsg);
        }
    }

    const input = (input: string) => {
        setUsername(input);

        if (username.length > 7 && input.length < 8 ) {
            setErrorMsg("Username must contain at least 8 characters");
            return;
        }

        if (input.match(usernameRegex)) {
            setErrorMsg(undefined);
        } else {
            setErrorMsg(universalErrorMsg);
        }
    }

    const closeRegistretion = () => {
        if (registered && user?.sub) {
            closeForcedModal();
            setUser({
                userId: user.sub,
                username: username,
                picture: picture,
                friends: [],
                requests: []
            });
            setFriends({
                friends: [],
                pending: []
            });
        }
    }

    return(
        <ForcedModal>
            <div className="p-4 flex flex-col items-center gap-4" >
                {typeof registered === "undefined" ?
                    <>
                        <p className="text-center w-72 px-4" >
                            Select an avatar and enter a username to create an account
                        </p>

                        <div className="hr" ></div>

                        <ul className={styles.avatarSelector} >
                            {avatarList.map(avatar =>
                                <li
                                    key={avatar}
                                    onClick={() => setPicture(avatar)}
                                    className={picture === avatar ? "selected" : ""}
                                >
                                    <img className="user-avatar" src={`./avatars/${avatar}.jpg`} alt="" />
                                </li>
                            )}
                        </ul>

                        <small className="text-center w-72 px-4" >
                            Change it later by clicking on the edit icon inside the avatar display
                        </small>

                        <div className="hr" ></div>

                        <input
                            className="username-input"
                            type="text"
                            placeholder="Username (min. 8 characters)"
                            pattern={usernameRegex.source}
                            onChange={(e) => input(e.target.value)}
                        />

                        <div className="hr" ></div>

                        { errorMsg &&
                            <p className={`${appStyles.errorText} text-center w-72 px-4`} >
                                {errorMsg}
                            </p>
                        }

                        <div className="flex gap-4" >
                            <Button
                                text={"Cancel"}
                                onClick={logout}
                            />
                            <Button
                                text={"Submit"}
                                loading={loading}
                                onClick={register}
                            />
                        </div>
                    </>
                    :
                    <>
                        { registered ?
                            <>
                                <p className="text-center w-72 px-4" >
                                    Your account was created successfully
                                </p>
                                <div className="hr" ></div>
                                <Button text={"Continue"} onClick={closeRegistretion} />
                            </>
                            :
                            <>
                                <p className={`${appStyles.errorText} text-center w-72 px-4`} >
                                    Something went wrong, please try again later
                                </p >
                                <div className="hr" ></div>
                                <Button text={"Ok"} onClick={logout} />
                            </>
                        }
                    </>
                }
            </div>
        </ForcedModal>
    )
}

export default Registration;