import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {Auth0Provider} from "@auth0/auth0-react";

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <Auth0Provider
            domain="dev-58nywxjmv52aaecl.eu.auth0.com"
            clientId="j3Cptk9wMBPOFDrwayCAwTPkaGdXBqf0"
            cacheLocation="localstorage"
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
        >
            <App />
        </Auth0Provider>
    </StrictMode>
);
