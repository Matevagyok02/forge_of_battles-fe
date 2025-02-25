import {ICard} from "../../../interfaces.ts";
import {FC, useState} from "react";
import CardContent from "./CardContent.tsx";
import InspectCard from "../ui/InspectCard.tsx";

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
                <InspectCard card={card} cancel={() => setInspect(false)} />
            }
        </>
    );
}

export default DeployedCard;