import {forwardRef, useCallback, useImperativeHandle, useRef, useState} from "react";
import Animations from "./animations/Animations.ts";
import styles from "../../styles/battle_page/Battle.module.css";

export interface EventDisplayHandle {
    displayText: (text: string, alert?: boolean) => void;
}

const EventDisplay = forwardRef((_, ref) => {

    const [text, setText] = useState<string>();
    const [isAlert, setIsAlert] = useState<boolean>(false);
    const displayRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
        displayText: displayText
    }));

    const displayText = useCallback((text: string, alert = false) => {
        if (displayRef.current) {
            setText(text);
            setIsAlert(alert)
            Animations.eventDisplayAppear(displayRef.current!);
        }
    }, [displayRef]);

    return(
        <div
            className={`${styles.eventDisplay} ${isAlert ? styles.alert : ""}`}
            ref={displayRef}
        >
            <p>
                {text}
            </p>
        </div>
    )
});

export default EventDisplay;