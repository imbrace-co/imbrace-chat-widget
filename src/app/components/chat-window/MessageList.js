import React, { useRef, useEffect } from 'react';
import { Waypoint } from 'react-waypoint';

import { useStore } from '../../store/useStore';

import Loading from '../Loading';

import Message from '../message';

const MessageList = ({ isAIAgent }) => {
    const {
        // data
        messageList,
        // boolean
        isLoadingMessages,
        setIsShowScrollToBottomButton,
        backgroundColor,
    } = useStore();

    let bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messageList]);

    return (
        <div id="sc-message-list" className="sc-message-list" style={{ background: backgroundColor }}>
            <div ref={bottomRef}></div>

            <Waypoint
                onLeave={() => setIsShowScrollToBottomButton(true)}
                onEnter={() => setIsShowScrollToBottomButton(false)}
                bottomOffset={'-50px'}
            />

            {isLoadingMessages ? (
                <Loading />
            ) : (
                messageList?.map((message, index) => {
                    const {
                        id,
                        business_unit_id,
                        organization_id,
                        room_id,
                        type,
                        text,
                        from,
                        created_at,
                        updated_at,
                        quick_replies,
                        content,
                    } = message;
                    const isLatestMessage = index === 0;
                    return (
                        <Message
                            key={id}
                            id={id}
                            business_unit_id={business_unit_id}
                            organization_id={organization_id}
                            room_id={room_id}
                            from={from}
                            type={type}
                            text={text}
                            created_at={created_at}
                            updated_at={updated_at}
                            quick_replies={quick_replies}
                            content={content}
                            isAIAgent={isAIAgent}
                            isLatestMessage={isLatestMessage}
                        />
                    );
                })
            )}
        </div>
    );
};

export default MessageList;
