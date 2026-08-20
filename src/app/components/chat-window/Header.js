import React from 'react';
import { Avatar, Box, IconButton, Skeleton, Typography, useTheme } from '@mui/material';

import { useStore } from '../../store/useStore';

import { CloseIcon, AvatarIcon } from '../../assets/images';
import { TinyColor } from '@ctrl/tinycolor';

const textColor = (color) => (new TinyColor(color).isLight() ? '#333' : '#fff');

const Header = () => {
    const {
        // data
        headerColor,
        // boolean
        isLoadingChannel,
        // action
        onCloseChatWidget,
        window,
        options,
    } = useStore();

    const theme = useTheme();

    const styles = {
        container: {
            maxHeight: '80px',
            padding: '15px 20px 15px 20px',
            display: 'flex',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            alignItems: 'center',
            background: headerColor,
            gap: '18px',
        },
        logo: {
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            background: '#e0e0e0',
        },
        close: { width: '24px', height: '24px', fill: textColor(headerColor) ?? theme.color.white },
    };

    return (
        <Box sx={{ ...styles.container, ...(options.removeBorderRadius && { borderRadius: '0' }) }}>
            {isLoadingChannel ? (
                <div style={styles.logo}>
                    <Skeleton variant="circular" width={35} height={35} />
                </div>
            ) : (
                <AvatarIcon
                    style={{
                        ...styles.logo,
                    }}
                />
            )}

            <Typography sx={{ flex: 1, textDecoration: 'underline' }} variant="header1" color={textColor(headerColor) ?? theme.color.white}>
                {isLoadingChannel ? <Skeleton /> : window.name}
            </Typography>

            {!options.hideCloseButton && (
                <IconButton onClick={onCloseChatWidget}>
                    <CloseIcon style={{ ...styles.close }} />
                </IconButton>
            )}
        </Box>
    );
};

export default Header;
