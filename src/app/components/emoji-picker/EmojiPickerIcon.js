import React from 'react';
import { IconButton, useTheme } from '@mui/material';

import { EmojiIcon } from '../../assets/images';

import { useStore } from '../../store/useStore';

const EmojiPickerIcon = (props) => {
    const { tooltip, onClick, isActive } = props;

    const {
        // data
        primaryColor,
        isMessageStreamDone,
    } = useStore();

    const theme = useTheme();

    const styles = {
        emoji: {
            fill: isActive || isMessageStreamDone ? primaryColor : theme.color.lightGrey,
        },
    };

    return (
        <>
            {tooltip}

            <IconButton onClick={onClick} sx={styles.emoji}>
                <EmojiIcon />
            </IconButton>
        </>
    );
};

export default EmojiPickerIcon;
