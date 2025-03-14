import {FC, Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {ICard} from "../../../interfaces.ts";
import CardContent from "./CardContent.tsx";
import Draggable from 'react-draggable';
import {MatchContext} from "../../../context.tsx";
import UseCardMenu from "../ui/UseCardMenu.tsx";
import { draw_cards, use_cards } from "../../../assets/tips.json";

const HandHeldCard: FC<{ card: ICard, rotation: number }> = ({ card, rotation }) => {

    const { setTip, player } = useContext(MatchContext);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [inspect, setInspect] = useState<boolean>(false);
    const [y, setY] = useState<number>(0);
    const [dragged, setDragged] = useState<boolean>(false);
    const [openDeployMenu, setOpenDeployMenu] = useState<boolean>(false);

    useEffect(() => {
        if (!inspect && cardRef.current) {
            cardRef.current?.classList.add("cancel-inspect-hand-held-card");
            setTimeout(() =>
                cardRef.current?.classList.remove("cancel-inspect-hand-held-card"),
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
        if (inspect && player.turnStage === 3) {
            setTip(use_cards);
        } else {
            setTip(draw_cards);
        }
    }, [inspect]);

    const cancelDeploy = () => {
        setOpenDeployMenu(false);
        setY(0);
        setInspect(false);
    }

    return (
        <Suspense fallback={null} >
            { openDeployMenu ?
                <UseCardMenu card={card} cancel={cancelDeploy} />
                :
                player?.turnStage === 3 ?
                    <Draggable
                        axis="y"
                        handle=".inspect-hand-held-card"
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
                            className={`hand-held-card card ${card.deck} ${inspect ? "inspect-hand-held-card" : ""}`}
                            style={{
                                rotate: `${rotation}deg`,
                                translate: `0 ${Math.abs(rotation)}%`
                            }}
                        >
                            <CardContent card={card} />
                        </div>
                    </Draggable>
                    :
                    <div
                        ref={cardRef}
                        onClick={toggleInspect}
                        onMouseLeave={cancelInspect}
                        className={`hand-held-card card ${card.deck} ${inspect ? "inspect-hand-held-card" : ""}`}
                        style={{
                            rotate: `${rotation}deg`,
                            translate: `0 ${Math.abs(rotation)}%`
                        }}
                    >
                        <CardContent card={card} />
                    </div>
            }
        </Suspense>
    );

}

export default HandHeldCard;