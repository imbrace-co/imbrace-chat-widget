import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Error as ErrorIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';

import { useStore } from '../../store/useStore';

import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';

import en from '../../translations/en';
import MessageContainer from './MessageContainer';

const FileMessage = (props) => {
    const { isSentFromUser, created_at, content } = props;

    const {
        // data
        primaryColor,
        secondaryColor,
        isAiAgentState,
    } = useStore();

    const theme = useTheme();

    const styles = getMessageStyle({ primaryColor, secondaryColor, theme, isAiAgentState, isSentFromUser });

    const [isImageEnlarged, setIsImageEnlarged] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isImageError, setIsImageError] = useState(false);

    return (
        <MessageContainer
            isSentFromUser={isSentFromUser}
            sx={{
                ...styles.fileContainer,
                ...(isImageEnlarged ? styles.fileImageEnlarge : undefined),
            }}
            innerSx={{
                ...styles.fileImageInnerContainer,
            }}
        >
            {isImageError ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon sx={{ width: '20px', height: '20px', mr: 0.5 }} />
                    <Typography variant="content1">{en.message.unsupportedMessageType}</Typography>
                </Box>
            ) : (
                <>
                    <img style={styles.fileImage} src={content.url} alt={content.url} onError={() => setIsImageError(true)}></img>

                    <Box
                        sx={styles.fileImageOverlay}
                        onClick={() => setIsImageEnlarged((prevState) => !prevState)}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        {isHovering && (
                            <React.Fragment>
                                {isImageEnlarged ? <ZoomOutIcon /> : <ZoomInIcon />}
                                {isImageEnlarged ? 'Click to zoom out' : 'Click to zoom in'}
                            </React.Fragment>
                        )}
                    </Box>
                </>
            )}

            <Typography variant="content2" sx={isSentFromUser && !isAiAgentState ? styles.userTime : styles.agentTime}>
                {getCreatedAtForMessage(created_at)}
            </Typography>
        </MessageContainer>
    );
};

export default FileMessage;
