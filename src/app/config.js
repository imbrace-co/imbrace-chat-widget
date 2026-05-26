window.env = {
    VITE_APP_ON_LOCAL_STORAGE: import.meta.env.VITE_APP_ON_LOCAL_STORAGE || 'false',
};

console.log('✅ window.env LOADED:', window.env);
document.addEventListener('DOMContentLoaded', function () {
    function checkEnvAndApplyStyles() {
        if (!window.env) {
            setTimeout(checkEnvAndApplyStyles, 500);
            return;
        }

        console.log('window.env', window.env);
        document.documentElement.setAttribute('local-storage-env', window.env?.VITE_APP_ON_LOCAL_STORAGE || 'false');
        if (window.env.VITE_APP_ON_LOCAL_STORAGE === 'true') {
            console.log('offline');
            document.addEventListener('DOMContentLoaded', function () {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = './public/localResources/local-resource-font.css';
                document.head.appendChild(link);
            });
        } else {
            console.log('online');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap';
            document.head.appendChild(link);
        }
    }

    checkEnvAndApplyStyles();
});
