import { getAxiosClients } from '../axios';

export const postContact = {
    api: '/channel-service/v1/contacts',
    get method() {
        return getAxiosClients().mIMBraceWebAPI.post;
    },
};

export const getRoom = {
    api: '/channel-service/v1/conversation',
    get method() {
        return getAxiosClients().mIMBraceWebAPI.get;
    },
};

export const getMessages = {
    api: '/channel-service/v1/conversation_messages?limit=1000&skip=0',
    get method() {
        return getAxiosClients().mIMBraceWebAPI.get;
    },
};

export const postMessages = {
    api: '/channel-service/v1/conversation_messages',
    get method() {
        return getAxiosClients().mIMBraceWebAPI.post;
    },
};

export const postAnswerMultipleChoice = {
    api: (messageId) => `/channel-service/v1/conversation_messages/${messageId}/answer`,
    get method() {
        return getAxiosClients().mIMBraceWebAPI.post;
    },
};

export const postPreSignURL = {
    api: '/channel-service/v1/files/_presign_url',
    get method() {
        return getAxiosClients().mIMBraceWebAPI.post;
    },
};

export const fileUploadImage = {
    api: '/channel-service/v1/conversation_messages/_fileupload',
    get method() {
        return getAxiosClients().mIMBraceWebUploadImage.post;
    },
};

export const memberInfo = {
    api: '/channel-service/v1/member_infos/{{user_id}}',
    get method() {
        return getAxiosClients().mIMBraceWebUploadImage.get;
    },
};

export const getChannel = {
    api: '/channel-service/v1/channels/{{channelId}}',
    get method() {
        return getAxiosClients().mIMBraceWebUploadImage.get;
    },
};
