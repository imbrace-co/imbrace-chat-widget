window.env = {
    VITE_APP_ON_LOCAL_STORAGE: '%VITE_APP_ON_LOCAL_STORAGE%',
};
setTimeout(() => {
    document.documentElement.setAttribute('local-storage-env', window.env.VITE_APP_ON_LOCAL_STORAGE);
    if (window.env.VITE_APP_ON_LOCAL_STORAGE === 'true') {
        document.addEventListener('DOMContentLoaded', function () {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './localResources/local-resource-font.css';
            document.head.appendChild(link);
        });
    } else {
        const head = document.head || document.getElementsByTagName('head')[0];

        const link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';

        const link3 = document.createElement('link');
        link3.rel = 'stylesheet';
        link3.href =
            'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap';

        head.appendChild(link1);
        head.appendChild(link2);
        head.appendChild(link3);
    }
}, 100);
