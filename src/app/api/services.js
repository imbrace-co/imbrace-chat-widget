import { webClientAPI } from '../axios/common-handle';

import * as API from './path';

export async function call(apiModel, params, successCallback, failCallback) {
    let api = apiModel.api;

    if (api === API.getChannel.api) {
        api = api.replace('{{channelId}}', params);
    }

    try {
        const response = await webClientAPI(apiModel, api, params);

        // console.log(`response.data for ${api} = `, response.data);

        if (successCallback) {
            successCallback(response);
        }
    } catch (error) {
        console.log(`error for ${api} = `, error);

        if (failCallback) {
            failCallback(error);
        }
    }
}
