import {ICard} from "../../../interfaces.ts";
import {FC, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import CardContent from "./CardContent.tsx";

const DeployedCard: FC<{ card: ICard }> = ({ card }) => {

    const [inspect, setInspect] = useState<boolean>(false);

    return(
        <>
            <div
                className={`deployed-card card ${card.deck}`}
                onClick={() => setInspect(true)}
            >
                <CardContent card={card} />
            </div>
            { inspect &&
                <InspectedDeployedCard card={card} cancelInspect={() => setInspect(false)} />
            }
        </>
    );
}

export const InspectedDeployedCard: FC<{ card: ICard, cancelInspect: () => void }> = ({ card, cancelInspect }) => {

    useEffect(() => {
        document.onkeydown = (e => {
            if (e.key === "Escape") {
                cancelInspect();
            }
        });

        return () => {
            document.onkeydown = null;
        }
    }, []);

    const handleKeyDown = (e: any) => {
        if (e.key === "Escape") {
            cancelInspect();
        }
    }

    return(
        createPortal(
            <div id="card-inspect-overlay" className="battle-overlay"  onKeyDown={handleKeyDown} >
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
                        <li id={"cancel-inspect-option"} onClick={cancelInspect} >
                            Cancel
                        </li>
                    </ul>
                </div>
            </div>,
            document.getElementById("battle-container") as HTMLElement
        )
    );
}

export default DeployedCard;