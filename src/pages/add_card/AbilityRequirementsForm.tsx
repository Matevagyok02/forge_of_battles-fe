import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {AblReqProto, TargetablePosesProto} from "./cardCreationInterfaces.ts";
import {AbilityType, formatNumber} from "./AddCard.tsx";
import TargetPositionsForm from "./TargetPositionsForm.tsx";

const emptySelectablePositions = {
    self: [],
    opponent: [],
    allowCrossTarget: false,
    targetAmount: 1
}

const AbilityRequirementForm: FC<{
    type: string,
    requirements: AblReqProto,
    setRequirements: Dispatch<SetStateAction<AblReqProto>>
}> = ({ type, requirements, setRequirements }) => {

    const [targetPositions, setTargetPositions] = useState<TargetablePosesProto>(emptySelectablePositions);

    useEffect(() => {
        if (targetPositions.self.length > 0 || targetPositions.opponent.length > 0) {
            setRequirements({ ...requirements, selectablePositions: targetPositions });
        } else if (requirements.selectablePositions) {
            setRequirements(prevState => {
                const newState = { ...prevState };
                delete newState.selectablePositions;
                return newState;
            });
        }
    }, [targetPositions]);

    useEffect(() => {
        if (Object.keys(requirements).length === 0) {
            setTargetPositions(emptySelectablePositions);
        }
    }, [requirements]);

    const updateAbilityRequirements = (key: string, value: any) => {
        if (value === false || value === 0) {
            setRequirements((prevState: { [key: string]: any }) => {
                const newState = { ...prevState };
                delete newState[key];
                return newState;
            });
        } else {
            setRequirements({ ...requirements, [key]: value });
        }
    }

    const setManaCost = (e: any) => updateAbilityRequirements('mana', formatNumber(e.target.value));
    const setSacrifice = (e: any) => updateAbilityRequirements('sacrifice', e.target.checked);
    const setEmptyDeploy = (e: any) => updateAbilityRequirements('emptyDeployZone', e.target.checked);
    const setNestedArgs = (e: any) => updateAbilityRequirements('nestedArgs', e.target.checked);
    const setSelectedCardAmount = (e: any) => updateAbilityRequirements('selectedCardAmount', formatNumber(e.target.value));

    return(
        <>
            { type === AbilityType.passive &&
                <tr>
                    <th>
                        <label htmlFor="mana-cost" >Mana Cost:</label>
                    </th>
                    <td>
                        <input
                            id="mana-cost"
                            type="number"
                            onChange={setManaCost}
                            value={requirements.mana || 0}
                        />
                    </td>
                </tr>
            }
            <tr>
                <th>
                    <label htmlFor="sacrifice" >Sacrifice:</label>
                </th>
                <td>
                    <input
                        id="sacrifice"
                        type="checkbox"
                        onChange={setSacrifice}
                        checked={requirements.sacrifice || false}
                    />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="empty-deploy" >Empty Deploy:</label>
                </th>
                <td>
                    <input
                        id="empty-deploy"
                        type="checkbox"
                        onChange={setEmptyDeploy}
                        checked={requirements.emptyDeployZone || false}
                    />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="nested-args" >Nested Args:</label>
                </th>
                <td>
                    <input
                        id="nested-args"
                        type="checkbox"
                        onChange={setNestedArgs}
                        checked={requirements.nestedArgs || false}
                    />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="selected-card-amount" >Sel. Card Amount:</label>
                </th>
                <td>
                    <input
                        id="selected-card-amount"
                        type="number"
                        onChange={setSelectedCardAmount}
                        value={requirements.selectedCardAmount || 0}
                    />
                </td>
            </tr>
            <TargetPositionsForm targetPositions={targetPositions} setTargetPositions={setTargetPositions} />
        </>
    );
}

export default AbilityRequirementForm;