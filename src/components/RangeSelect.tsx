import {FC, useEffect, useState} from "react";
import styles from "../styles/components/RangeSelect.module.css";

interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    default?: number;
    isMaxInfinite?: boolean;
    onChange: (value: number) => void;
}

const RangeSlider: FC<RangeSliderProps> = (props) => {

    const INFINITE = "∞";

    const getSteps = () => {
        const steps: number[] = [];

        for (let i = props.min; i <= props.max; i += props.step || 1) {
            steps.push(i);
        }

        return steps;
    }

    const steps = getSteps();

    const [activeStep, setActiveStep] = useState<number>(steps.indexOf(props.default || props.min));

    useEffect(() => {
        props.onChange(steps[activeStep]);
    }, [activeStep]);

    return(
        <div
            className={styles.slider}
            style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
            { steps.map((step, index) => {
                const text = step >= props.max && props.isMaxInfinite ? INFINITE : step
                const isInfinite = step >= props.max && props.isMaxInfinite;
                const isActive = activeStep === index;
                const select = () => {
                    setActiveStep(index);
                }

                return(
                    <span
                        onClick={select}
                        key={index}
                        className={`${styles.step} ${isInfinite ? styles.infinite : ""} ${isActive ? styles.active : ""}`}
                        data-content={text}
                    ></span>
                )
            })}
        </div>
    );
}

export default RangeSlider;