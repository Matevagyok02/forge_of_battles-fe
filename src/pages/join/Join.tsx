import {useNavigate, useParams} from "react-router-dom";
import {FC, useContext, useEffect} from "react";
import {joinMatch} from "../../api/match.ts";
import {keyRegex} from "../home/main_interface_components/JoinGame.tsx";
import {AuthContext, ModalContext} from "../../context.tsx";
import {Button} from "../../components/Button.tsx";
import {ForcedModal} from "../../components/Modal.tsx";

const Join: FC = () => {

    const { isAuthenticated, login } = useContext(AuthContext);
    const { openForcedModal, closeForcedModal } = useContext(ModalContext);
    const key = useParams().key;
    const navigate = useNavigate();

    useEffect(() => {
        if (key && isAuthenticated) {
            if (key.match(keyRegex)) {
                joinMatch(key).then(result => {
                    if (result.ok) {
                        navigate("/preparation/" + key);
                    } else {
                        alert("Failed to join match");
                        navigate("/");
                    }
                });
            } else {
                alert("Invalid key");
                navigate("/");
            }
        }
    }, [key, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            const cancel = () => {
                closeForcedModal();
                navigate("/");
            }

            openForcedModal(
                <ForcedModal>
                    <div className="flex flex-col gap-4 p-4" >
                        <p className="px-4 text-xl text-center w-60" >
                            You must be logged in to join the match
                        </p>
                        <horizontal-line/>
                        <div className="flex flex-col gap-4 px-4 items-center" >
                            <Button text={"Login"} onClick={login} />
                            <Button text={"Cancel"} onClick={cancel} />
                        </div>
                    </div>
                </ForcedModal>
            );
        } else
            closeForcedModal();
    }, [isAuthenticated]);

    return (
        <div id="empty-screen" ></div>
    );
}

export default Join;