const mHandleNetworkError = (res) => {
    const status = res.status;
    if (status > 209) {
        console.log('mHandleNetworkError =', res);
        const message = 'system error';
        const code = status;
        return Promise.reject({
            code,
            message,
        });
    }
    return res;
};

export { mHandleNetworkError };
