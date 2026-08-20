import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material';

import { useStore } from './store/useStore';

import QuickReply from './components/quick-reply/QuickReply';
import Launcher from './components/Launcher';

import { tokenTypes } from './constants/token';
import './styles';
import defaultTheme from './styles/theme';
import { iframeDispatch } from './helpers/iframe';
import { actionTypes as iframeActionTypes } from './constants/iframe';
import { Helmet } from 'react-helmet';

const IMBRACE_CHAT_WIDGET = 'imbrace-chat-widget';

const App = () => {
    const {
        latestMessage,
        setMessageList,
        user,
        channelId,
        setUserList,
        setOptions,
        onOpenChatWidget,
        onCloseChatWidget,
        channel,
        options,
    } = useStore();

    const migrate = (channelId) => {
        if (!options.keepMessageHistory) {
            window.localStorage.removeItem(channelId);
            return;
        }
        const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');
        const oldChannelId = window.localStorage.getItem(tokenTypes.CHANNEL_ID);
        const oldOrgId = window.localStorage.getItem(tokenTypes.ORGANIZATION_ID);
        const token = window.localStorage.getItem(`${oldChannelId}${tokenTypes.CHANNEL_ID_TOKEN}`);
        if (token && oldChannelId === channelId) {
            window.localStorage.removeItem(tokenTypes.ORGANIZATION_ID);
            window.localStorage.removeItem(tokenTypes.CHANNEL_ID);
            window.localStorage.removeItem(`${channelId}${tokenTypes.CHANNEL_ID_TOKEN}`);
            window.localStorage.setItem(
                channelId,
                JSON.stringify({ ...channelInfo, channel_id: channelId, organization_id: oldOrgId, token }),
            );
        } else {
            window.localStorage.setItem(channelId, JSON.stringify({ ...channelInfo, channel_id: channelId }));
        }
    };

    useEffect(() => {
        const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');

        if (channelInfo.token) {
            onOpenChatWidget(false);
        }
    }, [channelId, onOpenChatWidget]);

    useEffect(() => {
        if (latestMessage) {
            setMessageList((prev) => [latestMessage, ...prev]);
        }
    }, [latestMessage, setMessageList]);

    useEffect(() => {
        if (user) {
            setUserList((prev) => [...prev, user]);
        }
    }, [user, setUserList]);

    useEffect(() => {
        const urlParams = new URLSearchParams(document.location.search);
        const urlToken = urlParams.get('token');
        const urlOrgId = urlParams.get('org_id');
        if (channelId && (urlToken || urlOrgId)) {
            const existing = JSON.parse(window.localStorage.getItem(channelId) || '{}');
            window.localStorage.setItem(
                channelId,
                JSON.stringify({
                    ...existing,
                    ...(urlToken && { token: urlToken }),
                    ...(urlOrgId && { organization_id: urlOrgId }),
                }),
            );
        }
    }, [channelId]);

    useEffect(() => {
        if (channelId) {
            // The widget config endpoint is auth-gated (contact token), which the
            // widget only has after register/getRoom. getChannel is therefore fired
            // from useGlobalState once the contact session exists — not on bare mount.
            migrate(channelId);
        }
    }, [channelId]);

    useEffect(() => {
        iframeDispatch(iframeActionTypes.getOptions);
    }, []);

    useEffect(() => {
        if (channel) {
            iframeDispatch(iframeActionTypes.getChannel, channel);
        }
    }, [channel]);

    useEffect(() => {
        const params = new URLSearchParams(document.location.search);

        window.addEventListener('message', (event) => {
            const { origin, action } = event.data;

            if (origin !== IMBRACE_CHAT_WIDGET || params.get('channel_id') !== event.data.channelId) {
                return;
            }
            switch (action) {
                case iframeActionTypes.getOptions: {
                    setOptions((prev) => ({
                        ...prev,
                        closeable: event.data.closeable,
                        defaultOpen: event.data.defaultOpen,
                        prefillMessage: event.data.prefillMessage,
                        hideCloseButton: event.data.hideCloseButton,
                        removeBorderRadius: event.data.removeBorderRadius,
                        keepMessageHistory: event.data.keepMessageHistory,
                        additionalParams: event.data.additionalParams,
                        keepMultipleChoiceButton: event.data.keepMultipleChoiceButton,
                        emoji: event.data.emoji,
                    }));
                    if (event.data.token || event.data.orgId) {
                        const existing = JSON.parse(window.localStorage.getItem(params.get('channel_id')) || '{}');
                        window.localStorage.setItem(
                            params.get('channel_id'),
                            JSON.stringify({
                                ...existing,
                                ...(event.data.token && { token: event.data.token }),
                                ...(event.data.orgId && { organization_id: event.data.orgId }),
                            }),
                        );
                    }
                    break;
                }
                case iframeActionTypes.closeWidget:
                    onCloseChatWidget();
                    break;
                case iframeActionTypes.openWidget:
                    onOpenChatWidget();
                    break;
                default:
                    break;
            }
        });
        return () => {
            window.removeEventListener('message', () => {});
        };
    }, [setOptions, onCloseChatWidget, onOpenChatWidget]);

    // After the message listener is attached, announce readiness to the parent
    useEffect(() => {
        iframeDispatch(iframeActionTypes.ready);
    }, []);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Helmet>
                {channel?.config?.window_name && <title>{channel?.config?.window_name}</title>}
                {channel?.config?.window_logo && <link rel="icon" href={channel?.config?.window_logo} />}
            </Helmet>
            <QuickReply />
            <Launcher />
        </ThemeProvider>
    );
};

export default App;
