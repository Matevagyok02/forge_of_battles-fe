import {FC, ReactNode} from "react";
import stlyes from "../../../styles/battle_page/Battle.module.css";

const MenuOverlay: FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <div className={stlyes.menuOverlay} >
            {children}
        </div>
    );
}

export default MenuOverlay;