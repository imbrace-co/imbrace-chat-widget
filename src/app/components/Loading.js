import React from 'react';

import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => {
    return (
        <div className="sc-chat-window-loading">
            <CircularProgress color="inherit" />
        </div>
    );
};

export default Loading;
