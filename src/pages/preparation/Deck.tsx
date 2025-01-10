import "./deck.css";
import {FC} from "react";

const Deck: FC<{
    name: string,
    id: string,
    pos: string,
    animation: string,
    onClick: (pos: string) => void
}> = ({name, id, pos, animation, onClick}) => {

    return(
        <div id={id} className={`deck ${animation} ${pos}`} onClick={() => onClick(pos)} >
            <span>
                <h1 className="gold-text select-none" >{name}</h1>
            </span>
        </div>
    );
}

export default Deck;