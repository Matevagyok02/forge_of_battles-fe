import {useState} from 'react'
import './App.css'
import {useAuth0} from "@auth0/auth0-react";
import Chat from "./components/Chat.tsx";
import Cards from "./components/Cards.tsx";

const App = () => {

    const apiUrl = import.meta.env.VITE_API_URL;

    const findUserById = async () => {
        try{
            const token = await getAccessTokenSilently();
            const response = (await fetch(
                `${apiUrl}user/${input ? input : defaultId}`,
                {headers: {Authorization: `Bearer ${token}`}}
            ));

            const responseBody = await response.json();

            if (response.status === 200) {
                setUserData(responseBody)
            } else {
                alert(responseBody.message);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const defaultId = 'google|145255'

    const [input, setInput] = useState('');
    const [userData, setUserData] = useState({username: "..."});

    const { isAuthenticated, user, loginWithPopup, logout, isLoading, getAccessTokenSilently} = useAuth0();

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
            <div>
                <div className="flex justify-between m-10">
                    <div>
                        <div className='input-container'>
                            <input type='text' placeholder='User ID' value={input} onChange={e => setInput(e.target.value)} />
                            <input type='button' value='Find user' onClick={findUserById}/>
                        </div>
                        <div className='card-container'>
                            <ul>
                                {userData && Object.entries(userData).map(([key, value]) =>
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <Chat/>
                </div>
                <Cards/>
            </div>
        </div>
    )
}

export default App
