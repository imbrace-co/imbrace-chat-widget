/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';

const PopupWindow = (props) => {
    const { isOpen, onClickedOutside, onInputChange, children } = props;

    let scQuickReply;
    let scLauncher;
    let emojiPopup = useRef(null);

    useEffect(() => {
        scQuickReply = document.querySelector('#sc-quick-reply');
        scLauncher = document.querySelector('#sc-launcher');

        if (scQuickReply) {
            scQuickReply.addEventListener('click', interceptLauncherClick);
        }

        if (scLauncher) {
            scLauncher.addEventListener('click', interceptLauncherClick);
        }

        return () => {
            if (scQuickReply) {
                scQuickReply.removeEventListener('click', interceptLauncherClick);
            }

            if (scLauncher) {
                scLauncher.removeEventListener('click', interceptLauncherClick);
            }
        };
    }, [isOpen]);

    const interceptLauncherClick = (e) => {
        const clickedOutside = !emojiPopup?.current?.contains(e.target) && isOpen;
        clickedOutside && onClickedOutside(e);
    };

    const handleKeyDown = (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
        }
    };

    return (
        <div className="sc-popup-window" ref={emojiPopup}>
            <div className={`sc-popup-window--container ${isOpen ? '' : 'closed'}`}>
                <input
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    className="sc-popup-window--search"
                    placeholder="Search emoji..."
                />
                {children}
            </div>
        </div>
    );
};

export default PopupWindow;
