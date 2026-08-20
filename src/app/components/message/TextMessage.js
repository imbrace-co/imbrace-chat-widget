import React, { useEffect, useState } from 'react';
import { Typography, Button, useTheme, Box, IconButton } from '@mui/material';
import Linkify from 'react-linkify';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import ReactPlayer from 'react-player';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

import { safeSchema } from './markdownSchema';
import { useStore } from '../../store/useStore';

import { getUrlFromMessage } from '../../helpers/business';
import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';
import MessageContainer from './MessageContainer';
import { RightArrowIcon } from '../../assets/images/index';
import LoadingReplyMessage from '../../assets/images/loading.gif';

const TextMessage = (props) => {
    const { content, created_at, isSentFromUser, isLatestMessage } = props;

    const {
        // data
        primaryColor,
        secondaryColor,
        isAiAgentState,
        isBotAnswering,
        currentMessageReceive,
        counterChart,
    } = useStore();
    const getMessage = (textContent) => {
        let text;
        try {
            if (typeof textContent === 'string') {
                text = textContent;
            } else if (textContent instanceof Object) {
                text = JSON.stringify(textContent);
                text = text.replace(/\\n/g, '\n');
            } else {
                text = String(textContent);
            }
        } catch (error) {
            console.error('Error processing message content:', error);
            text = en.message.invalidMessageFormat || 'Message in unsupported format';
        }
        return text;
    };

    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const [messageTime, setMessageTime] = useState(created_at ?? new Date());

    const theme = useTheme();

    const styles = getMessageStyle({ primaryColor, secondaryColor, theme, isAiAgentState, isSentFromUser });

    const message = content?.text !== undefined ? getMessage(content?.text) : content?.title || '';
    const [streamMessageData, setStreamMessageData] = useState({ history: message, stream: '' });
    const [typingMessageData, setTypingMessageData] = useState('');

    const [streamMessageToolCallData, setStreamMessageToolCallData] = useState(content?.tool_calls || '');
    const [streamMessageSubtextData, setStreamMessageSubtextData] = useState(content?.subtext || '');
    const [messageId, setMessageId] = useState(content?.message_id);
    const [counter, setCounter] = useState(content?.counter);
    const [isShowChart, setIsShowChart] = useState(typeof counter === 'number' && counter > 0);
    const url = getUrlFromMessage(message);

    const handleLinkClick = (event, href) => {
        event.preventDefault();

        const payload = {
            type: 'ON_LINK_CLICK',
            url: href,
        };

        try {
            window.parent.postMessage(payload, '*');
            console.log('✅ postMessage ON_CLICK_URL was sent.', payload);
        } catch (err) {
            console.error('❌ postMessage ON_CLICK_URL failed:', err);
        }

        window.open(href, '_blank', 'noopener,noreferrer');
    };
    useEffect(() => {
        setMessageTime(created_at ?? new Date());
    }, [created_at]);

    useEffect(() => {
        const { message_id, subtext, typing, tool_calls, blocks } = currentMessageReceive;
        if (!isSentFromUser && currentMessageReceive && message_id === content?.message_id) {
            tool_calls && setStreamMessageToolCallData((prev) => `${prev}${tool_calls}`);
            subtext && setStreamMessageSubtextData((prev) => `${prev}${subtext}`);
            blocks &&
                setStreamMessageData((prev) => ({
                    ...prev,
                    stream: blocks.join(''),
                }));
            setTypingMessageData(typing);
        }
    }, [currentMessageReceive, isSentFromUser]);

    useEffect(() => {
        if (counterChart && counterChart.messageId === content?.message_id) {
            setCounter(counterChart.chartId);
            setMessageId(counterChart.messageId);
            setIsShowChart(counterChart.chartId > 0);
        }
    }, [counterChart]);

    const handlePostChartMessage = (event) => {
        event.preventDefault();
        const postChartMessageContent = {
            event: 'show',
            id: messageId,
        };
        try {
            window.parent.postMessage(
                {
                    payload: postChartMessageContent,
                },
                '*',
            );
            console.log('✅ postMessage Chart was sent.', postChartMessageContent);
        } catch (err) {
            console.error('❌ postMessage Chart was failed:', err);
        }
    };

    const fixTableMarkdown = (markdown) => {
        const lines = markdown.split('\n');
        const result = [];
        let inTable = false;
        let tableEnded = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
            if (isTableLine) {
                inTable = true;
                tableEnded = false;
                result.push(line);
            } else if (inTable && !isTableLine && line.trim() !== '') {
                // Table ended => add blank line before non-table content
                if (!tableEnded) {
                    result.push(''); // Add blank line
                    tableEnded = true;
                }
                result.push(line);
                inTable = false;
            } else {
                result.push(line);
                if (line.trim() === '') {
                    inTable = false;
                    tableEnded = false;
                }
            }
        }
        return result.join('\n');
    };

    const unwrapMarkdownCodeBlock = (markdown) => {
        const codeBlockRegex = /```(?:markdown)?\n([\s\S]*?)```/g;
        return markdown
            .replace(codeBlockRegex, (_, innerContent) => innerContent.trim())
            .trim()
            .replace(/\n{3,}/g, '\n\n');
    };

    return (
        <MessageContainer
            isSentFromUser={isSentFromUser}
            sx={{
                ...(isVideoPlaying ? styles.fileImageEnlarge : undefined),
            }}
        >
            {url &&
                (ReactPlayer.canPlay(url) ? (
                    <ReactPlayer
                        url={url}
                        width={'100%'}
                        height={isVideoPlaying ? '200px' : '150px'}
                        controls={true}
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                    />
                ) : (
                    <LinkPreview className="custom-link-preview" url={url} showPlaceholderIfNoImage={true} />
                ))}

            {!isSentFromUser && (streamMessageSubtextData || streamMessageToolCallData) && (
                <Typography sx={styles.subText}>
                    {streamMessageToolCallData && (
                        <Typography>
                            <Typography style={{ marginTop: '2px' }}>{streamMessageToolCallData}</Typography>
                        </Typography>
                    )}
                    {streamMessageSubtextData && (
                        <Typography style={{ marginTop: '10px' }}>
                            <Typography style={{ marginTop: '2px' }}>{streamMessageSubtextData}</Typography>
                        </Typography>
                    )}
                </Typography>
            )}

            <Typography variant="content1" sx={styles.text}>
                {!isSentFromUser && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, [rehypeSanitize, safeSchema]]}
                        components={{
                            table: ({ node, ...props }) => (
                                <div style={styles.wrapper}>
                                    <table style={styles.table} {...props} />
                                </div>
                            ),
                            th: ({ node, ...props }) => <th style={styles.th} {...props} />,
                            td: ({ node, ...props }) => <td style={styles.td} {...props} />,
                            tr: ({ node, children, ...props }) => {
                                const index = node?.position?.start?.line;
                                const style = index % 2 === 1 ? styles.trOdd : undefined;
                                return (
                                    <tr style={style} {...props}>
                                        {children}
                                    </tr>
                                );
                            },
                            a: ({ node, href, children, ...props }) => (
                                <a
                                    {...props}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(event) => handleLinkClick(event, href)}
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {fixTableMarkdown(unwrapMarkdownCodeBlock(streamMessageData.stream || streamMessageData.history))}
                    </ReactMarkdown>
                )}
                {isSentFromUser && (
                    <Linkify
                        componentDecorator={(decoratedHref, decoratedText, key) => (
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={decoratedHref}
                                key={key}
                                onClick={(event) => handleLinkClick(event, decoratedHref)}
                            >
                                {decoratedText}
                            </a>
                        )}
                    >
                        <Typography style={{ marginTop: '2px' }}>{streamMessageData.history}</Typography>
                    </Linkify>
                )}
                {typingMessageData && <span style={styles.typing}>{typingMessageData}</span>}
            </Typography>
            {isBotAnswering && isLatestMessage && !isSentFromUser && (
                <div className="sc-agent-chat-window-loading" style={{ secondaryColor }}>
                    <span className="sc-agent-chat-window-loading-text">Typing a response</span>
                    <img src={LoadingReplyMessage} alt="loading" height="11px" width="20px" />
                </div>
            )}

            <Typography variant="content2" sx={isSentFromUser ? styles.userTime : styles.agentTime}>
                {getCreatedAtForMessage(messageTime)}
            </Typography>
        </MessageContainer>
    );
};

export default TextMessage;
