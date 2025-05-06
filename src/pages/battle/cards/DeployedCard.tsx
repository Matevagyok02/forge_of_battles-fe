import {ICard} from "../../../interfaces.ts";
import {FC, useContext, useEffect, useRef, useState} from "react";
import CardContent from "./CardContent.tsx";
import InspectCard from "../ui/InspectCard.tsx";
import {MatchContext} from "../../../context.tsx";
import {BattlefieldPos} from "./CardSlot.tsx";
import Animations from "../animations/Animations.ts";
import styles from "../../../styles/battle_page/Cards.module.css";

const DeployedCard: FC<{ card: ICard, slot: string ,owner: number, color: string}> = ({ card, slot, owner, color}) => {

    const { setTip } = useContext(MatchContext);
    const [prevTempId, setPrevTempId] = useState<string>();
    const [inspect, setInspect] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const doesSlotAdvance = () => {
        switch (slot) {
            case BattlefieldPos.defender:
            case BattlefieldPos.supporter:
            case BattlefieldPos.attacker:
                return true;
            default:
                return false;
        }
    }

    useEffect(() => {
        setPrevTempId((prev) => {
            if (card.tempId !== prev && ref.current) {
                if (doesSlotAdvance()) {
                    ref.current!.classList.add(
                        owner === 1 ? styles.advancePlayer : styles.advanceOpponent
                    );
                } else {
                    if (owner === 1) {
                        Animations.placeFrontliner(ref.current!);
                    } else {
                        Animations.opponentPlaceFrontliner(ref.current!);
                    }
                }
            }
            return card.tempId;
        });
    }, [card.tempId]);

    useEffect(() => {
        let timeout: number;

        timeout = setTimeout(() => ref.current!.classList.remove(styles.advancePlayer, styles.advanceOpponent), 1000);

        return () => {
            if (timeout) clearTimeout(timeout);
        }
    }, [prevTempId]);

    const cancelInspect = () => {
        setInspect(false);
        setTip(undefined);
    }

    return(
        <>
            <div
                ref={ref}
                className={`${styles.deployed} ${styles.card} ${color}`}
                onClick={() => setInspect(true)}
            >
                <CardContent card={card} showModifiedAttributes={true} />
            </div>
            { inspect &&
                <InspectCard card={card} slot={slot} cancel={cancelInspect} owner={owner} />
            }
        </>
    );
}

export default DeployedCard;