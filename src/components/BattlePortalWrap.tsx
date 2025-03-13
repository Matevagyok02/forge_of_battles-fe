import {FC, ReactNode, useContext} from "react";
import {MatchContext} from "../context.tsx";
import {createPortal} from "react-dom";

const BattlePortalWrap: FC<{ children: ReactNode }> = ({ children }) => {

    const { containerRef } = useContext(MatchContext);

    return (
        containerRef && createPortal(
            children,
            containerRef
        )
    );
}

export default BattlePortalWrap;