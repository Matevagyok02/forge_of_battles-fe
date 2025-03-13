import {FC, useCallback, useContext} from "react";
import {MatchContext} from "../../../context.tsx";
import {Button} from "../../../components/Button.tsx";
import StormMenu from "./StormMenu.tsx";
import Tips from "../Tips.tsx";
import {IPlayerState} from "../../../interfaces.ts";
import {OutgoingBattleEvent} from "../Battle.tsx";

const BattleInterface: FC = () => {

    const { match, player, socket } = useContext(MatchContext);

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

    return( match.battle.turnOfPlayer === player.userId &&
        <div className="battle-interface" >
            { canAdvance(player) &&
                <Button text={"Advance"} onClick={advance} />
            }
            { player.turnStage === 2 &&
                <StormMenu />
            }
            { player.turnStage === 3 &&
                <Button text="End Turn" onClick={endTurn} />
            }
            <Tips />
        </div>
    );
}

export default BattleInterface;