import {Dispatch, FC, SetStateAction} from "react";
import {CardProto} from "./cardCreationInterfaces.ts";
import {formatNumber} from "./AddCard.tsx";

const BaseForm: FC<{
    cardBase: CardProto,
    setCardBase: Dispatch<SetStateAction<CardProto>>
}> = ({ cardBase, setCardBase }) => {

    const setName = (e: any) => setCardBase({...cardBase, name: e.target.value});
    const setDeck = (e: any) => setCardBase({...cardBase, deck: e.target.value});
    const setPieces = (e: any) => setCardBase({...cardBase, pieces: formatNumber(e.target.value)});
    const setAttack = (e: any) => setCardBase({...cardBase, attack: formatNumber(e.target.value)});
    const setDefence = (e: any) => setCardBase({...cardBase, defence: formatNumber(e.target.value)});
    const setCost = (e: any) => setCardBase({...cardBase, cost: formatNumber(e.target.value)});

    return(
        <table className="flex justify-center" >
            <tbody>
            <tr>
                <th>
                    <label htmlFor="name">Name:</label>
                </th>
                <td>
                    <input id="name" type="text" value={cardBase.name} onChange={setName} />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="deck">Deck:</label>
                </th>
                <td>
                    <select id="deck" value={cardBase.deck} onChange={setDeck} >
                        <option value="light" >Light</option>
                        <option value="darkness" >Darkness</option>
                        <option value="" disabled hidden >Select a deck</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="cost">Cost:</label>
                </th>
                <td>
                    <input id="cost" type="number" value={cardBase.cost} onChange={setCost} />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="attack">Attack:</label>
                </th>
                <td>
                    <input id="attack" type="number" value={cardBase.attack} onChange={setAttack} />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="defence">Defence:</label>
                </th>
                <td>
                    <input id="defence" type="number" value={cardBase.defence} onChange={setDefence} />
                </td>
            </tr>
            <tr>
                <th>
                    <label htmlFor="pieces">Pieces:</label>
                </th>
                <td>
                    <input id="pieces" type="number" value={cardBase.pieces} onChange={setPieces} />
                </td>
            </tr>
            </tbody>
        </table>
    );
}

export default BaseForm;