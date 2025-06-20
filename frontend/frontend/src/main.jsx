import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = "dev-o0c1d1uad7stpveq.eu.auth0.com";
const clientId = "6BTDt4Dpmx9EYgwBpwMsoY8UaZXuXxFn";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + "/callback"
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);