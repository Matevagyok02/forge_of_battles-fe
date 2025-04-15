import {FC, useContext, useEffect, useState} from "react";
import {ICard, IPlayerState, RequirementArgs} from "../../../interfaces.ts";
import CardContent from "../cards/CardContent.tsx";
import {MatchContext} from "../../../context.tsx";
import PortalWrap from "../components/PortalWrap.tsx";
import {Icon, IconButton, MultipleOptionsButton, OptionButton} from "../../../components/Button.tsx";
import SelectSacrifice from "./SelectSacrifice.tsx";
import {OutgoingBattleEvent} from "../Battle.tsx";
import MenuOverlay from "../components/MenuOverlay.tsx";
import { sacrifice_to_use_passive, not_enough_mana_to_use_passive } from "../../../assets/tips.json";
import { select_sacrifice, use_passive } from "../../../assets/hints.json";
import styles from "../../../styles/battle_page/Cards.module.css";

const InspectCard: FC<{ card: ICard, slot: string, owner: number, cancel: () => void }> = ({ card, slot, owner, cancel }) => {

    useEffect(() => {
        document.onkeydown = (e => {
            if (e.key === "Escape") {
                cancel();
            }
        });

        return () => {
            document.onkeydown = null;
        }
    }, []);

    const [options, setOptions] = useState<OptionButton[]>();
    const [sacrificeCards, setSacrificeCards] = useState<string[]>([]);
    const [openSelectSacrifice, setOpenSelectSacrifice] = useState<boolean>(false);
    const { player, socket, setTip } = useContext(MatchContext);

    const generateOptions = (playerState: IPlayerState, sacrifice: number) => {
        if (playerState.turnStage !== 1 || owner !== 1) return undefined;

        const options: OptionButton[] = [];
        const { manaCost, discardCost } = getAbilityUsageCost();
        const canPayCost = playerState.mana + playerState.onHand.length > manaCost &&
            (!discardCost || Object.keys(playerState.deployedCards).length > 0);

        if (sacrifice + playerState.mana >= manaCost) {
            let cost = "";

            if (manaCost > 0) {
                cost += " for ";

                if (sacrifice > 0) {
                    cost += `${sacrifice > manaCost ? manaCost : sacrifice} #sacrifice`;
                    cost += manaCost - sacrifice > 0 ? ` ${manaCost- sacrifice}#mana` : "";
                } else {
                    cost += ` ${manaCost} #mana`;
                }
            }

            options.push({
                text: "Use Ability" + cost,
                callback: () => handleUseAbilityClick(manaCost),
                hint: use_passive
            });
        } else {
            if (canPayCost) {
                setTip(sacrifice_to_use_passive);
            } else {
                setTip(not_enough_mana_to_use_passive);
            }
        }

        if (canPayCost && player && player.onHand.length > 1 && manaCost > 0) {
            options.push({
                text: `${sacrifice > 0 ? "Change" : "Select"} Sacrifice`,
                callback: () => setOpenSelectSacrifice(true),
                hint: select_sacrifice
            });
        }

        if (options.length > 0) {
            options.push({
                text: "Cancel",
                callback: cancel
            });

            return options;
        } else {
            return undefined;
        }
    }

    const handleUseAbilityClick = (manaCost: number) => {
        if (socket && player && sacrificeCards.length + player.mana >= card.cost) {
            const data: { pos: string, args?: RequirementArgs } = { pos: slot };

            if (sacrificeCards && manaCost > 0) {
                const _sacrificeCards = sacrificeCards.length <= manaCost ? sacrificeCards : sacrificeCards.slice(0, manaCost)
                data.args = { useAsMana: _sacrificeCards };
            }

            socket.emit(OutgoingBattleEvent.usePassive, data);
            cancel();
        }
    }

    useEffect(() => {
        if (player) {
            setOptions(generateOptions(player, sacrificeCards.length));
        }
    }, [player, sacrificeCards]);

    const getAbilityUsageCost = (): { manaCost: number, discardCost: boolean } => {
        const ability = card.passiveAbility;
        let mana = 0;
        let discard = false;

        if (ability.requirements) {
            if (ability.requirements.mana) {
                mana = ability.requirements.mana;
            }
            if (ability.requirements.sacrifice) {
                discard = ability.requirements.sacrifice;
            }
        }

        return { manaCost: mana, discardCost: discard };
    }

    return( !openSelectSacrifice ?
            <PortalWrap>
                <MenuOverlay>
                    <menu className={`${styles.inspect} ${ options ? "" : "flex-col items-center" }`} >
                        <div className={styles.card} >
                            <CardContent card={card} showModifiedAttributes />
                        </div>
                        { options ?
                            <MultipleOptionsButton options={options} />
                            :
                            <div className={styles.closeButton} >
                                <IconButton icon={Icon.cancel} text={"Close"} onClick={cancel} />
                            </div>
                        }
                    </menu>
                </MenuOverlay>
            </PortalWrap>
            :
            <SelectSacrifice
                setSacrifice={setSacrificeCards}
                cancel={() => setOpenSelectSacrifice(false)}
            />
    );
}

export default InspectCard;