import {FC, ReactNode} from "react";

const BattleInterfaceOverlay: FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <div className="battle-overlay" >
            {children}
        </div>
    );
}

export default BattleInterfaceOverlay;