import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './app/index';
import { StateProvider } from './app/store/StateProvider';
import reportWebVitals from './reportWebVitals';
import { loadRuntimeEnv } from './app/env';
import { initAxiosClients } from './app/axios'; // ✅ Import it

loadRuntimeEnv().then(() => {
    initAxiosClients();

    ReactDOM.render(
        <React.StrictMode>
            <StateProvider>
                <App />
            </StateProvider>
        </React.StrictMode>,
        document.getElementById('root'),
    );
});

reportWebVitals();
