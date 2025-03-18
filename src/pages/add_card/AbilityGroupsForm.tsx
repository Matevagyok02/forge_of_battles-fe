import {Dispatch, FC, SetStateAction, useCallback, useEffect, useState} from "react";
import {AbilityProto, EventDrivenAblProto} from "./cardCreationInterfaces.ts";
import {formatNumber, formatVariableName, TriggerEvent} from "./AddCard.tsx";

const groups: { [key: string]: { [key: string]: any } } = {
    costModifier: {
        deploy: 0,
        action: 0,
        passive: 0
    },
    attributeModifier: {
        attack: 0,
        defence: 0
    },
    instant: {
        name: "",
        args: {}
    },
    eventDriven: {
        name: "",
        args: {},
        event: [],
        selfTriggered: false
    }
};

const AbilityGroupForm: FC<{
    ability: AbilityProto,
    setAbility: Dispatch<SetStateAction<AbilityProto>>
}> = ({ ability, setAbility }) => {

    const [group, setGroup] = useState("");

    const changeGroup = useCallback((newGroup: string) => {
        setGroup(newGroup);

        setAbility((prevState: AbilityProto) => {
            const newState = { ...prevState };

            if (group) {
                Object.keys(groups[group]).forEach(key => {
                    delete newState[key];
                });
            }

            Object.entries(groups[newGroup]).forEach(([key, value]) => {
                newState[key] = value;
            });

            return newState;
        });
    }, [group]);

    const updateValue = (key: string, target: HTMLInputElement) => {
        if (typeof groups[group][key] === "number") {
            setAbility({ ...ability, [key]: formatNumber(target.value) });
        }
        else if (typeof groups[group][key] === "boolean") {
            setAbility({ ...ability, [key]: target.checked });
        }
        else if (typeof groups[group][key] === "object") {
            try {
                const object = JSON.parse(target.value);
                setAbility({...ability, [key]: object });
            } catch (e) {
                setAbility({...ability, [key]: target.value });
            }
        }
        else {
            setAbility({ ...ability, [key]: target.value });
        }
    }

    useEffect(() => {
        if (Object.keys(ability).length < 5) {
            setGroup("");
        }
    }, [ability]);

    const getInputType = (value: any) => {
        if (typeof value === "number") {
            return "number";
        }
        else if (typeof value === "string" || Array.isArray(value) || typeof value === "object") {
            return "text";
        }
        else if (typeof value === "boolean") {
            return "checkbox";
        }
    }

    const setTriggerEvent = (e: any) => setAbility({ ...ability, event: [e.target.value] });

    return(
        <>
            <tr>
                <th>
                    <label htmlFor="ability-group" >Group:</label>
                </th>
                <td>
                    <select id="ability-group" value={group} onChange={(e) => changeGroup(e.target.value)} >
                        { Object.keys(groups).map(g =>
                            <option key={g} value={g} >{formatVariableName(g)}</option>
                        )}
                        <option value="" disabled hidden >Select group</option>
                    </select>
                </td>
            </tr>
            { group && Object.entries(groups[group]).map(([key, value]) =>
                key === "event" ?
                    <tr key={key} >
                        <th>
                            <label htmlFor={key} >{formatVariableName(key)}:</label>
                        </th>
                        <td>
                            <select id={key} value={(ability as EventDrivenAblProto).event?.[0] || ""} onChange={setTriggerEvent} >
                                { Object.keys(TriggerEvent).map(triggerEvent =>
                                    <option
                                        key={triggerEvent}
                                        value={triggerEvent}
                                    >
                                        {formatVariableName(triggerEvent)}
                                    </option>
                                )}
                                <option value={""} disabled hidden >Select trigger event</option>
                            </select>
                        </td>
                    </tr>
                    :
                    <tr key={key} >
                        <th>
                            <label htmlFor={key} >{formatVariableName(key)}:</label>
                        </th>
                        <td>
                            <input
                                id={key}
                                value={typeof ability[key] === "object" ? JSON.stringify(ability[key]) : ability[key]}
                                type={getInputType(value)}
                                onChange={(e) => updateValue(key, e.target)}
                            />
                        </td>
                    </tr>
            )}
        </>
    );
}

export default AbilityGroupForm;