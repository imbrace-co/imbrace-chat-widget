import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import moment from 'moment';

import { CSVIcon } from '../../assets/images';

import { useStore } from '../../store/useStore';

import { getCreatedAtForMessage } from '../../helpers/date';
import { getMessageStyle } from '../../helpers/message';
import MessageContainer from './MessageContainer';

const CSVMessage = (props) => {
    const { isSentFromUser, created_at, content } = props;
    const { url } = content || {};

    const {
        // data
        primaryColor,
        secondaryColor,
        isAiAgentState,
    } = useStore();

    const theme = useTheme();

    const styles = getMessageStyle({ primaryColor, secondaryColor, theme, isAiAgentState, isSentFromUser });

    const [fileSize, setFileSize] = useState();

    useEffect(() => {
        const checkSize = async () => {
            try {
                if (url) {
                    const resp = await fetch(url, {
                        method: 'HEAD',
                    });

                    const contentLength = resp.headers.get('Content-Length');

                    if (contentLength) {
                        setFileSize(parseInt(contentLength, 10) / 1024 / 1024);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        checkSize();
    }, [url]);

    return (
        <MessageContainer isSentFromUser={isSentFromUser}>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                download
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    color: 'inherit',
                    textDecoration: 'none',
                    alignItems: 'center',
                }}
            >
                <CSVIcon style={{ width: '40px', height: '40px' }} />

                <Box
                    sx={{
                        mx: 2,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="header2">{moment(created_at).format('dddd ll')}</Typography>
                    <Typography variant="header2">{fileSize !== undefined && <>{`${fileSize.toFixed(1)}MB`}</>}</Typography>
                </Box>
            </a>

            <Typography variant="content2" sx={isSentFromUser && !isAiAgentState ? styles.userTime : styles.agentTime}>
                {getCreatedAtForMessage(created_at)}
            </Typography>
        </MessageContainer>
    );
};

export default CSVMessage;
