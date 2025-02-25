import {FC, useContext, useEffect} from "react";
import {ICard} from "../../../interfaces.ts";
import {createPortal} from "react-dom";
import CardContent from "../cards/CardContent.tsx";
import {MatchContext} from "../../../Context.tsx";

const InspectCard: FC<{ card: ICard, cancel: () => void }> = ({ card, cancel }) => {

    const { player, socket } = useContext(MatchContext);

    console.log(player?.userId, socket.id); //TODO: remove

    useEffect(() => {
        document.onkeydown = (e => {
            if (e.key === "Escape") {
                cancel();
            }
        });

        return () => {
            document.onkeydown = null;
        }
    }, []);

    return(
        createPortal(
            <div id="card-inspect-overlay" className="battle-overlay" >
                <div className="flex gap-4" >
                    <div className={`inspected-card card ${card.deck}`} >
                        <CardContent card={card} />
                    </div>
                    <ul className="card-usage-options" >
                        <li>
                            Move to Front
                        </li>
                        <li>
                            Convert to Mana
                        </li>
                        <li id="attack-option" >
                            <h1>
                                Attack
                            </h1>
                            <ul>
                                <li>
                                    Deck
                                </li>
                                <li>
                                    Frontliner
                                </li>
                                <li>
                                    Vanguard
                                </li>
                            </ul>
                        </li>
                        <li id={"cancel-inspect-option"} onClick={cancel} >
                            Cancel
                        </li>
                    </ul>
                </div>
            </div>,
            document.getElementById("battle-container") as HTMLElement
        )
    );
}

export default InspectCard;