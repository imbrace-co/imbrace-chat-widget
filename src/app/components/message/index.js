import React from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';

import { useStore } from '../../store/useStore';

import TextMessage from './TextMessage';
import EmojiMessage from './EmojiMessage';
import FileMessage from './FileMessage';
import MultipleChoiceMessage from './MultipleChoiceMessage';
import VideoMessage from './VideoMessage';
import PDFMessage from './PDFMessage';
import CSVMessage from './CSVMessage';

import { messageType } from '../../constants/common';
import { getSenderInfo } from '../../helpers/business';
import AvatarAI from '../../../../public/aiAgent.svg';
import { AvatarIcon } from '../../assets/images';

const Message = (props) => {
    const {
        content,
        id,
        organization_id,
        business_unit_id,
        from,
        room_id,
        text,
        type,
        updated_at,
        created_at,
        file_id,
        quick_replies,
        isAIAgent,
        isLatestMessage,
    } = props;
    const { agentProfile, userList, channelId, fontSize } = useStore();
    const theme = useTheme();

    const senderInfo = getSenderInfo(channelId, from, userList);

    let contentClassList = ['sc-message--content', senderInfo.isSentFromUser ? 'sent' : 'received'];

    const styles = {
        senderContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
        },
        senderDisplayName: {
            wordBreak: 'break-word',
            fontSize: isAIAgent ? '12px' : 'inherit',
            fontWeight: isAIAgent ? 400 : 500,
            color: isAIAgent ? 'rgba(130, 130, 130, 1)' : 'rgba(79, 79, 79, 1)',
        },
    };

    return (
        <div className="sc-message" style={{ display: 'flex', flexDirection: 'column' }}>
            {!senderInfo.isSentFromUser && ( // only display icon and username if the message is received from someone
                <Box sx={styles.senderContainer}>
                    {/* <Avatar
                        src={isAIAgent ? AvatarAI : agentProfile.imageUrl}
                        sx={{
                            width: isAIAgent ? 30 : 35,
                            height: isAIAgent ? 30 : 35,
                            fontSize: 10,
                            background: '#f2f2f2',
                            '& svg': {
                                fill: '#e0e0e0',
                            },
                        }}
                    /> */}

                    {!isAIAgent && (
                        <AvatarIcon
                            style={{
                                width: 35,
                                height: 35,
                                fontSize: 10,
                            }}
                        />
                        // <Avatar
                        //     src={agentProfile.imageUrl}
                        //     sx={{
                        //         width: 35,
                        //         height: 35,
                        //         fontSize: 10,
                        //         background: '#f2f2f2',
                        //         '& svg': {
                        //             fill: '#e0e0e0',
                        //         },
                        //     }}
                        // />
                    )}

                    <Typography
                        variant="header2"
                        color={isAIAgent ? theme.color.lightGrey : theme.color.black}
                        sx={styles.senderDisplayName}
                    >
                        {agentProfile.name}
                    </Typography>
                </Box>
            )}
            <div
                className={contentClassList.join(' ')}
                style={{
                    '--custom-font-size': `${isAIAgent ? 14 : fontSize}px`,
                    ...(isAIAgent && {
                        maxWidth: senderInfo.isSentFromUser ? '500px' : '100%',
                        alignSelf: senderInfo.isSentFromUser ? 'flex-end' : 'flex-start',
                        lineHeight: isAIAgent ? '145%' : '100%',
                    }),
                }}
            >
                {messageType.response === type && (
                    <MultipleChoiceMessage
                        id={id}
                        business_unit_id={business_unit_id}
                        organization_id={organization_id}
                        room_id={room_id}
                        text={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        quick_replies={quick_replies}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.image === type && (
                    <FileMessage
                        id={id}
                        file_id={file_id}
                        business_unit_id={business_unit_id}
                        organization_id={organization_id}
                        room_id={room_id}
                        imgUrl={text}
                        fileName={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.text === type && (
                    <TextMessage
                        room_id={room_id}
                        text={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                        isLatestMessage={isLatestMessage}
                    />
                )}

                {messageType.messageTemplate === type && (
                    <TextMessage
                        room_id={room_id}
                        text={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.emoji === type && (
                    <EmojiMessage
                        id={id}
                        business_unit_id={business_unit_id}
                        organization_id={organization_id}
                        room_id={room_id}
                        emoji={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.quickReply === type && (
                    <TextMessage
                        room_id={room_id}
                        text={text}
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.jassConf === type && (
                    <VideoMessage
                        created_at={created_at}
                        updated_at={updated_at}
                        from={from}
                        isSentFromUser={senderInfo.isSentFromUser}
                        content={content}
                    />
                )}

                {messageType.pdf === type && (
                    <PDFMessage id={id} created_at={created_at} isSentFromUser={senderInfo.isSentFromUser} content={content} />
                )}
                {type.includes(messageType.csv) && (
                    <CSVMessage id={id} created_at={created_at} isSentFromUser={senderInfo.isSentFromUser} content={content} />
                )}
            </div>
        </div>
    );
};

export default Message;
