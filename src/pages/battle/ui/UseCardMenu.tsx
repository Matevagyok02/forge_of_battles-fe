import {FC, useCallback, useContext, useEffect, useState} from "react";
import SelectSacrifice from "./SelectSacrifice.tsx";
import {MatchContext} from "../../../context.tsx";
import {ICard, IPlayerState} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import {MultipleOptionsButton, OptionButton} from "../../../components/Button.tsx";
import BattlePortalWrap from "../../../components/BattlePortalWrap.tsx";
import {OutgoingBattleEvent} from "../Battle.tsx";
import BattleInterfaceOverlay from "../../../components/BattleInterfaceOverlay.tsx";
import { not_enough_mana, sacrifice_if_no_mana } from "../../../assets/tips.json";
import { use_action, deploy_card, select_sacrifice } from "../../../assets/hints.json";

const UseCardMenu: FC<{ card: ICard, cancel: () => void }> = ({  card, cancel}) => {

    const { socket, player, setTip } = useContext(MatchContext);

    const [sacrificeCards, setSacrificeCards] = useState<string[]>([]);
    const [openSelectSacrifice, setOpenSelectSacrifice] = useState<boolean>(false);
    const [openUseActionMenu, setOpenUseActionMenu] = useState<boolean>(false);

    const [useActionOptions, setUseActionOptions] = useState<OptionButton[]>([]);
    const [deployOptions, setDeployOptions] = useState<OptionButton[]>([]);

    const deployCard = useCallback(() => {
        if (sacrificeCards.length + player.mana >= card.cost) {
            const data = {
                cardId: card.id,
                sacrificeCards
            };

            socket.emit(OutgoingBattleEvent.deploy, data);
            cancel();
        }
    }, [sacrificeCards, player?.mana]);

    const useAction = useCallback(() => {
        if (sacrificeCards.length + player.mana >= card.cost) {
            const data = {
                cardId: card.id,
                args: { useAsMana: sacrificeCards }
            };

            socket.emit(OutgoingBattleEvent.useAction, data);
            cancel();
        }
    }, [player.mana, sacrificeCards]);

    const handleUseActionClick = () => {
        if (card.actionAbility.requirements) {
            setOpenUseActionMenu(true);
        } else {
            useAction();
        }
    }

    const generateDeployOptions = (player: IPlayerState, sacrifice: number) => {
        const options: OptionButton[] = [];
        const canDeploy = player.mana + player.onHand.length > card.cost;

        if (sacrifice + player.mana >= card.cost) {
            let cost = "";

            if (card.cost > 0) {
                cost += " for ";

                if (sacrifice > 0) {
                    cost += `${sacrifice} #sacrifice`;
                    cost+= card.cost - sacrifice > 0 ? ` ${card.cost - sacrifice}#mana` : "";
                } else {
                    cost += ` ${card.cost} #mana`;
                }
            }

            if (!player.deployedCards.defender) {
                options.push({
                    text: "Deploy" + cost,
                    callback: deployCard,
                    hint: deploy_card
                });
            }

            options.push({
                text: "Use Action" + cost,
                callback: handleUseActionClick,
                hint: use_action
            });
        } else {
            if (canDeploy) {
                setTip(sacrifice_if_no_mana);
            } else {
                setTip(not_enough_mana);
            }
        }

        if (canDeploy && player.onHand.length > 1 && card.cost > 0) {
            options.push({
                text: `${sacrifice > 0 ? "Change" : "Select"} Sacrifice`,
                callback: () => setOpenSelectSacrifice(true),
                hint: select_sacrifice
            });
        }

        options.push({
            text: "Cancel",
            callback: cancel
        });

        setDeployOptions(options);
    }

    const generateUseActionOptions = () => {
        const options: OptionButton[] = [];

        options.push({
            text: "Cancel",
            callback: () => setOpenUseActionMenu(false)
        });

        setUseActionOptions(options);
    }

    useEffect(() => {
        generateDeployOptions(player, sacrificeCards.length);
        generateUseActionOptions();
    }, [player.onHand, player.mana, sacrificeCards]);

    return (
        !openSelectSacrifice ?
            <BattlePortalWrap>
                <BattleInterfaceOverlay>
                    <div className="flex gap-4 justify-center items-center" >
                        <div className="flex justify-center" >
                            <div className={"card-large card"} >
                                <CardContent card={card} />
                            </div>
                        </div>
                        <MultipleOptionsButton options={openUseActionMenu ? useActionOptions : deployOptions} />
                    </div>
                </BattleInterfaceOverlay>
            </BattlePortalWrap>
            :
            <SelectSacrifice
                cardToBeUsed={card.id}
                setSacrifice={setSacrificeCards}
                cancel={() => setOpenSelectSacrifice(false)}
            />
    );
}

export default UseCardMenu;