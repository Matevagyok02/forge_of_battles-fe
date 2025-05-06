import card_anatomy from "../../../assets/tutorial_images/card_anatomy.png"
import styles from "../../../styles/rules_page/Rules.module.css";
import {FC} from "react";

const cardAnatomyDescriptions = [
    {
         title: "Name",
         description: "This field simply holds the name of the card. The name helps memorize the card and its attributes and it can have an important role in the case of a few abilities."
    },
    {
         title: "Cost",
         description: "The cost of the card must be paid in order to play it. This can be done using your Mana or by sacrificing cards from your hand."
    },
    {
         title: "Attack",
         description: "This value is used to calculate the damage you deal to your opponent when you attack your opponent at engagements. The effect of some abilities is also determined by this value."
    },
    {
         title: "Defense",
         description: "This value is used to calculate the damage you take when your opponent attacks you at engagements. The effect of some abilities is also determined by this value."
    },
    {
         title: "Action",
         description: "An ability which takes effect immediately when it is used. It is automatically activeted when you attack your opponent, but it can also be used manually by paying the cost of the card."
    }
    ,
    {
        title: "Passive",
        description: "This ability can have 2 types. The first one is a free ability which is automatically activated when the card is deployed and it will remain active until the card is removed from the battlefield. The second one needs to be activated manually by paying the cost indicated in the description."
    }
];

const CardAnatomy: FC = () => {
   return(
       <div className={styles.cardAnatomy}>
           <img src={card_anatomy} alt={"Card Anatomy"} />
           <div>
               <ol>
                   {cardAnatomyDescriptions.map((item, index) => (
                       <li key={index}>
                           <p>
                               <span>{item.title}</span>
                               {item.description}
                           </p>
                       </li>
                   ))}
               </ol>
           </div>
       </div>
   );
}

export default CardAnatomy;