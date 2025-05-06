import {FC, useCallback, useContext} from "react";
import {MatchContext, ModalContext} from "../../../context.tsx";
import {Button} from "../../../components/Button.tsx";
import EngagementMenu from "./StormMenu.tsx";
import Tips from "../Tips.tsx";
import {IPlayerState} from "../../../interfaces.ts";
import {OutgoingBattleEvent} from "../Battle.tsx";
import styles from "../../../styles/battle_page/Battle.module.css"
import {MusicVolumeControl} from "../../../components/BgMusic.tsx";
import LeaveMatchDialog from "../../../components/LeaveMatchDialog.tsx";

const BattleInterface: FC = () => {

    const { match, player, socket } = useContext(MatchContext);
    const { openForcedModal } = useContext(ModalContext);

    const isHost = !match.randomMatch && player.userId === match.player1Id;

    const endTurn = useCallback(() => {
        if (socket && player.turnStage === 3) {
            socket.emit(OutgoingBattleEvent.endTurn);
        }
    }, [socket, player]);

    const canAdvance = (playerState: IPlayerState) => {
        return playerState.turnStage === 1 && (
                playerState.drawsPerTurn > 0 || (
                    playerState.drawingDeck.length < 1 &&
                    playerState.bonusHealth.length > 0
                ))
    }

    const advance = useCallback(() => {
        if (socket && canAdvance(player)) {
            socket.emit(OutgoingBattleEvent.advance);
        }
    }, [socket, player]);

    return(
        <div className={styles.mainUi} >
            { match.battle.turnOfPlayer === player.userId ?
                <>
                    { canAdvance(player) &&
                        <Button text={"Advance"} onClick={advance} />
                    }
                    { player.turnStage === 2 &&
                        <EngagementMenu />
                    }
                    { player.turnStage === 3 &&
                        <Button text="End Turn" onClick={endTurn} />
                    }
                </>
                :
                <Button
                    text={isHost ? "Abandon" : "Leave"}
                    onClick={() => openForcedModal(<LeaveMatchDialog matchKey={match.key} isHost={isHost} />)}
                />
            }
            <MusicVolumeControl expandUpward />
            <Tips />
        </div>
    );
}

export default BattleInterface;