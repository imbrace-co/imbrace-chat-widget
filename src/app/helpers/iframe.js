import { origin } from '../constants/iframe';

export const iframeDispatch = (action, payload) => {
    const params = new URLSearchParams(document.location.search);
    // to control anything about the iframe, use this function
    window.parent.postMessage(
        {
            origin, // iframe will validate if the command dispatched from react-app is "imbrace-chat-widget", to makesure iframe is being controlled by our react app only
            channelId: params.get('channel_id'),
            action: action, // define the action we want to do on the iframe
            payload: payload, // the data payload we want to pass to iframe
        },
        '*',
    );
};

export const handleSendMessageHelper = (postMessageVal, messageNoti) => {
    try {
        window.parent.postMessage(postMessageVal, '*');
        console.log(messageNoti?.success || '✅ postMessage to parent was sent.', postMessageVal?.payload);
    } catch (err) {
        console.error(messageNoti?.fail || '❌ postMessage to parent was fail:', err);
    }
};
