import { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';

import * as API from '../api/path';
import { call } from '../api/services';
import { IMBRACE_WEB_API } from '../api/config';

import { initWebSocket } from '../helpers/webSocket';
import { isNull } from '../helpers/string';
import { iframeDispatch, handleSendMessageHelper } from '../helpers/iframe';

import { messageType } from '../constants/common';
import { actionTypes as iframeActionTypes } from '../constants/iframe';
import { getFileMessageType, validateFile } from '../helpers/file';

export const useGlobalState = () => {
    const searchParams = new URLSearchParams(document.location.search);

    const [latestMessage, setLatestMessage] = useState(null);
    const [latestStreamMessage, setLatestStreamMessage] = useState('');
    const [latestStreamSubtextMessage, setLatestStreamSubtextMessage] = useState('');
    const [isMessageStreamDone, setIsMessageStreamDone] = useState(true);
    const [isStreamType, setIsStreamType] = useState(false);
    const [currentMessageReceive, setCurrentMessageReceive] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [isWidgetOpen, setIsWidgetOpen] = useState(searchParams.get('defaultOpen') === 'true' ? true : false);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [messageLimit, setMessageLimit] = useState(50);
    const [messageSkip, setMessageSkip] = useState(0);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isBotReplyMessagesLoading, setIsBotReplyMessagesLoading] = useState(false);
    const [isBotAnswering, setIsBotAnswering] = useState(false);
    const [isAiAgentState, setIsAiAgentState] = useState(false);
    const [isEnableStreaming, setIsEnableStreaming] = useState(false);
    const [assistantId, setAssistantId] = useState('');
    const [user, setUser] = useState(null);
    const [userList, setUserList] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [counterChart, setCounterChart] = useState({ messageId: '', chartId: '' });
    const [chartMessageId, setChartMessageId] = useState(null);
    const [channelId, setChannelId] = useState(searchParams.get('channel_id') ?? '');
    const [channel, setChannel] = useState(null);
    const [isMute, setIsMute] = useState(false);
    const [isShowScrollToBottomButton, setIsShowScrollToBottomButton] = useState(false);
    const [parentUrl, setParentUrl] = useState(searchParams.get('parentUrl') ?? '');
    const [options, setOptions] = useState({
        closeable: true,
        defaultOpen: false,
        prefillMessage: '',
        hideCloseButton: false,
        removeBorderRadius: false,
        emoji: searchParams.get('emoji') === 'false' ? false : true,
        keepMessageHistory: searchParams.get('keep_message_history') === 'false' ? false : true,
        keepMultipleChoiceButton: searchParams.get('keep_multiple_choice_button') === 'false' ? false : true,
        additionalParams: searchParams.get('additional_params') || '',
    });
    const isMessageStreamDoneRef = useRef(isMessageStreamDone);
    const isEnableStreamingRef = useRef(isEnableStreaming);

    const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');
    const channelIdData = 'ch_48fbd835-01b3-42be-b193-2fc21ffec761';
    const isAssistantType = channelInfo.channel_id === channelIdData;
    const rawBuffer = useRef(new Map());
    const renderedBlocks = useRef(new Map());
    useEffect(() => {
        isMessageStreamDoneRef.current = isMessageStreamDone;
    }, [isMessageStreamDone]);

     useEffect(() => {
        isEnableStreamingRef.current = isEnableStreaming;
    }, [isEnableStreaming]);

    const aiAgentSubmitText = async (params) => {
        console.log("streaming api start");
        const urlParams = new URLSearchParams(document.location.search);
        const token = urlParams.get('token') || channelInfo.token;
        const accessToken = channelInfo.access_token || token;
        const organization_id = urlParams.get('org_id') || channelInfo.organization_id;
        let data = JSON.stringify({
            text: params.text,
            thread_id: roomId,
            role: 'user',
            secret: '擁抱科技',
            assistant_id: assistantId,
            streaming: true,
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${IMBRACE_WEB_API()}/ai/v3/rag/answer_question`,
            headers: {
                'x-organization-id': organization_id,
                'Authorization': `Bearer ${token}`,
                'X-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            data: data,
        };
        axios
            .request(config)
            .then((response) => {
                console.log('Answer done');
                setIsMessageStreamDone(true);
                setIsBotAnswering(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const onSubmitMessage = (message) => {
        const { type, data } = message;

        let params;

        if (type === messageType.emoji) {
            const sendIcon = data.emoji;
            params = {
                type: 'text',
                text: sendIcon,
            };
        } else if (type === messageType.image) {
            params = {
                type: type,
                url: data.text,
                caption: '',
            };
        } else if (type === messageType.pdf || type.includes(messageType.csv)) {
            params = {
                type: type,
                url: data.text,
                caption: '',
            };
        } else {
            params = {
                type: type,
                text: data.text,
            };
        }

        console.log('onSubmitMessage:', true);

        call(
            API.postMessages,
            { ...params, parentUrl },
            (response) => {},
            (error) => {},
        );
        console.log("isEnableStreamingRef.current ", isEnableStreamingRef.current);
        if (isAssistantType || isEnableStreamingRef.current) {
            console.log("okok ");
            setIsMessageStreamDone(false);
            aiAgentSubmitText(params);
        }
    };

    const onFilesSelected = async (fileList) => {
        const { type } = fileList[0];

        const fileType = getFileMessageType(type);

        if (!validateFile(type) || !fileType) {
            throw new Error('unsupported file type');
        }
        if (fileList[0].size / 1024 / 1024 > 5) {
            throw new Error('file size is over 5 mb');
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);
        formData.append('destination', type);
        formData.append('create_thumbnail', true);

        await new Promise((resolve, reject) =>
            call(
                API.fileUploadImage,
                formData,
                (response) => {
                    const { data } = response || {};
                    const { url } = data || {};

                    if (!isNull(url)) {
                        const urlData = {
                            text: url,
                        };

                        const params = {
                            author: 'me',
                            data: urlData,
                            type: fileType,
                        };

                        onSubmitMessage(params);
                    }
                    resolve();
                },
                (error) => {
                    reject(error);
                },
            ),
        );
    };

    const onSelectChoiceMessage = (data) => {
        const { payload, title } = data;

        const params = {
            type: 'quick_reply',
            payload: payload,
            title: title,
        };

        call(
            API.postMessages,
            params,
            (response) => {},
            (error) => {},
        );
    };

    const onAnswerMultipleChoice = (message_id, body) => {
        call(
            {
                api: API.postAnswerMultipleChoice.api(message_id),
                method: API.postAnswerMultipleChoice.method,
            },
            body,
            (response) => {
                setMessageList((prev) => {
                    const newMessageList = [...prev];
                    const index = newMessageList.findIndex((message) => message.id === message_id);
                    if (index !== -1) {
                        newMessageList[index].content = response.data?.content;
                    }
                    return newMessageList;
                });
            },
            (error) => {},
        );
    };

    const onOpenChatWidget = useCallback((fromClickChatWindow = true) => {
        // setIsLoadingMessages(true);

        if (fromClickChatWindow) {
            setIsWidgetOpen(true);
            iframeDispatch(iframeActionTypes.openWidget);
        }
    }, []);

    const buffer = useRef(new Map());
    const currentSequence = useRef(new Map());
    function splitCompleteBlocks(src) {
        const out = [];
        let rest = src;

        // 1) Table: header + separator 
        const tableDone = /^(\|.*\|.*\n)+\|[-:]+[-|: ]*\|(?:\n\|.*\|.*)*\n?/;
        // 2) Code fence (```…```)
        const codeFenceDone = /^```[\s\S]*?```(?:\n|$)/;
        // 3) ATX heading (### …)
        const headingDone = /^#{1,6}[^\n]*\n/;
        // 4) Blockquote 
        const blockquoteDone = /^(?:>.*(?:\n|$))+/;
        // 5) List 
        const listDone = /^(\s*([-*+]|\d+\.)\s+.*(\n(?!\n).*)*)+/;

        // 6) Blank line(s)
        // IMPORTANT: do not drop these during streaming, otherwise a chunk that is only "\n"
        // (common in token streaming) would be lost and the UI won't show the intended line break.
        const blankLineDone = /^\s*\n+/;
        // 7) Paragraph
        const paraDone = /^[^\n]+(?:\n|$)/;

        while (rest.length) {
            let m = '';
            if (blankLineDone.test(rest)) {
                m = rest.match(blankLineDone)[0];
                out.push(m);
                rest = rest.slice(m.length);
                continue;
            }
            if (tableDone.test(rest)) {
                m = rest.match(tableDone)[0];
            } else if (codeFenceDone.test(rest)) {
                m = rest.match(codeFenceDone)[0];
            } else if (headingDone.test(rest)) {
                m = rest.match(headingDone)[0];
            } else if (blockquoteDone.test(rest)) {
                m = rest.match(blockquoteDone)[0];
            } else if (listDone.test(rest)) {
                m = rest.match(listDone)[0];
            } else {
                m = rest.match(paraDone)[0];
            }

            if (!m) break;
            out.push(m);
            rest = rest.slice(m.length);
        }

        return [out, rest];
    }

    function addMarkdownChunk(chunk) {
        const { message_id: id, text = '' } = chunk;

        const merged = (rawBuffer.current.get(id) || '') + text;
        const [blocks, rest] = splitCompleteBlocks(merged);
        rawBuffer.current.set(id, rest);

        if (!blocks.length && !rest) return;
        const prev = renderedBlocks.current.get(id) || [];
        const ready = [...prev, ...blocks];
        renderedBlocks.current.set(id, ready);
        setCurrentMessageReceive({
            ...chunk,
            blocks: ready,
            typing: rest,
        });
    }
    const handleIncoming = (msg) => {
        const { sequence_number, message_id } = msg;
        if (!currentSequence.current.has(message_id)) {
            if (sequence_number === 0) {
                currentSequence.current.set(message_id, 0);
                appendMessage(msg);
                tryFlushBuffer(message_id);
            } else {
                if (!buffer.current.has(message_id)) {
                    buffer.current.set(message_id, new Map());
                }
                buffer.current.get(message_id).set(sequence_number, msg);
            }
            return;
        }

        const expected = currentSequence.current.get(message_id) + 1;

        if (sequence_number === expected) {
            currentSequence.current.set(message_id, expected);
            appendMessage(msg);
            tryFlushBuffer(message_id);
        } else if (sequence_number > expected) {
            if (!buffer.current.has(message_id)) {
                buffer.current.set(message_id, new Map());
            }
            buffer.current.get(message_id).set(sequence_number, msg);
        }
    };

    const handleSendMessageToParent = (postMessageVal) => {
        try {
            window.parent.postMessage(
                {
                    payload: postMessageVal,
                },
                '*',
            );
            console.log('✅ postMessage to parent was sent.');
        } catch (err) {
            console.error('❌ postMessage to parent was fail:', err);
        }
    };

    const appendMessage = (msg) => {
        if (msg?.postMessage && typeof msg?.postMessage === 'object' && Object.keys(msg?.postMessage).length > 0) {
            console.log('postMessage Content', msg.postMessage);
            handleSendMessageToParent(msg.postMessage);
            setCounterChart({ messageId: msg.message_id, chartId: msg.counter });
            return;
        }
        const { subtext, text, tool_calls } = msg;

        if (subtext || tool_calls) {
            setCurrentMessageReceive(msg);
        }
        text && addMarkdownChunk(msg);
    };

    const tryFlushBuffer = (message_id) => {
        const bufferForId = buffer.current.get(message_id);
        if (!bufferForId) return;

        while (true) {
            const next = currentSequence.current.get(message_id) + 1;
            const nextMsg = bufferForId.get(next);
            if (!nextMsg) break;

            bufferForId.delete(next);
            currentSequence.current.set(message_id, next);
            appendMessage(nextMsg);
        }

        if (bufferForId.size === 0) {
            buffer.current.delete(message_id);
        }
    };

    const postConversationMessageToParent = (conversationId) => {
        handleSendMessageHelper(
            {
                payload: {
                    event: 'conversationId',
                    id: conversationId,
                },
            },
            { success: '✅ postMessage Conversation was sent. ', fail: '❌ postMessage Conversation was failed:' },
        );
    };

    useEffect(() => {
        if (isWidgetOpen) {
            let isFirstStreamText = false;
            const onReceiveMessageCallback = (message) => {
                const channelStreamInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');
                const isSupportStream = isEnableStreamingRef.current || channelStreamInfo.channel_id === channelIdData;
                const isFromUser = message?.from === channelStreamInfo?.contact_id;
                console.log('receive  ', message?.content);

                // "Typing a response" is the bot's compose indicator. Show it only while
                // waiting for a bot reply (our own message just echoed back on a
                // streaming/assistant channel) and clear it as soon as any reply arrives.
                // Keying off `!is_bot` left it stuck on forever for plain agent (human)
                // replies, which never produce an is_bot message to turn it back off.
                setIsBotReplyMessagesLoading(isSupportStream && isFromUser);
                if (message?.is_bot && isSupportStream) {
                    if (isFirstStreamText) {
                        !isMessageStreamDoneRef.current && setIsBotAnswering(true);
                        setLatestMessage({ ...message, content: { ...message.content, text: '', subtext: '' } });
                        iframeDispatch(iframeActionTypes.showLatestMessage);
                        setIsStreamType(true);
                        isFirstStreamText = false;
                    }
                    handleIncoming(message?.content);
                } else {
                    isFirstStreamText = true;
                    setLatestMessage(message);
                    iframeDispatch(iframeActionTypes.showLatestMessage);
                }
            };

            const onJoinedConversationCallback = (payload) => {
                const { user } = payload || {};
                setUser(user);
            };

            call(
                API.getRoom,
                undefined,
                (response) => {
                    // good token
                    const { data } = response || {};
                    const { id: roomId, users: userList, contact_id } = data || {};

                    setRoomId(roomId);
                    postConversationMessageToParent(roomId);
                    setUserList(userList);

                    // Backfill contact_id for sessions created before the
                    // wrong-side fix (postContact didn't stash contact_id then).
                    // The conversation entity carries it, so we lift it here.
                    if (contact_id) {
                        const existing = JSON.parse(window.localStorage.getItem(channelId) || '{}');
                        if (!existing.contact_id) {
                            window.localStorage.setItem(
                                channelId,
                                JSON.stringify({ ...existing, contact_id }),
                            );
                        }
                    }

                    initWebSocket(channelId, onReceiveMessageCallback, onJoinedConversationCallback);

                    // Contact token is valid here → safe to load the auth-gated widget config.
                    call(API.getChannel, channelId, (response) => setChannel(response.data), () => {});

                    call(API.getMessages, undefined, (response) => {
                        const { data } = response || {};
                        const { data: messageList } = data || {};

                        setIsLoadingMessages(false);
                        setMessageList(messageList);
                    });
                },
                (error) => {
                    // bad token, must re-gen token from server before opening
                    // get new tokens with channel id
                    const { response } = error;
                    const { status } = response;

                    if (status === 401 || status === 404) {
                        // register all tokens with channel id from iframe if any of them voided
                        // clean all existing tokens from localstorage first
                        const payload = {
                            channel_id: channelId,
                            time_zone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone, //  add time zone
                        };

                        let additionalParams = options.additionalParams;

                        if (additionalParams) {
                            try {
                                additionalParams = JSON.parse(options.additionalParams);
                            } catch (error) {
                                console.log('error:', error);
                                additionalParams = '';
                            }
                        }

                        call(
                            API.postContact,
                            { ...payload, parentUrl, additional_params: additionalParams },
                            (response) => {
                                const { id: contact_id, org_id: organization_id, access_token } = response.data;
                                const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');

                                // NOTE: keep channelInfo.token as-is — index.js uses its presence as the
                                // "already bootstrapped → auto-open the widget" flag on subsequent loads.
                                // The stale-token realtime bug is fixed at the socket layer (webSocket.js
                                // auths with the stable contact_id, not this token), so we don't need to
                                // strip it here (doing so would break auto-open).
                                window.localStorage.setItem(
                                    channelId,
                                    JSON.stringify({
                                        ...channelInfo,
                                        channel_id: channelId,
                                        organization_id,
                                        access_token,
                                        // contact_id (con_<uuid>) is what the server stamps on outgoing
                                        // messages as `from`. getSenderInfo compares it to decide which
                                        // side of the chat the message renders on.
                                        contact_id,
                                    }),
                                );

                                call(
                                    API.getRoom,
                                    undefined,
                                    (response) => {
                                        const { data } = response || {};
                                        const { id: roomId, users: userList } = data || {};

                                        // console.log(`roomId`, roomId);
                                        // console.log(`userList`, userList);

                                        setRoomId(roomId);
                                        postConversationMessageToParent(roomId);
                                        setUserList(userList);

                                        // getRoom has now created the conversation, so connect the
                                        // socket here (not before) → its findByContactId join picks
                                        // up the freshly-created conversation room and live messages
                                        // arrive without a reload.
                                        initWebSocket(channelId, onReceiveMessageCallback, onJoinedConversationCallback);

                                        // Contact token is valid here → load the auth-gated widget config.
                                        call(API.getChannel, channelId, (r) => setChannel(r.data), () => {});

                                        call(API.getMessages, undefined, (response) => {
                                            const { data } = response || {};
                                            const { data: messageList } = data || {};

                                            setIsLoadingMessages(false);
                                            setMessageList(messageList);
                                        });
                                    },
                                    (error) => {},
                                );
                            },
                            (error) => {},
                        );
                    }
                },
            );
        }
    }, [isWidgetOpen, channelId, parentUrl, options.additionalParams]);

    const onCloseChatWidget = useCallback(() => {
        iframeDispatch(iframeActionTypes.closeWidget);
        if (!options.keepMessageHistory) {
            window.localStorage.removeItem(channelId);
            setMessageList([]);
            setMessageSkip(0);
            setMessageLimit(50);
            setLatestMessage(null);
            setUserList([]);
            setUser(null);
            setRoomId(null);
        }
        if (options.closeable) {
            setIsWidgetOpen(false);
            setLatestMessage(null);
        }
    }, [options]);

    return {
        // state
        latestMessage,
        setLatestMessage,
        isMessageStreamDone,
        setIsMessageStreamDone,
        isStreamType,
        setIsStreamType,
        counterChart,
        setCounterChart,
        currentMessageReceive,
        setCurrentMessageReceive,
        chartMessageId,
        setChartMessageId,
        latestStreamMessage,
        setLatestStreamMessage,
        latestStreamSubtextMessage,
        setLatestStreamSubtextMessage,
        messageList,
        setMessageList,
        newMessagesCount,
        setNewMessagesCount,
        isWidgetOpen,
        setIsWidgetOpen,
        selectedRoom,
        setSelectedRoom,
        messageLimit,
        setMessageLimit,
        messageSkip,
        setMessageSkip,
        assistantId, 
        setAssistantId,
        isLoadingMessages,
        setIsLoadingMessages,
        isBotReplyMessagesLoading,
        setIsBotReplyMessagesLoading,
        isBotAnswering,
        setIsBotAnswering,
        isAiAgentState,
        setIsAiAgentState,
        user,
        setUser,
        userList,
        setUserList,
        roomId,
        setRoomId,
        channelId,
        setChannelId,
        channel,
        setChannel,
        isMute,
        setIsMute,
        isShowScrollToBottomButton,
        setIsShowScrollToBottomButton,
        parentUrl,
        setParentUrl,
        options,
        setOptions,
        isEnableStreaming,
        setIsEnableStreaming,
        // data
        primaryColor: channel?.config?.primary_color || '#1976d2',
        headerColor: channel?.config?.header_color || channel?.config?.primary_color || '#1976d2',
        secondaryColor: channel?.config?.secondary_color || '#f5f5f5',
        backgroundColor: channel?.config?.background_color || '#ffffff',
        fontSize: channel?.config?.font_size || '16',
        agentProfile: {
            name: channel?.config?.chatbot_name || 'Assistant',
            imageUrl: channel?.config?.chatbot_avatar || '',
        },
        window: {
            name: channel?.config?.window_name || 'Chat',
            imageUrl: channel?.config?.window_logo || '',
        },
        showEmoji: true,
        // action
        onSubmitMessage,
        onFilesSelected,
        onSelectChoiceMessage,
        onOpenChatWidget,
        onCloseChatWidget,
        onAnswerMultipleChoice,
    };
};
