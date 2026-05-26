import React from 'react';
import { Button, Box, useTheme } from '@mui/material';

import { ArrowIcon } from '../../assets/images';

const ScrollToBottomButton = () => {
    const theme = useTheme();

    return (
        <Button
            onClick={() => {
                const messageList = document.getElementById('sc-message-list');

                if (messageList) {
                    messageList.scrollTo({
                        top: messageList.scrollHeight,
                        behavior: 'smooth',
                    });
                }
            }}
            sx={{
                position: 'absolute',
                right: '0px',
                top: '-80px',
            }}
        >
            <Box
                sx={{
                    width: '40px',
                    height: '40px',
                    background: theme.color.grey,
                    boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.16)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ArrowIcon />
            </Box>
        </Button>
    );
};

export default ScrollToBottomButton;
