import card_anatomy from "../../../assets/tutorial_images/card_anatomy.png"
import styles from "../../../styles/rules_page/Rules.module.css";

const CardAnatomy = () => {
   return(
       <div className={styles.cardAnatomy}>
           <img className="" src={card_anatomy} alt="Card Anatomy" />
       </div>
   );
}

export default CardAnatomy;