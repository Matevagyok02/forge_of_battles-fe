import {FC, useContext, useState} from "react";
import {registerNewUser} from "../../api/user.ts";
import {ForcedModal} from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {AuthContext, FriendsContext, ModalContext, UserContext} from "../../context.tsx";
import avatars from "../../assets/avatars/avatars.ts";
import styles from "../../styles/home_page/Registration.module.css";
import textInputStyles from "../../styles/components/textInput.module.css";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";

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

    const minCharacters = 8;
    const maxCharacters = 16;
    const usernameRegex = /^[a-zA-Z0-9]{0,16}$/;
    const universalErrorMsg = `Username must be ${minCharacters}-${maxCharacters} characters and contain only letters and numbers`;

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
            <div className={styles.registrationPanel} >
                {typeof registered === "undefined" ?
                    <>
                        <p>
                            Select an avatar and enter a username to create an account
                        </p>

                        <horizontal-line/>

                        <ul>
                            { Object.keys(avatars).map(avatar =>
                                <li
                                    key={avatar}
                                    onClick={() => setPicture(avatar)}
                                    className={picture === avatar ? styles.selected : ""}
                                >
                                    <AvatarDisplay avatar={avatar} />
                                </li>
                            )}
                        </ul>

                        <small>
                            Change it later by clicking on the edit icon inside the avatar display
                        </small>

                        <horizontal-line/>

                        <input
                            className={textInputStyles.textInput}
                            type={"text"}
                            placeholder={`Username (min. ${minCharacters} characters)`}
                            pattern={usernameRegex.source}
                            onChange={(e) => input(e.target.value)}
                        />

                        <horizontal-line/>

                        { errorMsg &&
                            <p className={styles.error} >
                                {errorMsg}
                            </p>
                        }

                        <menu>
                            <Button
                                text={"Cancel"}
                                onClick={logout}
                            />
                            <Button
                                text={"Submit"}
                                loading={loading}
                                onClick={register}
                            />
                        </menu>
                    </>
                    :
                    <>
                        <p className={registered ? "" : styles.error} >
                            { registered ?
                                "Your account was successfully created"
                                :
                                "Something went wrong, please try again later"
                            }
                        </p >
                        <horizontal-line/>
                        <Button
                            text={registered ? "Continue" : "Ok"}
                            onClick={registered ? closeRegistretion : logout}
                        />
                    </>
                }
            </div>
        </ForcedModal>
    )
}

export default Registration;