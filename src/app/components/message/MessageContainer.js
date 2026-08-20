import { TinyColor } from '@ctrl/tinycolor';
import { Box, useTheme } from '@mui/material';
import { getMessageStyle } from '../../helpers/message';
import { useStore } from '../../store/useStore';

const textColor = (color) => (new TinyColor(color).isLight() ? '#333' : '#fff');

const MessageContainer = ({ isSentFromUser, children, sx, innerSx, extra }) => {
    const { primaryColor, secondaryColor, isAiAgentState } = useStore();
    const theme = useTheme();

    const styles = getMessageStyle({
        primaryColor,
        secondaryColor,
        textColor: textColor(isSentFromUser ? primaryColor : secondaryColor),
        theme,
        isAiAgentState,
        isSentFromUser,
    });

    return (
        <Box sx={{ ...styles.container, maxWidth: isAiAgentState ? '90%' : '60%', ...sx }}>
            <Box
                sx={{
                    ...styles.innerContainer,
                    ...(isSentFromUser ? styles.userMessage : styles.agentMessage),
                    ...innerSx,
                }}
            >
                {children}
            </Box>
            {extra}
        </Box>
    );
};
export default MessageContainer;
