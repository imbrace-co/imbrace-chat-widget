import React from 'react';
import { Typography, useTheme } from '@mui/material';

import { useStore } from '../../store/useStore';
import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';
import MessageContainer from './MessageContainer';

const EmojiMessage = (props) => {
    const { content, isSentFromUser, created_at } = props;

    const { primaryColor, secondaryColor, isAiAgentState } = useStore();
    const theme = useTheme();
    const styles = getMessageStyle({ primaryColor, secondaryColor, theme, isAiAgentState, isSentFromUser });

    return (
        <MessageContainer isSentFromUser={isSentFromUser}>
            <Typography variant="content1">{content.text}</Typography>
            <Typography variant="content2" sx={isSentFromUser ? styles.userTime : styles.agentTime}>
                {getCreatedAtForMessage(created_at)}
            </Typography>
        </MessageContainer>
    );
};

export default EmojiMessage;
