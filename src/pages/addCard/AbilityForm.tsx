import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {AbilityProto, AblReqProto} from "./cardCreationInterfaces.ts";
import {AbilitySubtype, AbilityUsageType, formatVariableName} from "./AddCard.tsx";
import AbilityRequirementForm from "./AbilityRequirementsForm.tsx";
import AbilityGroupForm from "./AbilityGroupsForm.tsx";

const AbilityForm: FC<{
    ability: AbilityProto,
    setAbility: Dispatch<SetStateAction<AbilityProto>>
}> = ({ ability, setAbility }) => {

    const [requirements, setRequirements] = useState<AblReqProto>({});

    useEffect(() => {
        if (Object.keys(requirements).length === 0) {
            setAbility((prevState: AbilityProto) => {
                const newState = { ...prevState };
                delete newState.requirements;
                return newState;
            });
        } else {
            setAbility({ ...ability, requirements: requirements });
        }
    }, [requirements]);

    useEffect(() => {
        if (!ability.requirements && Object.keys(requirements).length > 0) {
            setRequirements({});
        }
    }, [ability]);

    const updateAbility = (key: string, value: any) => {
        setAbility({ ...ability, [key]: value });
    }

    const setAbilityDescription = (e: any) => updateAbility('description', e.target.value);
    const setAbilityUsageType = (e: any) => updateAbility('usageType', e.target.value);
    const setAbilitySubtype = (e: any) => updateAbility('subtype', e.target.value);

    return(
        <table className={`flex justify-center ${ability["type"]}-ability-form`} >
            <tbody>
            <tr>
                <th>
                    <label htmlFor="ability-description" >Description:</label>
                </th>
                <td>
                    <textarea id="ability-description" onChange={setAbilityDescription} value={ability.description} ></textarea>
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="usage-type" >Usage Type:</label>
                </th>
                <td>
                    <select id="usage-type" onChange={setAbilityUsageType} value={ability.usageType} >
                        { Object.keys(AbilityUsageType).map(usageType =>
                            <option key={usageType} value={usageType} >{formatVariableName(usageType)}</option>
                        )}
                        <option value="" disabled hidden >Select usage type</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="subtype" >Subtype:</label>
                </th>
                <td>
                    <select id="subtype" onChange={setAbilitySubtype} value={ability.subtype} >
                        { Object.keys(AbilitySubtype).map(subtype =>
                            <option key={subtype} value={subtype} >{formatVariableName(subtype)}</option>
                        )}
                        <option value="" disabled hidden >Select subtype</option>
                    </select>
                </td>
            </tr>
            <AbilityGroupForm ability={ability} setAbility={setAbility} />
            <AbilityRequirementForm requirements={requirements} setRequirements={setRequirements}  />
            </tbody>
        </table>
    );
}

export default AbilityForm;