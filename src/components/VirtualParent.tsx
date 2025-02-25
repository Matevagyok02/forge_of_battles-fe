import {CSSProperties, FC, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";

const VirtualParent: FC<{
    virtualParent: HTMLElement,
    actualParent: HTMLElement,
    children: ReactNode
}> = ({ virtualParent, actualParent, children }) => {

    const [styles, setStyles] = useState<CSSProperties>();

    const genStyles = (virtualParent: HTMLElement) => {
        if (virtualParent) {
            const rect = virtualParent.getBoundingClientRect();

            setStyles({
                position: "fixed",
                top: rect.top + "px",
                left: rect.left + "px",
                width: rect.width + "px",
                height: rect.height + "px"
            } as CSSProperties);
        }
    }

    useEffect(() => {
        genStyles(virtualParent);
    }, [virtualParent]);

    useEffect(() => {
        const handleResize = () => {
            genStyles(virtualParent);
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [virtualParent]);

    return virtualParent && actualParent && styles && createPortal(<div style={styles}>{children}</div>, actualParent);
}

export default VirtualParent;