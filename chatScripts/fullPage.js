(async () => {
    const response = await fetch('/config');
    const env = await response.json();

    const searchParams = new URL(window.location.href).searchParams;
    const imbraceChannelId = searchParams.get('channel_id');
    const IMBRACE_CHAT_WIDGET = 'imbrace-chat-widget';
    const keepMessageHistory = searchParams.get('keep_message_history') !== 'false';
    const additionalParams = searchParams.get('additional_params') || '';
    const keepMultipleChoiceButton = searchParams.get('keep_multiple_choice_button') !== 'false';
    const emoji = searchParams.get('emoji') !== 'false';
    const token = searchParams.get('token') || '';
    const orgId = searchParams.get('org_id') || '';

    const iframeActionTypes = {
        CLOSE_WIDGET: 'CLOSE_WIDGET',
        OPEN_WIDGET: 'OPEN_WIDGET',
        GET_OPTIONS: 'GET_OPTIONS',
        GET_CHANNEL: 'GET_CHANNEL',
    };

    const host = env.VITE_APP_CHAT_WIDGET_HOST || 'http://localhost:3002';

    if (imbraceChannelId) {
        const widgetFrame = document.createElement('iframe');
        widgetFrame.id = IMBRACE_CHAT_WIDGET;
        widgetFrame.dataset.channelId = imbraceChannelId;
        widgetFrame.dataset.keepMessageHistory = keepMessageHistory;
        widgetFrame.dataset.keepMultipleChoiceButton = keepMultipleChoiceButton;
        widgetFrame.dataset.additionalParams = additionalParams;
        widgetFrame.dataset.emoji = emoji;
        widgetFrame.name = 'Imbrace Chat Widget';
        widgetFrame.src = `${host}?channel_id=${imbraceChannelId}&defaultOpen=true&keep_message_history=${keepMessageHistory}&keep_multiple_choice_button=${keepMultipleChoiceButton}&additional_params=${additionalParams}&emoji=${emoji}${token ? `&token=${encodeURIComponent(token)}` : ''}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ''}`;
        widgetFrame.sandbox = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation';
        widgetFrame.setAttribute('scrolling', 'no');
        widgetFrame.setAttribute('frameborder', '0');
        widgetFrame.setAttribute('allowfullscreen', 'true');
        widgetFrame.setAttribute('allowtransparency', 'true');
        widgetFrame.setAttribute('title', IMBRACE_CHAT_WIDGET);

        const iframeReducer = (event) => {
            const { origin, action, channelId, payload } = event.data;
            if (origin !== IMBRACE_CHAT_WIDGET || imbraceChannelId !== channelId) return;

            const iframe = document.getElementById(IMBRACE_CHAT_WIDGET);
            if (!iframe) return;

            switch (action) {
                case iframeActionTypes.GET_OPTIONS:
                    event.source.postMessage({
                        action: iframeActionTypes.GET_OPTIONS,
                        defaultOpen: true,
                        closeable: false,
                        hideCloseButton: true,
                        removeBorderRadius: true,
                        origin: IMBRACE_CHAT_WIDGET,
                        channelId: imbraceChannelId,
                        keepMessageHistory,
                        additionalParams,
                        keepMultipleChoiceButton,
                        emoji,
                        token,
                        orgId,
                    }, { targetOrigin: event.origin });
                    break;

                case iframeActionTypes.GET_CHANNEL:
                    const { config } = payload;
                    if (config.window_logo) {
                        const link = document.querySelector("link[rel~='icon']");
                        link.href = config.window_logo;
                    }
                    if (config.window_name) {
                        document.title = config.window_name;
                    }
                    break;
            }
        };

        window.addEventListener('message', iframeReducer);
        document.body.appendChild(widgetFrame);
    }
})();
