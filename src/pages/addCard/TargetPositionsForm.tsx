import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {TargetablePos, TargetablePosesProto} from "./cardCreationInterfaces.ts";
import cardSlots from "../../assets/card_slots.json";
import {formatNumber} from "./AddCard.tsx";

const TargetPositionsForm: FC<{
    targetPositions: TargetablePosesProto,
    setTargetPositions: Dispatch<SetStateAction<TargetablePosesProto>>
}> = ({ targetPositions, setTargetPositions }) => {

    const positions = cardSlots.posNames;

    const initPosTable = () => {
        const posTable: TargetablePos[]  = [];
        Object.keys(positions).forEach(key => {
            posTable.push({ position: key, self: false, opponent: false });
        });
        return posTable;
    }

    const [positionTable, setPositionTable] = useState<TargetablePos[]>(initPosTable());

    const updateTargetablePos = (key: string, opponent = false) => {
        const side = opponent ? "opponent" : "self";

        setPositionTable(prevTable => {
            return prevTable.map(pos => {
                if (pos.position === key) {
                    return { ...pos, [side]: !pos[side] };
                }
                return pos;
            });
        });
    }

    useEffect(() => {
        if (targetPositions.self.length < 1 && targetPositions.opponent.length < 1) {
            setPositionTable(initPosTable());
        }
    }, [targetPositions]);

    useEffect(() => {
        positionTable.forEach(pos => {
            if (pos.self && !targetPositions.self.includes(pos.position)) {
                setTargetPositions({ ...targetPositions, self: [...targetPositions.self, pos.position] });
            }
            else if (!pos.self && targetPositions.self.includes(pos.position)) {
                setTargetPositions({ ...targetPositions, self: targetPositions.self.filter(e => e !== pos.position) });
            }
            if (pos.opponent && !targetPositions.opponent.includes(pos.position)) {
                setTargetPositions({ ...targetPositions, opponent: [...targetPositions.opponent, pos.position] });
            }
            else if (!pos.opponent && targetPositions.opponent.includes(pos.position)) {
                setTargetPositions({ ...targetPositions, opponent: targetPositions.opponent.filter(e => e !== pos.position) });
            }
        });
    }, [positionTable]);

    const setCrossTarget = (e: any) => setTargetPositions({ ...targetPositions, allowCrossTarget: e.target.checked });
    const setTargetAmount = (e: any) => setTargetPositions({ ...targetPositions, targetAmount: formatNumber(e.target.value) });

    return (
        <>
            <tr>
                <th>
                    <label htmlFor="target-positions">Targetable:</label>
                </th>
                <td>
                    <table className="positions-table">
                        <tbody>
                        <tr>
                            <th>Position</th>
                            <th>Self</th>
                            <th>Opponent</th>
                        </tr>
                        { positionTable && positionTable.map(e => (
                            <tr key={e.position} >
                                <td className="text-sm" >{e.position.toUpperCase()}</td>
                                <td>
                                    <input
                                        id={`self-${e.position}`}
                                        type="checkbox"
                                        onChange={() => updateTargetablePos(e.position)}
                                        checked={e.self}
                                    />
                                </td>
                                <td>
                                    <input
                                        id={`opponent-${e.position}`}
                                        type="checkbox"
                                        onChange={() => updateTargetablePos(e.position, true)}
                                        checked={e.opponent}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="cross-target">Cross-target:</label>
                </th>
                <td>
                    <input id="cross-target" type="checkbox" checked={targetPositions["allowCrossTarget"]} onChange={setCrossTarget} />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="target-amount">Target Amount:</label>
                </th>
                <td>
                    <input id="target-amount" type="number" value={targetPositions["targetAmount"]} onChange={setTargetAmount} />
                </td>
            </tr>
        </>
    );
};

export default TargetPositionsForm;