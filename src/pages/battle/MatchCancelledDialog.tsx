import {FC, useContext, useEffect} from "react";
import {Button} from "../../components/Button.tsx";
import {ForcedModal} from "../../components/Modal.tsx";
import {useNavigate} from "react-router-dom";
import {MatchContext} from "../../context.tsx";
import {useAbandonMatch, useLeaveMatch} from "../../api/hooks.tsx";

const MatchCancelledDialog: FC = () => {

    const { match, player } = useContext(MatchContext);
    const navigate = useNavigate();
    const leaveMatch = useLeaveMatch();
    const abandonMatch = useAbandonMatch();

    useEffect(() => {
        if (match && !match.randomMatch && player?.userId === match.player1Id) {
            abandonMatch.abandon(match.key)
        } else {
            leaveMatch.leave();
        }
    }, []);

    return (
        <ForcedModal>
            <div className="flex flex-col items-center gap-4 p-4" >
                <p className="text-center text-xl px-2 w-96" >
                    The match has been cancelled, because your opponent has left the game permanently.
                    Press "OK" to return to the main page.
                </p>
                <horizontal-line/>
                <div className="flex gap-4" >
                    <Button text={"Ok"} onClick={() => navigate("/")} />
                </div>
            </div>
        </ForcedModal>
    );
}

export default MatchCancelledDialog;