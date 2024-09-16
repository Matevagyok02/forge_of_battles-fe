import { useState } from 'react'
import './App.css'
import {useAuth0} from "@auth0/auth0-react";

function App() {

    const findCardById = async () => {
        try{

            const response = (await fetch(
                `https://forge-of-battles-be.onrender.com/${input ? input : defaultCardId}`
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

    const defaultCardId = '66e16221585be058e8f9dfa7'

    const [input, setInput] = useState('');
    const [card, setCard] = useState(c);

    const { isAuthenticated, user, loginWithPopup, logout, isLoading} = useAuth0();

    return(
        <div id='body'>
            <header>
                { !isLoading &&
                    <>
                        { !isAuthenticated ?
                            <button onClick={() => loginWithPopup()}>
                                Log In
                            </button>
                            :
                            <>
                                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                                    Log Out
                                </button>
                                { user &&
                                    <span>
                                        <label>
                                            {user.name}
                                        </label>
                                        <img src={user.picture} alt=''/>
                                    </span>
                                }
                            </>
                        }
                    </>
                }
            </header>
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
        </div>
    )
}

export default App
