import React, { useEffect, useState, useRef } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';

import { useStore } from '../../store/useStore';

import { SendIcon, FileIcon, VoiceMessageIcon, VoiceCancelIcon, VoiceSendIcon } from '../../assets/images';

import PopupWindow from '../emoji-picker/PopupWindow';
import EmojiPicker from '../emoji-picker/EmojiPicker';
import EmojiPickerIcon from '../emoji-picker/EmojiPickerIcon';

import ScrollToBottomButton from './ScrollToBottomButton';
import { userInputFrom } from '../../constants/common';

const UserInput = (props) => {
    const { from, isAIAgent, inputRef } = props;

    const {
        // data
        primaryColor,
        // boolean
        isLoadingMessages,
        isShowScrollToBottomButton,
        // action
        showEmoji,
        onSubmitMessage,
        onFilesSelected,
        options,
        backgroundColor,
        isMessageStreamDone,
        agentProfile,
    } = useStore();

    const theme = useTheme();

    const userInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const [errorMessage, setErrorMessage] = useState();
    const [isListening, setIsListening] = useState(false);

    // const [inputActive, setInputActive] = useState(false);
    const [inputHasText, setInputHasText] = useState(false);
    const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);
    const [emojiFilter, setEmojiFilter] = useState('');
    let mediaRecorder;
    let audioChunks = [];
    let animationId;
    let audioContext;
    let stream;
    const styles = {
        outer: {
            textAlign: 'center',
            background: backgroundColor,
        },
        error: {
            fontSize: isAIAgent ? 14 : 12,
            color: '#E53C3C',
        },
        container: {
            textAlign: 'left',
            minHeight: '40px',
            height: '73px',
            position: 'relative',
            bottom: 0,
            display: 'flex',
            borderRadius: '10px',
            boxShadow: 'none',
            border: '1px solid #e0e0e0',
        },
        containerQuickReply: {
            marginTop: '15px',
            maxHeight: '70px',
        },
        containerChatWindow: {
            margin: '5px 20px 20px 20px',
            maxHeight: '150px',
            ...(isAIAgent && {
                backgroundColor: theme.color.grey,
            }),
        },
        containerActive: {
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
            background: theme.color.white,
        },
        textInputContainer: {
            borderRadius: '8px',
            // padding: '17px 18px',
            // width: '80%',
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            padding: '12px',
            fontSize: isAIAgent ? '14px' : '12px',
            fontWeight: '500',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: theme.color.lightGrey,
            bottom: 0,
            overflowX: 'hidden !important',
            overflowY: 'auto',
            '&:empty:before': {
                content: '"Write a reply..."',
                display: 'block',
                color: '#828282',
            },
            '& span': {
                fontSize: isAIAgent ? '14px!important' : '12px!important',
                color: '#828282!important',
                background: 'transparent!important',
            },
        },
        iconsContainer: {
            display: 'flex',
            alignItems: 'end',
            padding: '8px',
            gap: '15px',
        },
        iconContainer: {
            width: '24px',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        voiceMessagePart: {
            position: 'relative',
            height: '29px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 20px',
        },
        voiceIconControl: {
            position: 'absolute',
            right: '0',
            height: '100%',
            bottom: '0',
        },
        send: { fill: isMessageStreamDone ? primaryColor : theme.color.lightGrey },
        file: {
            fill: isMessageStreamDone ? primaryColor : theme.color.lightGrey,
        },
    };

    useEffect(() => {
        if (from === userInputFrom.quickReply) {
            userInputRef?.current?.focus();
        }
    }, [from]);

    useEffect(() => {
        if (options.prefillMessage && userInputRef?.current) {
            userInputRef.current.textContent = options.prefillMessage;
            setInputHasText(true);
        }
    }, [options.prefillMessage]);

    const handleKeyDown = (event) => {
        if (errorMessage) {
            setErrorMessage(undefined);
        }
        if (event.keyCode === 13 && !event.shiftKey) {
            submitText(event);
        }
    };

    const handleKeyUp = (event) => {
        setInputHasText(event.target.innerHTML.length !== 0 && event.target.innerText !== '\n');
    };

    const showFilePicker = () => {
        if (!isMessageStreamDone) {
            return;
        }
        fileInputRef.current?.click();
        if (errorMessage) {
            setErrorMessage(undefined);
        }
    };

    const toggleEmojiPicker = (e) => {
        if (errorMessage) {
            setErrorMessage(undefined);
        }
        e.preventDefault();
        if (isLoadingMessages || !isMessageStreamDone) {
            return;
        }

        setEmojiPickerIsOpen((prevState) => !prevState);
    };

    const closeEmojiPicker = (e) => {
        setEmojiPickerIsOpen(false);
    };

    const submitText = (event) => {
        event.preventDefault();
        if (!isMessageStreamDone) {
            return;
        }
        const text = userInputRef?.current?.innerText;

        if (text.trim().length <= 0) {
            return;
        }

        onSubmitMessage({
            author: 'me',
            type: 'text',
            data: { text },
        });

        if (userInputRef && userInputRef.current) {
            userInputRef.current.innerHTML = '';
        }

        setInputHasText(false);
    };

    const onFilesSelectedAction = async (event) => {
        try {
            if (event.target.files && event.target.files.length > 0) {
                await onFilesSelected(event.target.files);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            event.stopPropagation();
            event.preventDefault();
        } catch (error) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (error.message === 'file size is over 5 mb') {
                setErrorMessage('The attachment file size should be less than 5MB');
            }
            if (error.message === 'unsupported file type') {
                setErrorMessage('Can not upload an unsupported file.');
            }
            console.log(error);
        }
    };

    const handleEmojiPicked = (emoji) => {
        setEmojiPickerIsOpen(false);

        if (inputHasText) {
            if (userInputRef && userInputRef.current) {
                userInputRef.current.textContent += emoji;
            }
        } else {
            onSubmitMessage({
                author: 'me',
                type: 'emoji',
                data: { emoji },
            });
        }
    };

    const handleEmojiFilterChange = (event) => {
        setEmojiFilter(event.target.value);
    };

    const renderEmojiPopup = () => (
        <PopupWindow isOpen={emojiPickerIsOpen} onClickedOutside={closeEmojiPicker} onInputChange={handleEmojiFilterChange}>
            <EmojiPicker onEmojiPicked={handleEmojiPicked} filter={emojiFilter} />
        </PopupWindow>
    );

    const renderSendOrFileIcon = () => {
        if (inputHasText) {
            return (
                <Box sx={styles.iconContainer}>
                    <IconButton onClick={submitText} sx={styles.send}>
                        <SendIcon />
                    </IconButton>
                </Box>
            );
        }

        return (
            <Box sx={styles.iconContainer}>
                <IconButton onClick={showFilePicker} sx={styles.file}>
                    <FileIcon />
                </IconButton>

                <input
                    type="file"
                    name="files[]"
                    accept="image/png, image/jpeg, image/gif, application/pdf, text/csv, application/csv, application/vnd.ms-excel, application/x-csv, text/plain, .csv"
                    ref={fileInputRef}
                    onChange={onFilesSelectedAction}
                    style={{ display: 'none' }}
                />
            </Box>
        );
    };

    const handleBeforeInput = (event) => {
        if (event.inputType === 'insertFromPaste') {
            event.preventDefault();
            const pastedText = event.clipboardData ? event.clipboardData.getData('text/plain') : event.dataTransfer.getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(pastedText);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            setInputHasText(userInputRef.current.innerText.trim().length > 0);
        }
    };

    const handelSendVoiceMessage = () => {
        stopRecording();
        setIsListening(false);
    };

    const startRecording = () => {
        console.log('startRecording');
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (s) {
                console.log('success', s);
                stream = s;
                audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                source.connect(analyser);

                const canvas = document.getElementById('wave-canvas');
                const ctx = canvas.getContext('2d');
                const bufferLength = analyser.fftSize;
                const dataArray = new Uint8Array(bufferLength);

                function drawWave() {
                    animationId = requestAnimationFrame(drawWave);
                    analyser.getByteTimeDomainData(dataArray);

                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;

                    ctx.fillStyle = 'grey';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#000';
                    ctx.beginPath();

                    const sliceWidth = canvas.width / bufferLength;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        const v = dataArray[i] / 128.0;
                        const y = (v * canvas.height) / 2;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }

                        x += sliceWidth;
                    }

                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.stroke();
                }

                drawWave();

                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = function (event) {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = function () {
                    console.log('onstop...');
                    cancelAnimationFrame(animationId);
                    var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    console.log('call api send audio...', audioBlob);
                };

                mediaRecorder.start();

                setTimeout(() => {
                    mediaRecorder.stop();
                    stream.getTracks().forEach((track) => track.stop());
                    audioContext.close();
                }, 5000);

                console.log('Recording...');
            })
            .catch(function (err) {
                console.error('Error when get micro:', err);
            });
    };

    const stopRecording = () => {
        console.log('Stopping recording...');
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }

        if (audioContext) {
            audioContext.close();
        }
    };
    const renderSendHeader = () => {
        return (
            <Box sx={styles.voiceMessagePart}>
                <Box sx={styles.voiceIconControl}>
                    <IconButton onClick={submitText} sx={styles.send}>
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        );
    };
    const renderVoiceHeader = () => {
        return (
            <Box sx={styles.voiceMessagePart}>
                <span
                    style={{
                        color: 'rgba(189, 189, 189, 1)',
                        fontSize: '12px',
                    }}
                >
                    {`${agentProfile.name} is listening...`}
                </span>
                <Box sx={styles.voiceIconControl}>
                    <IconButton>
                        <VoiceSendIcon
                            onClick={() => handelSendVoiceMessage()}
                            style={{
                                width: '29px',
                                height: '29px',
                            }}
                        />
                    </IconButton>
                    <IconButton>
                        <VoiceCancelIcon
                            onClick={() => {
                                stopRecording();
                                setIsListening(false);
                            }}
                            style={{
                                marginLeft: '5px',
                                width: '29px',
                                height: '29px',
                            }}
                        />
                    </IconButton>
                </Box>
            </Box>
        );
    };

    const handleVoiceListening = () => {
        if (!isMessageStreamDone) {
            return;
        }
        setIsListening(true);
        startRecording();
        setInputHasText(false);
    };

    return (
        <div style={{ ...styles.outer }}>
            <span style={{ ...styles.error }}>{errorMessage}</span>
            {isListening && renderVoiceHeader()}
            <form
                style={{
                    ...styles.container,
                    ...(from === userInputFrom.quickReply ? styles.containerQuickReply : styles.containerChatWindow),
                }}
            >
                {isShowScrollToBottomButton && <ScrollToBottomButton />}

                {!isListening && (
                    <>
                        <Box
                            sx={styles.textInputContainer}
                            role="button"
                            tabIndex="0"
                            onBeforeInput={handleBeforeInput}
                            ref={userInputRef}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            contentEditable={isLoadingMessages ? 'false' : 'true'}
                            onDrop={(event) => event.preventDefault()}
                            suppressContentEditableWarning={true}
                        />
                        {!isLoadingMessages && (
                            <Box sx={styles.iconsContainer}>
                                {showEmoji && options.emoji && (
                                    <Box sx={styles.iconContainer}>
                                        <EmojiPickerIcon
                                            onClick={toggleEmojiPicker}
                                            isActive={emojiPickerIsOpen}
                                            tooltip={renderEmojiPopup()}
                                        />
                                    </Box>
                                )}
                                {/* <IconButton>
                                    <VoiceMessageIcon
                                        onClick={() => handleVoiceListening()}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            fill: theme.color.lightGrey,
                                        }}
                                    />
                                </IconButton> */}
                                {renderSendOrFileIcon()}
                            </Box>
                        )}
                    </>
                )}
                {isListening && (
                    <Box sx={styles.textInputContainer}>
                        <canvas id="wave-canvas"></canvas>
                    </Box>
                )}
            </form>
        </div>
    );
};

export default UserInput;
