import {FC, useContext} from "react";
import {ForcedModal} from "../../components/Modal.tsx";
import {ModalContext} from "../../context.tsx";
import {Button} from "../../components/Button.tsx";
import {useNavigate} from "react-router-dom";
import {abandonMatch, leaveMatch} from "../../api/match.ts";

const LeaveMatchDialog: FC<{ matchKey: string | undefined, isHost: boolean }> = ({matchKey, isHost}) => {

    const navigate = useNavigate();
    const { closeForcedModal, openInfoModal } = useContext(ModalContext);

    const leave = () => {
        leaveMatch().then(result => {
            closeForcedModal();
            if (result.ok) {
                setTimeout(() => navigate("/"), 1);
            } else {
                openInfoModal(
                    <p className="w-80 text-center" >
                        You are not inside an ongoing match. Press "OK" to return to the main page.
                    </p>,
                    () => navigate("/")
                );
            }
        });


    }

    const abandon = () => {
        abandonMatch(matchKey!).then(result => {
            closeForcedModal();
            if (result.ok) {
                setTimeout(() => navigate("/"), 1);
            } else {
                openInfoModal(
                    <p className="w-80 text-center" >
                        Your opponent must be inactive for at least 5 minutes to abandon the match.
                    </p>
                );
            }
        });
    }

    const handleClick = isHost ? abandon : leave;

    return (
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <p className="text-center text-xl px-2 w-60" >
                    { isHost ?
                        "Are you sure you want to abandon this match?"
                        :
                        "Are you sure you want to leave this match?"
                    }
                </p>
                <div className="hr" ></div>
                <div className="flex gap-4" >
                    <Button text={"No"} onClick={ closeForcedModal } />
                    <Button text={"Yes"} onClick={ handleClick } />
                </div>
            </div>
        </ForcedModal>
    );
}

export default LeaveMatchDialog;