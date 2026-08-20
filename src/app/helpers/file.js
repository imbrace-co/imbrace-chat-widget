const supportedImageType = ['image/jpeg', 'image/tiff', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif'];
const supportedVideoType = ['video/mp4'];
const supportedAudioType = ['audio/mpeg'];
const supportedPdfType = ['application/pdf'];
const supportedCsvType = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'application/x-csv', 'text/plain', '.csv'];
const supportedOtherType = [
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const isPdfFile = (fileType) => {
    return supportedPdfType.indexOf(fileType) !== -1;
};
export const isCsvFile = (fileType) => {
    return supportedCsvType.indexOf(fileType) !== -1;
};
export const isImageFile = (fileType) => {
    return supportedImageType.indexOf(fileType) !== -1;
};
export const isAudioFile = (fileType) => {
    return supportedAudioType.indexOf(fileType) !== -1;
};
export const isVideoFile = (fileType) => {
    return supportedVideoType.indexOf(fileType) !== -1;
};
export const isOtherFile = (fileType) => {
    return supportedOtherType.indexOf(fileType) !== -1;
};
export const getFileMessageType = (fileType) => {
    if (isPdfFile(fileType)) {
        return 'pdf';
    }
    if (isImageFile(fileType)) {
        return 'image';
    }
    if (isCsvFile(fileType)) {
        return 'csv';
    }
    // if (isAudioFile(fileType)) {
    //     return 'audio';
    // }
    // if (isVideoFile(fileType)) {
    //     return 'video';
    // }
    // if (isOtherFile(fileType)) {
    //     return 'file';
    // }
    return '';
};
export const validateFile = (fileType) => {
    return (
        [
            ...supportedImageType,
            ...supportedVideoType,
            ...supportedPdfType,
            ...supportedAudioType,
            ...supportedCsvType,
            ...supportedOtherType,
        ].indexOf(fileType) !== -1
    );
};
