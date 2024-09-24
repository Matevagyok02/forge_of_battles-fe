import {useState} from "react";

const Cards = () => {

    const defCards = [
        {
            name: "deck 1",
            color: "red"
        },
        {
            name: "deck 2",
            color: "blue"
        },
        {
            name: "deck 3",
            color: "gray"
        }
    ];
    const [cards, setCards] = useState(defCards);

    const rotateCards = () => {
        setCards((prevCards) => {
            const tempCards = [...prevCards];

            const lastCard = tempCards.pop();
            if (lastCard) {
                tempCards.unshift(lastCard);
            }

            return tempCards;
        });
    }

    return(
        <div>
            <div className='cards'>
                <ul>
                    { cards.map((c, index) => {
                        return(
                            <li key={c.name} style={{backgroundColor: c.color}} className={`card-${index}`}>
                                <label>{c.name}</label>
                                <span></span>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <button className="w-full" onClick={rotateCards}>
                Rotate
            </button>
        </div>
    )
}

export default Cards;