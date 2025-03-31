import {Dispatch, FC, SetStateAction} from "react";
import {CardProto} from "./cardCreationInterfaces.ts";
import {formatNumber} from "./AddCard.tsx";
import decks from "../../assets/decks.json";

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

    const inputs = [
        {
            id: "name",
            value: cardBase.name,
            onChange: setName
        },
        {
            id: "cost",
            value: cardBase.cost,
            onChange: setCost
        },
        {
            id: "attack",
            value: cardBase.attack,
            onChange: setAttack
        },
        {
            id: "defence",
            value: cardBase.defence,
            onChange: setDefence
        },
        {
            id: "pieces",
            value: cardBase.pieces,
            onChange: setPieces
        }
    ];

    return(
        <table>
            <tbody>
            <tr>
                <th>
                    <label htmlFor={"deck"} >Deck:</label>
                </th>
                <td>
                    <select id={"deck"} value={cardBase.deck} onChange={setDeck} >
                        { Object.keys(decks).map(deck =>
                            <option key={deck} value={deck}>{deck.toUpperCase()}</option>
                        )}
                        <option value={""} disabled hidden >Select a deck</option>
                    </select>
                </td>
            </tr>

            { inputs.map(input =>
                <tr key={input.id} >
                    <th>
                        <label htmlFor={input.id} >
                            {input.id.charAt(0).toUpperCase() + input.id.slice(1)}:
                        </label>
                    </th>
                    <td>
                        <input
                            id={input.id}
                            type={input.id === "name" ? "text" : "number"}
                            value={input.value}
                            onChange={input.onChange}
                        />
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
}

export default BaseForm;