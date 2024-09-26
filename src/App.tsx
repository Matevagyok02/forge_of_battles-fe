import {useState} from 'react'
import './App.css'
import {useAuth0} from "@auth0/auth0-react";
import Chat from "./components/Chat.tsx";
import Cards from "./components/Cards.tsx";

const App = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const defaultPath = "test";

    const [path, setPath] = useState('');
    const [body, setBody] = useState('');
    const [method, setMethod] = useState("GET");

    const requestInit = {
        headers: {},
        method: "GET",
        body: ""
    };


    const findUserById = async () => {
        try{
            const token = await getAccessTokenSilently();
            requestInit.headers = { Authorization: "Bearer " + token };

            switch(method) {
                case "POST":
                    requestInit.headers = {
                        ...requestInit.headers,
                        "Content-Type": "application/json"
                    };
                    requestInit.method = "POST";
                    requestInit.body = body;
                    break;
                case "PUT":
                    requestInit.headers = {
                        ...requestInit.headers,
                        "Content-Type": "text/javascript"
                    };
                    requestInit.method = "PUT";
                    break;
                case "DELETE":
                    requestInit.headers = {
                        ...requestInit.headers,
                        "Content-Type": "text/javascript"
                    };
                    requestInit.method = "DELETE";
                    break;
                default:
                    requestInit.headers = {
                        ...requestInit.headers,
                        "Content-Type": "text/javascript"
                    };
                    requestInit.method = "GET";
                    break;
            }

            const response = await fetch(`${apiUrl}${path ? path : defaultPath}`, requestInit);

            const responseBody = await response.text();

            if (response.status === 200) {
                console.log(responseBody);
            } else {
                alert(responseBody);
            }

        } catch (error) {
            console.log(error);
        }
    }

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
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <input className="text-black" type='text' placeholder='request path' value={path} onChange={e => setPath(e.target.value)} />
                                </li>
                                <li>
                                    <input className="text-black" type='text' placeholder='request body (json)' value={body} onChange={e => setBody(e.target.value)} />
                                </li>
                                <li>
                                    <select className="text-white" name="request method" id="select" value={method} onChange={(e) => setMethod(e.target.value)}>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </li>
                            </ul>

                            <input type='button' value='Find user' onClick={findUserById}/>
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
