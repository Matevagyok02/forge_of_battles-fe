import {FC, useCallback, useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import SelectSacrifice from "./SelectSacrifice.tsx";
import {MatchContext} from "../../../Context.tsx";
import {ICard, IPlayerState} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import MultipleOptionsButton, {OptionButton} from "../../../components/MultipleOptionsButton.tsx";

const DeployMenu: FC<{ cardToDeploy: ICard, cancel: () => void }> = ({  cardToDeploy, cancel}) => {

    const { socket, player, setTip } = useContext(MatchContext);

    const [sacrificeCards, setSacrificeCards] = useState<string[]>([]);
    const [openSelectSacrifice, setOpenSelectSacrifice] = useState<boolean>(false);
    const [deployOptions, setDeployOptions] = useState<OptionButton[]>([]);

    const cancelSacrificeSelection = () => {
        setOpenSelectSacrifice(false);
        setSacrificeCards([]);
    }

    const deployCard = useCallback(() => {
        const data = {
            cardId: cardToDeploy.id,
            sacrificeCards
        };

        if (socket && sacrificeCards.length && player?.mana >= cardToDeploy.cost) {
            socket.emit("deploy", data);
        }
    }, [sacrificeCards]);

    const generateDeployOptions = (player: IPlayerState) => {
        const options: OptionButton[] = [];

        if (player?.onHand.length + player?.mana > cardToDeploy.cost) {
            options.push({
                text: "Deploy",
                callback: deployCard
            });
        } else {
            setTip("You have not enough mana nor sacrificable cards to deploy this card");
        }

        if (player?.onHand.length > 1) {
            options.unshift({
                text: "Sacrifice",
                callback: () => setOpenSelectSacrifice(true)
            });
        }

        options.push({
            text: "Cancel",
            callback: cancel
        });

        setDeployOptions(options);
    }

    useEffect(() => {
        if (player) {
            generateDeployOptions(player);
        }
    }, [player?.onHand, player?.mana]);

    return (
        !openSelectSacrifice ?
            createPortal(
                <div className="battle-overlay" >
                    <div className="flex gap-4 justify-center items-center" >
                        <div className="flex justify-center" >
                            <div className={"card-large card"} >
                                <CardContent card={cardToDeploy} />
                            </div>
                        </div>
                        <MultipleOptionsButton options={deployOptions} />
                    </div>
                </div>,
                document.getElementById("battle-container") as HTMLElement
            )
            :
            <SelectSacrifice
                cardToBeUsed={cardToDeploy.id}
                setSacrifice={setSacrificeCards}
                cancel={cancelSacrificeSelection}
            />
    );
}

export default DeployMenu;