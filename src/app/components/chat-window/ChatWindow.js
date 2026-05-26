import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { userInputFrom } from '../../constants/common';
import { Typography, useTheme } from '@mui/material';
import Header from './Header';
import MessageList from './MessageList';
import UserInput from './UserInput';
import en from '../../translations/en';
import LoadingReplyMessage from '../../assets/images/loading.gif';

const ChatWindow = (props) => {
    const theme = useTheme();
    const {
        isWidgetOpen,
        setOptions,
        onSubmitMessage,
        isBotReplyMessagesLoading,
        setIsAiAgentState,
        backgroundColor,
        setIsEnableStreaming,
        setAssistantId,
    } = useStore();
    const [suggestionPrompts, setSuggestionPromps] = useState([]);
    const [isAIAgent, setIsAIAgent] = useState(false);
    let classList = ['sc-chat-window', isWidgetOpen ? '' : 'closed', isAIAgent ? 'reset-font-style' : ''];

    useEffect(() => {
        const handleMessage = (event) => {

            window.parent.postMessage({ type: 'READY' }, '*');
            console.log("event.data ", event.data);
            if (event.data.enableStreaming) {
                console.log("received streaming work");
                setIsEnableStreaming(true);
            }

            if (event.data.assistantId) {
                setAssistantId(event.data.assistantId);
            }

            if (event.data.theme === 'ai-agent') {
                setIsAIAgent(true);
                setIsAiAgentState(true);
                setOptions((prev) => ({
                    ...prev,
                    hideCloseButton: true,
                }));
                const header = document.querySelector('#root > div > div:nth-child(2) > div');
                if (header) {
                    header.style.borderRadius = '8px 8px 0 0';
                    header.style.background = 'rgba(250, 153, 23, 1)';
                    header.style.height = '75px';
                }
                const title = header.querySelector('span');
                title.style.color = 'rgba(255, 255, 255, 1)';
                title.style.fontWeight = '800';
                title.style.fontSize = '16px';
                title.style.textTransform = 'uppercase';

                const avatar = header.querySelector('div');
                avatar.style.display = 'none';
                if (event.data.suggestion_prompts && Array.isArray(event.data.suggestion_prompts)) {
                    setSuggestionPromps(event.data.suggestion_prompts);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        if (suggestionPrompts.length > 0) {
            const container = document.querySelector('.marquee-container');
            const items = document.querySelectorAll('.marquee-item');

            if (!container || !items.length) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const ratio = entry.intersectionRatio;
                        const el = entry.target;
                        if (ratio < 0.2) {
                            el.style.background = 'rgba(254, 245, 232, 0.1)';
                        } else if (ratio < 0.6) {
                            el.style.background = 'rgba(254, 245, 232, 0.1)';
                        } else {
                            el.style.background = 'rgba(254, 245, 232, 1)';
                        }
                    });
                },
                {
                    root: container,
                    threshold: [0, 0.2, 0.6, 1],
                },
            );

            items.forEach((item) => observer.observe(item));

            return () => {
                items.forEach((item) => observer.unobserve(item));
            };
        }
    }, []);

    const handlePromptClick = (prompt) => {
        console.log('handlePromptClick');
        onSubmitMessage({
            author: 'me',
            type: 'text',
            data: { text: prompt },
        });
    };

    const SuggestionPromps = () => {
        return (
            <div>
                <p
                    style={{
                        textAlign: 'center',
                        color: theme.color.lightGrey,
                        fontSize: '12px',
                    }}
                >
                    {en.common.suggestPrompsInstruction}
                </p>
                <div className="marquee-container">
                    <div className="marquee-track">
                        <div className="marquee-group">
                            {[...suggestionPrompts, ...suggestionPrompts].map((text, i) => (
                                <div className="marquee-item" key={i} onClick={() => handlePromptClick(text)}>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={classList.join(' ')}>
            <Header />
            <MessageList isAIAgent={isAIAgent} />
            {isBotReplyMessagesLoading && (
                <div className="sc-agent-chat-window-loading" style={{ backgroundColor, paddingLeft: '20px' }}>
                    <span className="sc-agent-chat-window-loading-text">Typing a response</span>
                    <img src={LoadingReplyMessage} alt="loading" height="11px" width="20px" />
                </div>
            )}
            <UserInput from={userInputFrom.chatWindow} isAIAgent={isAIAgent} />
            {suggestionPrompts.length > 0 && <SuggestionPromps />}
        </div>
    );
};

export default ChatWindow;
