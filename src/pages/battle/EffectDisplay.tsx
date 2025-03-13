import {FC, useContext} from "react";
import styles from "./ActiveEffects.module.css";
import {AttributeModifierAbility, CostModifierAbility, IAbility, IMatch} from "../../interfaces.ts";
import {MatchContext} from "../../context.tsx";
import {AbilitySubtype} from "../addCard/AddCard.tsx";
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
                default: break;
            }

            return stylesClasses.join(" ");
        }

        return(
            <div className={getEffectIconClass()} >
                <p>
                    <FormatAbilityText text={effect.description} />
                </p>
            </div>
        )
}

export default EffectDisplay;