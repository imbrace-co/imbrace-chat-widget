import React, { useEffect } from 'react';

import { useStore } from '../store/useStore';

import ChatWindow from './chat-window/ChatWindow';

import launcherIcon from '../assets/images/icon-chat.svg';
import launcherIconActive from '../assets/images/icon-close.svg';

import incomingMessageSound from '../assets/sounds/notification.mp3';

const playIncomingMessageSound = () => {
    const audio = new Audio(incomingMessageSound);
    audio.play();
};

const Launcher = (props) => {
    const {
        // data
        messageList,
        // newMessagesCount,
        primaryColor,
        // boolean
        isWidgetOpen,
        isMute,
        // action
        onOpenChatWidget,
    } = useStore();

    useEffect(() => {
        if (isMute) {
            return;
        }

        const nextMessage = messageList[messageList.length - 1];
        const isIncoming = (nextMessage || {}).author === 'them';

        if (isIncoming) {
            playIncomingMessageSound();
        }
    }, [messageList, isMute]);

    const classList = ['sc-launcher', isWidgetOpen ? 'opened' : ''];

    return (
        <div id="sc-launcher">
            <div
                className={classList.join(' ')}
                style={{ backgroundColor: primaryColor }}
                // onTouchStart={() => {
                //     onOpenChatWidget();
                // }}
                // onMouseDown={() => {
                //     onOpenChatWidget();
                // }}
                onClick={() => {
                    onOpenChatWidget();
                }}
            >
                {/* <MessageCount count={newMessagesCount} isWidgetOpen={isWidgetOpen} /> */}
                <img className={'sc-open-icon'} src={launcherIconActive} alt={''} />
                <img className={'sc-closed-icon'} src={launcherIcon} alt={''} />
            </div>

            <ChatWindow />
        </div>
    );
};

// const MessageCount = ({ count, isWidgetOpen }) => {
//   if (count === 0 || isWidgetOpen === true) {
//     return null;
//   }

//   return <div className={"sc-new-messages-count"}>{count}</div>;
// };

export default Launcher;
