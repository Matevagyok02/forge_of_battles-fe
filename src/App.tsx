import { useState } from 'react'
import './App.css'

function App() {

    const findCardById = async () => {
        try{

            const response = (await fetch(
                `https://forge-of-battles-be.onrender.com/${input}`
            ));

            const responseBody = await response.json();

            if (response.status === 200) {
                setCard(responseBody)
            } else {
                alert(responseBody.message);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const c = {
        name: "---",
        attack: 0,
        defence: 0
    }

    const [input, setInput] = useState('');
    const [card, setCard] = useState(c);

    return(
        <div className='container'>
            <div className='input-container'>
                <input type='text' placeholder='Card ID' value={input} onChange={e => setInput(e.target.value)} />
                <input type='button' value='Find this card' onClick={findCardById}/>
            </div>
            <div className='card-container'>
                <ul>
                    {card && Object.entries(card).map(([key, value]) =>
                        <li key={key}>
                            {key}: {value}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default App
