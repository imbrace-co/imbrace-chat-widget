import { getEnv } from '../env.js';

export const getApiHost = () => {
    console.log('Runtime VITE_APP_API_HOST:', env.VITE_APP_API_HOST);
    return getEnv().VITE_APP_API_HOST || '/api';
};

export const IMBRACE_WEB_API = getApiHost;
export const SOCKET_ENDPOINT = getApiHost;
