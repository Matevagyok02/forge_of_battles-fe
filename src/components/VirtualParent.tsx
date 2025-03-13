import {CSSProperties, FC, ReactNode, useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {MatchContext} from "../context.tsx";
import {parseElementRectStyles} from "../utils.ts";

const VirtualParent: FC<{
    virtualParent: Element,
    children: ReactNode
}> = ({ virtualParent, children }) => {

    const [styles, setStyles] = useState<CSSProperties>();
    const actualParent = useContext(MatchContext).containerRef;

    useEffect(() => {
        setStyles(parseElementRectStyles(virtualParent));

        const handleResize = () => {
            setStyles(parseElementRectStyles(virtualParent));
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [virtualParent]);

    return virtualParent && actualParent && styles && createPortal(
        <div style={styles} className="pointer-events-none" >
            {children}
        </div>,
        actualParent
    );
}

export default VirtualParent;