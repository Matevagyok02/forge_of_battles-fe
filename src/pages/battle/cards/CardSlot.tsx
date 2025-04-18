import {FC, useContext, useEffect, useState} from "react";
import {MatchContext} from "../../../context.tsx";
import {ICard} from "../../../interfaces.ts";
import DeployedCard from "./DeployedCard.tsx";
import styles from "../../../styles/battle_page/Board.module.css";
import {deckColorStyles} from "../Board.tsx";

export enum BattlefieldPos {
    defender = "defender",
    supporter = "supporter",
    attacker = "attacker",
    stormer = "stormer",
    frontLiner = "frontLiner",
    vanguard = "vanguard"
}



const CardSlot: FC<{ pos: BattlefieldPos, owner: number }> = ({pos, owner}) => {

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
                return deckColorStyles.primary[player.deck];
            case 2:
                return opponent.deck === player.deck ?
                    deckColorStyles.secondary[opponent.deck]
                    :
                    deckColorStyles.primary[opponent.deck];
            default:
                return "";
        }
    }

    return(
        <div className={`${styles.slot} ${pos}`} >
            { card ?
                <DeployedCard card={card} slot={pos} owner={cardOwner} color={getColor(cardOwner)} />
                :
                <div className={`${styles.placeholder} ${getColor(cardOwner)}`}>
                    <h1>
                        {pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase()}
                    </h1>
                </div>
            }
        </div>
    );
}

export default CardSlot;