import {FC, useContext} from "react";
import styles from "../../styles/battle_page/EffectDisplay.module.css";
import {AttributeModifierAbility, CostModifierAbility, EventDrivenAbility, IAbility, IMatch} from "../../interfaces.ts";
import {MatchContext} from "../../context.tsx";
import {AbilitySubtype, AbilityUsageType, TriggerEvent} from "../add_card/AddCard.tsx";
import {FormatAbilityText} from "./cards/CardContent.tsx";

const EffectDisplay: FC = () => {

    const { match, player, opponent } = useContext(MatchContext);

    const getEffectsOfPLayer = (playerId: string, match: IMatch) => {
        return match.battle.abilities.activatedAbilities.filter(ability => ability.cardHolderId === playerId);
    }

    return( match && player?.userId && opponent?.userId &&
        <div className={styles.display} >
            <Effects effects={getEffectsOfPLayer(opponent.userId, match)} />
            <Effects effects={getEffectsOfPLayer(player.userId, match)} />
        </div>
    )
}

const Effects: FC<{ effects: IAbility[] }> = ({ effects }) => {

    return(
        <ul className={styles.effectList} >
            { effects.map((effect, index) =>
                <li key={index} >
                    <Effect effect={effect} />
                </li>
            )}
        </ul>
    )
}

const Effect: FC<{ effect: IAbility }> = ({ effect }) => {

        const getEffectIconClass = () => {
            const stylesClasses: string[] = [styles.effect];

            switch (effect.subtype) {
                case AbilitySubtype.attributeModifier: {
                    stylesClasses.push(styles.attribute);
                    const attrModEffect = effect as AttributeModifierAbility;

                    if (attrModEffect.attack > 0 || attrModEffect.defence > 0) {
                        stylesClasses.push(styles.buff);
                    } else {
                        stylesClasses.push(styles.debuff);
                    }

                    if (attrModEffect.targetPositions?.self.length > 0) {
                        stylesClasses.push(styles.self);
                    } else {
                        stylesClasses.push(styles.opponent);
                    }

                    break;
                }
                case AbilitySubtype.costModifier: {
                    stylesClasses.push(styles.cost);
                    const attrModEffect = effect as CostModifierAbility;

                    if (attrModEffect.deploy < 0 || attrModEffect.action < 0 || attrModEffect.passive < 0) {
                        stylesClasses.push(styles.buff);
                    } else {
                        stylesClasses.push(styles.debuff);
                    }
                    break;
                }
                case AbilitySubtype.instant: {
                    switch (effect.usageType) {
                        case AbilityUsageType.eventDriven: {
                            stylesClasses.push(styles.eventDriven);
                            const event = (effect as EventDrivenAbility).event[0];

                            switch (event) {
                                case TriggerEvent.deploy: stylesClasses.push(styles.deploy); break;
                                case TriggerEvent.draw: stylesClasses.push(styles.draw); break;
                                case TriggerEvent.turn: stylesClasses.push(styles.turn); break;
                                case TriggerEvent.discard: stylesClasses.push(styles.discard); break;
                                case TriggerEvent.cardDeath: stylesClasses.push(styles.cardDeath); break;
                                default: break;
                            }
                            break;
                        }
                        default: break;
                    }
                    break;
                }
                default: break;
            }

            return stylesClasses.join(" ");
        }

        return(
            <div className={getEffectIconClass()} >
                <div className={styles.description} >
                    <p>
                        <FormatAbilityText text={effect.description} />
                    </p>
                </div>
            </div>
        )
}

export default EffectDisplay;