import axios from 'axios';
import { getEnv } from '../env';
import { mHandleNetworkError } from './error-interceptor';

let clients = null;

export const initAxiosClients = () => {
    const baseURL = getEnv().VITE_APP_API_HOST || '/api';

    const IMBraceWebAPI = axios.create({
        baseURL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const IMBraceWebUploadImage = axios.create({
        baseURL,
        timeout: 30000,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    IMBraceWebAPI.interceptors.response.use(mHandleNetworkError, (error) => Promise.reject(error));
    IMBraceWebUploadImage.interceptors.response.use(mHandleNetworkError, (error) => Promise.reject(error));

    // Add helpers
    IMBraceWebAPI.json = (url, params, config) => IMBraceWebAPI.post(url, params, getPostConfig(params, config));
    IMBraceWebUploadImage.json = (url, params, config) => IMBraceWebUploadImage.post(url, params, getPostConfig(params, config));

    clients = {
        mIMBraceWebAPI: IMBraceWebAPI,
        mIMBraceWebUploadImage: IMBraceWebUploadImage,
    };
};

export const getAxiosClients = () => {
    if (!clients) {
        throw new Error('Axios clients not initialized. Call initAxiosClients() first.');
    }
    return clients;
};

function getPostConfig(params, config) {
    const defaultConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
        transformRequest(data, requestConfig) {
            if (Object.prototype.toString.call(params) === '[object Array]') {
                return JSON.stringify(params);
            }
            return JSON.stringify(data);
        },
    };
    return Object.assign(defaultConfig, config);
}
