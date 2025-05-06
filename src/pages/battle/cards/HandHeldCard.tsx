import {CSSProperties, FC, Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {ICard} from "../../../interfaces.ts";
import CardContent from "./CardContent.tsx";
import Draggable from 'react-draggable';
import {MatchContext} from "../../../context.tsx";
import CardUsageMenu from "../ui/CardUsageMenu.tsx";
import { use_cards } from "../../../assets/tips.json";
import styles from "../../../styles/battle_page/Cards.module.css"
import cardStyles from "../../../styles/battle_page/Cards.module.css";

const HandHeldCard: FC<{ card: ICard, rotation: number }> = ({ card, rotation }) => {

    const { setTip, player } = useContext(MatchContext);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [inspect, setInspect] = useState<boolean>(false);
    const [y, setY] = useState<number>(0);
    const [dragged, setDragged] = useState<boolean>(false);
    const [openDeployMenu, setOpenDeployMenu] = useState<boolean>(false);

    useEffect(() => {
        if (!inspect && cardRef.current) {
            cardRef.current?.classList.add(styles.cancelInspect);
            setTimeout(() =>
                cardRef.current?.classList.remove(styles.cancelInspect),
                200
            );
        }
    }, [inspect, cardRef]);

    const handleDrag = (e: any, data: any) => {
        if (data.y <= 0 && e) {
            setY(data.y);
        }
    };

    const handleDragStop = () => {
        const viewportHeight = window.innerHeight;

        if (y > - (viewportHeight / 8) || y < - (viewportHeight / 3)) {
            setY(0);
        } else {
            setOpenDeployMenu(true);
        }
    }

    const cancelInspect = useCallback(() => {
        if (!dragged) {
            setInspect(false);
            setDragged(false);
        }
    }, [dragged]);

    const toggleInspect = useCallback(() => {
        if (!dragged && y === 0 && inspect) {
            setInspect(false);
            setDragged(false);
        } else {
            setInspect(true);
        }
    }, [dragged, y, inspect]);

    useEffect(() => {
        if (y === 0) {
            setTimeout(() => setDragged(false), 200);
        } else {
            setDragged(true);
        }
    }, [y]);

    useEffect(() => {
        if (player.turnStage === 3) {
            if (inspect) {
                setTip(use_cards);
            } else {
                setTip(undefined);
            }
        }
    }, [inspect]);

    const cancelDeploy = () => {
        setOpenDeployMenu(false);
        setY(0);
        setInspect(false);
    }

    useEffect(() => {
        const hand = document.getElementById("player-hand");

        if (hand) {
            if (inspect) {
                hand.classList.add("z-10");
            } else {
                hand.classList.remove("z-10");

            }
        }
    }, [inspect]);

    return (
        <Suspense fallback={null} >
            { openDeployMenu ?
                <CardUsageMenu card={card} cancel={cancelDeploy} />
                :
                player?.turnStage === 3 ?
                    <Draggable
                        axis={"y"}
                        // bounds={{ top: -10, bottom: 5 }}
                        handle={`.${styles.inspect}`}
                        nodeRef={cardRef}
                        scale={1}
                        position={{ x: 0, y }}
                        onDrag={handleDrag}
                        onStop={handleDragStop}
                    >
                        <div
                            ref={cardRef}
                            onClick={toggleInspect}
                            onMouseLeave={cancelInspect}
                            className={`${styles.card} ${styles.handHeld} ${inspect ? styles.inspect : ""}`}
                            style={{
                                rotate: `${rotation}deg`,
                                "--y-offset": `${Math.abs(rotation)}%`,
                            } as CSSProperties }
                        >
                            <CardContent card={card} />
                        </div>
                    </Draggable>
                    :
                    <div
                        ref={cardRef}
                        onClick={toggleInspect}
                        onMouseLeave={cancelInspect}
                        className={`${styles.card} ${styles.handHeld} ${inspect ? styles.inspect : ""}`}
                        style={{
                            rotate: `${rotation}deg`,
                            "--y-offset": `${Math.abs(rotation)}%`,
                        } as CSSProperties }
                    >
                        <CardContent card={card} />
                    </div>
            }
        </Suspense>
    );

}

export const HandHeldCardBack: FC<{ rotation: number, color: string }> = ({ rotation, color }) => {

    return (
        <div
            className={`${cardStyles.cardBack} ${color}`}
            style={{
                rotate: `${rotation * 2}deg`,
                translate: `-50% ${Math.abs(rotation * 1.5)}%`
            }}
        >
            <div style={{ rotate: `${rotation * 10}deg` }} ></div>
        </div>
    );
}

export default HandHeldCard;