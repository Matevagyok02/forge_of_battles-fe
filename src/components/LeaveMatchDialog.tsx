import {FC, useContext, useEffect} from "react";
import {ForcedModal} from "./Modal.tsx";
import {ModalContext} from "../context.tsx";
import {Button} from "./Button.tsx";
import {useNavigate} from "react-router-dom";
import {useAbandonMatch, useLeaveMatch} from "../api/hooks.tsx";

const LeaveMatchDialog: FC<{ matchKey: string, isHost?: boolean }> = ({matchKey, isHost}) => {

    const navigate = useNavigate();
    const { closeForcedModal, openInfoModal } = useContext(ModalContext);

    const leaveMatch = useLeaveMatch();
    const abandonMatch = useAbandonMatch();

    useEffect(() => {
        if (leaveMatch.isSuccess || abandonMatch.isSuccess) {
            closeForcedModal();
            setTimeout(() => navigate("/"), 10);
        }
    }, [leaveMatch.isSuccess, abandonMatch.isSuccess]);

    useEffect(() => {
        if (leaveMatch.isError) {
            openInfoModal(
                <p className="w-80 text-center" >
                    You are not inside an ongoing match. Press "OK" to return to the main page.
                </p>,
                () => navigate("/")
            );
        }
    }, [leaveMatch.isError]);

    useEffect(() => {
        if (abandonMatch.isError) {
            openInfoModal(
                <p className="w-80 text-center" >
                    Your opponent must be inactive for 5 minutes before you can abandon the match.
                </p>
            );
        }
    }, [abandonMatch.isError]);

    const handleClick = isHost ? () => abandonMatch.abandon(matchKey) : leaveMatch.leave;

    const pending = !(leaveMatch.isSuccess || abandonMatch.isSuccess || leaveMatch.isError || abandonMatch.isError);

    return( pending &&
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <p className="text-center text-xl px-2 w-60" >
                    {`Are you sure you want to ${ isHost ? "abandon" : "leave" }  this match?`}
                </p>
                <horizontal-line/>
                <div className="flex gap-4" >
                    <Button text={"No"} onClick={ closeForcedModal } />
                    <Button text={"Yes"} onClick={ handleClick } />
                </div>
            </div>
        </ForcedModal>
    );
}

export default LeaveMatchDialog;