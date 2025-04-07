import {FC, useContext, useEffect, useState} from "react";
import {ForcedModal} from "../../components/Modal.tsx";
import {Button} from "../../components/Button.tsx";
import {AuthContext} from "../../context.tsx";
import avatars from "../../assets/avatars/avatars.ts";
import styles from "../../styles/home_page/Registration.module.css";
import textInputStyles from "../../styles/components/textInput.module.css";
import AvatarDisplay from "../../components/AvatarDisplay.tsx";
import {useRegistration, useUsernames} from "../../api/hooks.tsx";

const Registration: FC = () => {

    const [username, setUsername] = useState<string>("");
    const [picture, setPicture] = useState<string>("1");

    const [errorMsg, setErrorMsg] = useState<string>();
    const [usernameTaken, setUsernameTaken] = useState<boolean>(false);
    const [reachedMinChars, setReacheMinChars] = useState<boolean>(false);

    const { logout } = useContext(AuthContext);

    const minCharacters = 8;
    const maxCharacters = 16;
    const usernameRegex = /^[a-zA-Z0-9]{0,16}$/;

    const generalErrorMsg = "Something went wrong, please try again later";
    const invalidUsernameMsg = `Username must be ${minCharacters}-${maxCharacters} characters and contain only letters and numbers`;
    const usernameTakenMsg = "This username is already taken";
    const minCharsMsg = "Username must contain at least 8 characters";
    const successMsg = "Your account was successfully created";

    const registration = useRegistration();
    const fetchUsernames = useUsernames();

    const register = () => {
        if (!username.match(usernameRegex) || username.length < minCharacters)
            setErrorMsg(invalidUsernameMsg);
        else if (usernameTaken)
            setErrorMsg(usernameTakenMsg);
        else
            registration.register({ username, picture });
    }

    useEffect(() => {
        if (fetchUsernames.isSuccess && fetchUsernames.data.data.includes(username)) {
            setUsernameTaken(true);
            setErrorMsg(usernameTakenMsg);
        } else {
            setUsernameTaken(false);
        }
    }, [fetchUsernames.data, username]);

    useEffect(() => {
        if (registration.isError) {
            if (registration.error?.status === 409) {
                setErrorMsg(() => {
                    return registration.error?.response?.data.message || usernameTakenMsg;
                });
            }
        }
    }, [registration.isError]);

    const input = (input: string) => {
        setUsername(input);

        if (input.length >= minCharacters) {
            setReacheMinChars(true);
        }

        if (reachedMinChars && input.length < minCharacters ) {
            setErrorMsg(minCharsMsg);
        } else if (input.match(usernameRegex)) {
            setErrorMsg(undefined);
        } else {
            setErrorMsg(invalidUsernameMsg);
        }
    }

    return(
        <ForcedModal>
            <div className={styles.registrationPanel} >
                { registration.isIdle || registration.isPending ?
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
                                loading={registration.isPending}
                                disabled={!!errorMsg}
                                onClick={register}
                            />
                        </menu>
                    </>
                    :
                    <>
                        <p className={registration.isSuccess ? "" : styles.error} >
                            { registration.isSuccess ?
                                successMsg
                                :
                                errorMsg || generalErrorMsg
                            }
                        </p >
                        <horizontal-line/>
                        <Button
                            text={registration.isSuccess ? "Continue" : "Ok"}
                            onClick={registration.isSuccess ? registration.finish : logout}
                        />
                    </>
                }
            </div>
        </ForcedModal>
    )
}

export default Registration;