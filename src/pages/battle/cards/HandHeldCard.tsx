import {FC, useEffect, useRef, useState} from "react";
import {ICard} from "../../../interfaces.ts";
import {CardProto} from "../../addCard/cardCreationInterfaces.ts";
import CardContent from "./CardContent.tsx";

const HandHeldCard: FC<{ card: ICard, rotation: number }> = ({ card, rotation }) => {

    const [inspect, setInspect] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!inspect && cardRef.current) {
            cardRef.current?.classList.add("cancel-inspect-hand-held-card");
            setTimeout(() =>
                cardRef.current?.classList.remove("cancel-inspect-hand-held-card"),
                200
            );
        }
    }, [inspect, cardRef]);



    return(
        <div
            ref={cardRef}
            onClick={() => setInspect(!inspect)}
            onMouseLeave={() => setInspect(false)}
            className={`hand-held-card card ${card.deck} ${inspect ? "inspect-hand-held-card" : ""}`}
            style={{
                rotate: `${rotation}deg`,
                translate: `0 ${Math.abs(rotation)}%`
            }}
        >
            <CardContent card={card} />
        </div>
    );
}

export default HandHeldCard;