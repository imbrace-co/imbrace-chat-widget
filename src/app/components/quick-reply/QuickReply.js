import { Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Linkify from 'react-linkify';

import { useStore } from '../../store/useStore';

import { ArrowIcon, CloseIcon } from '../../assets/images';

import UserInput from '../chat-window/UserInput';

import { getSenderInfo } from '../../helpers/business';
import { getMessageStyle } from '../../helpers/message';

import { messageType, userInputFrom } from '../../constants/common';

import en from '../../translations/en';

const parseLatestMessage = (channelId, latestMessage, userList) => {
    if (!latestMessage) {
        return null;
    }

    const { type, content, from, id } = latestMessage;
    const senderInfo = getSenderInfo(channelId, from, userList);

    if (senderInfo.isSentFromUser) {
        return null;
    }

    if (messageType.image === type) {
        return {
            text: en.message.receivedImage,
            sender: senderInfo.displayName,
            id,
        };
    } else if (messageType.pdf === type) {
        return {
            text: en.message.receivedPDF,
            sender: senderInfo.displayName,
            id,
        };
    } else if (type.includes(messageType.csv)) {
        return {
            text: en.message.receivedCSV,
            sender: senderInfo.displayName,
            id,
        };
    } else if (messageType.response === type) {
        return {
            text: content.text,
            sender: senderInfo.displayName,
            multipleChoices: content.quick_replies,
            id,
        };
    } else if (content.text) {
        let text;
        try {
            if (typeof content.text === 'string') {
                text = content.text;
            } else if (content.text instanceof Object) {
                text = JSON.stringify(content.text);
                text = text.replace(/\\n/g, '\n');
            } else {
                text = String(content.text);
            }
        } catch (error) {
            console.error("Error processing message content:", error);
            text = en.message.invalidMessageFormat || "Message in unsupported format";
        }
        
        return {
            text: text,
            sender: senderInfo.displayName,
            id,
        };
    } else {
        return {
            text: en.message.unsupportedMessage || "Unsupported message type",
            sender: senderInfo.displayName,
        };
    }
};

const QuickReply = () => {
    const theme = useTheme();

    const {
        // data
        primaryColor,
        latestMessage,
        userList,
        // boolean
        isWidgetOpen,
        // action
        onSelectChoiceMessage,
        onCloseChatWidget,
        channelId,
        options,
        onAnswerMultipleChoice,
        isAiAgentState,
    } = useStore();
    const senderInfo = getSenderInfo(channelId, latestMessage?.from, userList);
    const styles = getMessageStyle({ primaryColor, theme, isAiAgentState, isSentFromUser: senderInfo.isSentFromUser });

    const [isShowMore, setIsShowMore] = useState(false);
    const [isShowQuickReply, setIsShowQuickReply] = useState(false);

    const messageTextRef = useRef(null);

    const { text, sender, multipleChoices, id: message_id } = parseLatestMessage(channelId, latestMessage, userList) || {};

    useEffect(() => {
        if (latestMessage) {
            setIsShowMore(false);
        }
    }, [latestMessage]);

    if (!text || isWidgetOpen) {
        return <></>;
    }

    const messageTextRefScrollHeight = messageTextRef?.current?.scrollHeight || 0;

    const maxNumberOfLines = 3;

    return (
        <Box
            id="sc-quick-reply"
            sx={{
                width: '360px',
                maxWidth: '80%',
                position: 'fixed',
                right: '0px',
                bottom: '80px',
            }}
        >
            <Box
                sx={{
                    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    p: 1.875,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <Typography
                        sx={{
                            mb: 1.25,
                        }}
                        variant="header2"
                        color={theme.color.lightGrey}
                    >
                        {sender}
                    </Typography>

                    <IconButton
                        onClick={() => {
                            onCloseChatWidget();
                            setIsShowQuickReply(false);
                        }}
                    >
                        <CloseIcon
                            style={{
                                width: '24px',
                                height: '24px',
                                fill: theme.color.lightGrey,
                            }}
                        />
                    </IconButton>
                </Box>

                <Typography
                    ref={messageTextRef}
                    sx={{
                        flex: 1,
                        overflowX: 'hidden',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        ...(isShowMore
                            ? {
                                  overflowY: 'auto',
                              }
                            : {
                                  overflowY: 'hidden',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: maxNumberOfLines,
                              }),
                        maxHeight: '162px',
                    }}
                    variant="message"
                    color={theme.color.black}
                >
                    <Linkify
                        componentDecorator={(decoratedHref, decoratedText, key) => (
                            <a target="_blank" rel="noreferrer" href={decoratedHref} key={key}>
                                {decoratedText}
                            </a>
                        )}
                    >
                        {text}
                    </Linkify>
                </Typography>

                {!multipleChoices && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        {isShowQuickReply ? (
                            <Box></Box>
                        ) : (
                            <Button
                                onClick={() => {
                                    setIsShowQuickReply(!isShowQuickReply);
                                }}
                                sx={{ mt: 1.875 }}
                            >
                                <Typography variant="displayName" color={primaryColor}>
                                    {en.quickReply.name}
                                </Typography>
                            </Button>
                        )}

                        {messageTextRefScrollHeight > maxNumberOfLines * 18 && (
                            <Button
                                onClick={() => {
                                    setIsShowMore(!isShowMore);
                                    messageTextRef?.current?.scrollTo(0, 0);
                                }}
                                sx={{ mt: 1.875 }}
                            >
                                <Typography
                                    sx={{
                                        mr: 0.375,
                                    }}
                                    displayName
                                    color={theme.color.lightGrey}
                                >
                                    {isShowMore ? en.quickReply.showLess : en.quickReply.showMore}
                                </Typography>
                                <ArrowIcon
                                    style={{
                                        ...(isShowMore ? { transform: 'rotate(-180deg)' } : {}),
                                    }}
                                />
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {multipleChoices ? (
                <Box style={styles.multipleChoiceContainer}>
                    {multipleChoices.map((choice) => {
                        const { id, title } = choice;
                        return (
                            <Button
                                key={id}
                                variant="outlined"
                                sx={styles.multipleChoiceItem}
                                onClick={() => {
                                    onSelectChoiceMessage(choice);
                                    if (!options.keepMultipleChoiceButton) {
                                        onAnswerMultipleChoice(message_id, { answer: id });
                                    }
                                }}
                            >
                                {title}
                            </Button>
                        );
                    })}
                </Box>
            ) : (
                isShowQuickReply && <UserInput from={userInputFrom.quickReply} />
            )}
        </Box>
    );
};

export default QuickReply;
