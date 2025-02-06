import {FC, useEffect, useRef, useState} from "react";
import {ICard} from "../../../interfaces.ts";
import {CardProto} from "../../addCard/cardCreationInterfaces.ts";

const HandHeldCard: FC<{ card: ICard | CardProto, rotation: number }> = ({ card, rotation }) => {

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
            <img
                src="../../../../src/assets/background/tutorial_and_cards.jpg"
                alt={card.name}
            />
            <div className="card-name" >
                <h1 className="gold-text" >
                    {card.name}
                </h1>
            </div>
            <div className="card-attribute-icon cost" >
                <h1>
                    {card.cost}
                </h1>
            </div>
            <div className="card-attribute-icon def" >
                <h1>
                    {card.defence}
                </h1>
            </div>
            <div className="card-attribute-icon att" >
                <h1>
                    {card.attack}
                </h1>
            </div>
            <div className="card-abilities" >
                <p className="action-ability" >
                    This is an action ability
                </p>
                <p className="passive-ability" >
                    And this is a passive ability
                </p>
            </div>
        </div>
    );
}

export default HandHeldCard;