import {MutableRefObject, useRef, useState} from 'react'
import './App.css'
import {useAuth0} from "@auth0/auth0-react";
import Chat from "./components/Chat.tsx";
import Frame from "./components/Frame.tsx";
import Button from "./components/Button.tsx";

const App = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const defaultPath = "test";

    const [path, setPath] = useState('');
    const [body, setBody] = useState('');
    const [method, setMethod] = useState("GET");
    const { isAuthenticated, user, loginWithPopup, logout, isLoading, getAccessTokenSilently} = useAuth0();

    const sendRequest = async () => {
        const requestInit: RequestInit = {
            headers: {},
            method: "GET"
        };

        try{
            let token;
            token = isAuthenticated ? await getAccessTokenSilently() : undefined;

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

    const card = useRef<HTMLDivElement | undefined>() as MutableRefObject<HTMLDivElement>;

    // const attack = () => {
    //     const element: HTMLDivElement | undefined =  card.current;
    //
    //     if (element) {
    //         element.classList.remove("attack")
    //         setTimeout(() => element.classList.add("attack"), 100);
    //     }
    // }

    return(
        <div id='body'>
            <header>
                { !isLoading &&
                    <>
                        { !isAuthenticated ?
                            <Button text="Log In" onClick={() => loginWithPopup()} />
                            :
                            <>
                                <Button text="Log Out" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} />
                                { user &&
                                    <span>
                                        <label className="text-white" >
                                            {user.sub}
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

                            <input type='button' value='Send request' onClick={sendRequest}/>
                        </div>
                    </div>
                </div>
                <Chat/>
                <div className="p-10 flex items-stretch gap-10">
                    <div className="flex flex-col justify-between" >
                        <Button text="Button 0" />
                        <Button text="Button 1" />
                        <Button text="Button 2" />
                        <Button text="Button 3" />
                    </div>
                    <div ref={card} >
                        <Frame>
                            <div className="p-3 bg-black flex justify-center">
                                <p className="text-xl h-fit">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Donec in eros vitae magna ultricies bibendum eu quis erat.
                                    Nunc efficitur turpis id nisi imperdiet, porttitor efficitur augue dapibus.
                                    Curabitur id mauris ac sem porttitor sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Morbi lobortis iaculis malesuada. Pellentesque vitae finibus augue.
                                    Curabitur tempus tincidunt tortor egestas pulvinar. Mauris faucibus interdum massa ut imperdiet.
                                    Praesent dictum aliquet consectetur. Mauris ut nulla risus.
                                </p>
                            </div>
                        </Frame>
                    </div>
                </div>
                {/*<FriendRequest />*/}
                {/*<Cards/>*/}
            </div>
        </div>
    )
}

export default App