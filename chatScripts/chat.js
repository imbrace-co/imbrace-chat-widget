(() => {
    const imbraceWidgetScriptTag =
        document.currentScript || document.querySelector('script[data-channelid][data-id="imbracechatwidget"]');
    const imbraceChannelId = imbraceWidgetScriptTag.getAttribute('data-channelid');
    const keepMessageHistory = imbraceWidgetScriptTag.getAttribute('data-keep-message-history') === 'false' ? false : true;
    const additionalParams = imbraceWidgetScriptTag.getAttribute('data-additional-params') || '';
    const keepMultipleChoiceButton = imbraceWidgetScriptTag.getAttribute('data-keep-multiple-choice-button') === 'false' ? false : true;
    const emoji = imbraceWidgetScriptTag.getAttribute('data-emoji') === 'false' ? false : true;
    const iFrameId = imbraceWidgetScriptTag.getAttribute('data-id');
    const wLoadDelay = 2000;
    const IMBRACE_CHAT_WIDGET = 'imbrace-chat-widget';

    const iframeActionTypes = {
        CLOSE_WIDGET: 'CLOSE_WIDGET',
        OPEN_WIDGET: 'OPEN_WIDGET',
        GET_OPTIONS: 'GET_OPTIONS',
        SHOW_LATEST_MESSAGE: 'SHOW_LATEST_MESSAGE',
    };

    const iframeSize = {
        icon: {
            width: 70,
            height: 70,
        },
        chatWindow: {
            width: 470,
            height: 550,
        },
    };

    setTimeout(() => {
        fetch('/config')
            .then((res) => res.json())
            .then((env) => {
                const host = env.VITE_APP_CHAT_WIDGET_HOST || 'https://chat-widget.imbrace.co';

                const widgetFrame = document.createElement('iframe');
                widgetFrame.id = iFrameId;
                widgetFrame.dataset.channelId = imbraceChannelId;
                widgetFrame.dataset.keepMessageHistory = keepMessageHistory;
                widgetFrame.dataset.keepMultipleChoiceButton = keepMultipleChoiceButton;
                widgetFrame.dataset.additionalParams = additionalParams;
                widgetFrame.dataset.emoji = emoji;
                widgetFrame.name = 'Imbrace Chat Widget';
                widgetFrame.src = `${host}?channel_id=${imbraceChannelId}&parentUrl=${encodeURIComponent(
                    window.location.href,
                )}&keep_message_history=${keepMessageHistory}&keep_multiple_choice_button=${keepMultipleChoiceButton}&additional_params=${additionalParams}&emoji=${emoji}`;
                widgetFrame.style = `
                    border: none;
                    overflow: hidden;
                    position: fixed;
                    width: 70px;
                    height: 70px;
                    right: 10px;
                    bottom: 10px;
                    transition: all 0.2s ease-in-out 0s;
                    z-index: 99999; 
                `;
                widgetFrame.sandbox =
                    'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation';
                widgetFrame.setAttribute('scrolling', 'no');
                widgetFrame.setAttribute('frameborder', '0');
                widgetFrame.setAttribute('allowfullscreen', 'true');
                widgetFrame.setAttribute('allowtransparency', 'true');
                widgetFrame.setAttribute('title', 'imbrace-chat-widget');

                const iframeReducer = (event) => {
                    const { origin, action, channelId } = event.data;

                    if (origin !== IMBRACE_CHAT_WIDGET || imbraceChannelId !== channelId) {
                        return;
                    }
                    const iframe = document.querySelector(`#${iFrameId}[data-channel-id=${imbraceChannelId}]`);

                    switch (action) {
                        case iframeActionTypes.OPEN_WIDGET:
                        case iframeActionTypes.SHOW_LATEST_MESSAGE: {
                            iframe.style.width = `calc(100vw - 20px)`;
                            iframe.style.height = `calc(100vh - 20px)`;
                            iframe.style.maxWidth = `${iframeSize.chatWindow.width}px`;
                            iframe.style.maxHeight = `${iframeSize.chatWindow.height}px`;
                            iframe.style.boxShadow = '0 1px 8px rgb(189 189 189 / 8%), 0 2px 16px rgb(224 224 224 / 20%)';
                            break;
                        }

                        case iframeActionTypes.CLOSE_WIDGET: {
                            iframe.style.width = `${iframeSize.icon.width}px`;
                            iframe.style.height = `${iframeSize.icon.height}px`;
                            iframe.style.boxShadow = '';
                            break;
                        }

                        case iframeActionTypes.GET_OPTIONS: {
                            event.source.postMessage(
                                {
                                    defaultOpen: true,
                                    closeable: true,
                                    origin: IMBRACE_CHAT_WIDGET,
                                    channelId: imbraceChannelId,
                                    keepMessageHistory,
                                    additionalParams,
                                    keepMultipleChoiceButton,
                                    emoji,
                                    action: iframeActionTypes.GET_OPTIONS,
                                },
                                event.origin,
                            );
                            break;
                        }

                        default:
                            break;
                    }
                };

                window.addEventListener('message', iframeReducer);

                try {
                    widgetFrame.appendChild(document.createTextNode(''));
                    document.body.appendChild(widgetFrame);
                } catch (e) {
                    widgetFrame.text = '';
                }
            })
            .catch((err) => {
                console.error('Failed to load /config', err);
            });
    }, wLoadDelay);
})();
