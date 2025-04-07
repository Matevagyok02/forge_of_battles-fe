import './styles/index.css';
import "./custom-elements.d.ts";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import {Auth0Provider} from "@auth0/auth0-react";
import config from "../auth.config.json";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const rootElement = document.getElementById('root');

const queryClient = new QueryClient();

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
                <QueryClientProvider client={queryClient} >
                    <App />
                </QueryClientProvider>
            </Auth0Provider>
        </StrictMode>
    );
} else {
    console.error('Root element not found');
}
