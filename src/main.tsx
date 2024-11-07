import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import {Auth0Provider} from "@auth0/auth0-react";
import config from "../auth.config.json";

const rootElement = document.getElementById('root');

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <Auth0Provider
                domain={config.domain}
                clientId={config.clientId}
                cacheLocation="localstorage"
                authorizationParams={{
                    audience: config.audience,
                    redirect_uri: window.location.origin
                }}
            >
                <App />
            </Auth0Provider>
        </StrictMode>
    );
} else {
    console.error('Root element not found');
}
