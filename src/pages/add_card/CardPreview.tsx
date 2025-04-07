import {FC} from "react";
import {ICard} from "../../interfaces.ts";
import CardContent from "../battle/cards/CardContent.tsx";
import cardStyles from "../../styles/battle_page/Cards.module.css";

const CardPreview: FC<{ card?: ICard }> = ({ card }) => {

    return(card &&
        <div className={`${cardStyles.card} ${cardStyles.large}`} >
            <CardContent card={card} />
        </div>
    );
}

export default CardPreview;