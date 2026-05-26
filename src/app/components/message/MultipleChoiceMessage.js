import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import Linkify from 'react-linkify';
import { TinyColor } from '@ctrl/tinycolor';

import { useStore } from '../../store/useStore';

import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';
import MessageContainer from './MessageContainer';

const textColor = (color) => (new TinyColor(color).isLight() ? '#333' : '#fff');

const MultipleChoiceMessage = (props) => {
    const { created_at, isSentFromUser, content, id: message_id } = props;

    const {
        // data
        primaryColor,
        secondaryColor,
        // action
        onSelectChoiceMessage,
        onAnswerMultipleChoice,
        options,
        isAiAgentState,
    } = useStore();

    const theme = useTheme();

    const styles = getMessageStyle({
        primaryColor,
        secondaryColor,
        theme,
        textColor: textColor(primaryColor),
        isAiAgentState,
        isSentFromUser,
    });

    return (
        <MessageContainer
            isSentFromUser={isSentFromUser}
            extra={
                <Box style={styles.multipleChoiceContainer}>
                    {(options.keepMultipleChoiceButton || (!options.keepMultipleChoiceButton && !content.answered)) &&
                        content?.quick_replies.map((choice) => {
                            const { id, title } = choice;
                            return (
                                <Button
                                    key={id}
                                    variant="outlined"
                                    sx={{ ...styles.multipleChoiceItem }}
                                    onClick={() => {
                                        if (!options.keepMultipleChoiceButton) {
                                            onAnswerMultipleChoice(message_id, { answer: id });
                                        }
                                        onSelectChoiceMessage(choice);
                                    }}
                                >
                                    {title}
                                </Button>
                            );
                        })}
                </Box>
            }
        >
            <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a target="_blank" rel="noreferrer" href={decoratedHref} key={key}>
                        {decoratedText}
                    </a>
                )}
            >
                <Typography variant="content1">{content.text}</Typography>
            </Linkify>

            <Typography
                variant="content2"
                sx={{
                    ...(isSentFromUser && !isAiAgentState ? styles.userTime : styles.agentTime),
                    color: textColor(isSentFromUser ? primaryColor : secondaryColor),
                }}
            >
                {getCreatedAtForMessage(created_at)}
            </Typography>
        </MessageContainer>
    );
};

export default MultipleChoiceMessage;
