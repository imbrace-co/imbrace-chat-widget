import { getAxiosClients } from './index';
import { isNullString } from '../helpers/string';


const GET = 'GET';
const POST = 'POST';
const DELETE = 'DELETE';
const PATCH = 'PATCH';
const PUT = 'PUT';

async function callAxios(axios, api, params, header, method) {
    if (method === DELETE) {
        const config = {
            data: params,
            headers: header,
            // withCredentials: true,
        };

        return axios.method(api, config);
    } else if (method === GET) {
        const config = {
            params,
            headers: header,
            // withCredentials: true,
        };

        return axios.method(api, config);
    }

    return axios.method(api, params, {
        headers: header,
    });
}

export async function webClientAPI(apiData, api, parameters) {
    const { mIMBraceWebAPI, mIMBraceWebUploadImage } = getAxiosClients();
    let method = POST;

    if (apiData.method === mIMBraceWebAPI.get || apiData.method === mIMBraceWebUploadImage.get) {
        method = GET;
    } else if (apiData.method === mIMBraceWebUploadImage.delete || apiData.method === mIMBraceWebAPI.delete) {
        method = DELETE;
    } else if (apiData.method === mIMBraceWebUploadImage.patch || apiData.method === mIMBraceWebAPI.patch) {
        method = PATCH;
    } else if (apiData.method === mIMBraceWebUploadImage.put || apiData.method === mIMBraceWebAPI.put) {
        method = PUT;
    }

    const header = {};
    const params = new URLSearchParams(document.location.search);
    const channelId = params.get('channel_id');
    const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');

    const token = params.get('token') || channelInfo.token;
    const accessToken = channelInfo.access_token || token;
    const organizationId = params.get('org_id') || channelInfo.organization_id;

    if (!isNullString(token)) {
        header['Authorization'] = `Bearer ${token}`;
    }

    if (!isNullString(accessToken)) {
        header['X-Access-Token'] = accessToken;
    }

    if (!isNullString(organizationId)) {
        header['x-organization-id'] = organizationId;
    }

    return callAxios(apiData, api, parameters, header, method);
}
