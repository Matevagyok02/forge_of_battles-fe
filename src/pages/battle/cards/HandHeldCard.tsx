import {FC, useCallback, useContext, useEffect, useRef, useState} from "react";
import {ICard} from "../../../interfaces.ts";
import CardContent from "./CardContent.tsx";
import Draggable from 'react-draggable';
import {MatchContext} from "../../../Context.tsx";
import DeployMenu from "../ui/DeployMenu.tsx";

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
        if (data.y <= 0) {
            setY(data.y);
        }
    };

    const handleDragStop = () => {
        const viewportHeight = window.innerHeight;

        if (y > - (viewportHeight / 6) || y < - (viewportHeight / 3)) {
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
        if (inspect && player?.turnStage === 3) {
            setTip(
                "Drag the card on the War Track to deploy it or click on the action to use it."
            );
        } else {
            setTip(null);
        }
    }, [inspect]);

    const cancelDeploy = () => {
        setOpenDeployMenu(false);
        setY(0);
        setInspect(false);
    }

    return (
        <>
            { openDeployMenu ?
                <DeployMenu cardToDeploy={card} cancel={cancelDeploy} />
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
        </>
    );

}

export default HandHeldCard;