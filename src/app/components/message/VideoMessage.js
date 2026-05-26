import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Linkify from 'react-linkify';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import { useStore } from '../../store/useStore';

import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';
import MessageContainer from './MessageContainer';

const VideoMessage = (props) => {
    const { content, created_at, isSentFromUser } = props;

    const {
        // data
        primaryColor,
        secondaryColor,
        isAiAgentState,
    } = useStore();

    const theme = useTheme();

    const styles = getMessageStyle({ primaryColor, secondaryColor, theme, isAiAgentState, isSentFromUser });

    return (
        <MessageContainer isSentFromUser={isSentFromUser}>
            <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a target="_blank" rel="noreferrer" href={decoratedHref} key={key}>
                        {decoratedText.slice(0, decoratedHref.indexOf('?'))}
                    </a>
                )}
            >
                <Typography variant="content1">{content.text.split('http').join('\nhttp')}</Typography>
            </Linkify>

            <Box
                sx={styles.videoCallBanner}
                onClick={() => {
                    if (content.url) {
                        window.open(content.url, '_blank');
                    }
                }}
            >
                <Box sx={styles.videoCallBannerIcon}>
                    <VideocamOutlinedIcon sx={{ fontSize: '2em', color: 'white' }} />
                </Box>

                <Box sx={styles.videoCallBannerMessage}>
                    <Typography variant="content3" color={theme.color.white}>
                        Video Confluence
                    </Typography>

                    <Typography variant="content4" color={theme.color.white}>
                        Come and join the video call
                    </Typography>
                </Box>
            </Box>

            <Typography variant="content2" sx={isSentFromUser && !isAiAgentState ? styles.userTime : styles.agentTime}>
                {getCreatedAtForMessage(created_at)}
            </Typography>
        </MessageContainer>
    );
};

export default VideoMessage;
