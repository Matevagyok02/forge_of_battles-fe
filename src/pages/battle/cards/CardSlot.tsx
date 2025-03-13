import {FC, useContext, useEffect, useState} from "react";
import {MatchContext} from "../../../context.tsx";
import {ICard} from "../../../interfaces.ts";
import DeployedCard from "./DeployedCard.tsx";

export enum WarTrackPos {
    defender = "defender",
    supporter = "supporter",
    attacker = "attacker",
    stormer = "stormer",
    frontLiner = "frontLiner",
    vanguard = "vanguard"
}

const CardSlot: FC<{ pos: WarTrackPos, owner: number }> = ({pos, owner}) => {

    const { opponent, player } = useContext(MatchContext);
    const [card, setCard] = useState<ICard | undefined>(undefined);
    const [cardOwner, setCardOwner] = useState<number>(owner);

    useEffect(() => {
        if (owner < 2 && player.deployedCards[pos]) {
            setCard(player.deployedCards[pos]);
            setCardOwner(1);
        } else if (owner !== 1 && opponent && opponent.deployedCards[pos]) {
            setCard(opponent.deployedCards[pos]);
            setCardOwner(2);
        } else {
            setCard(undefined);
            setCardOwner(owner);
        }
    }, [player.deployedCards, opponent.deployedCards]);

    const getColor = (owner: number) => {
        switch (owner) {
            case 1:
                return player.deck;
            case 2:
                return opponent.deck + (opponent!.deck === player.deck ? "-secondary" : "");
            default:
                return "";
        }
    }

    return(
        <div className={`card-slot ${pos}`} >
            { card ?
                <DeployedCard card={card} slot={pos} owner={cardOwner} color={getColor(cardOwner)} />
                :
                <div className={`card-slot-placeholder ${getColor(cardOwner)}`}>
                    <h1>
                        {pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase()}
                    </h1>
                </div>
            }
        </div>
    );
}

export default CardSlot;