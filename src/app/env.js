let runtimeEnv = null;

export const loadRuntimeEnv = async () => {
    try {
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error(`Failed to load environment: ${response.status}`);
        }
        runtimeEnv = await response.json();
        console.log('✅ window.env LOADED:', runtimeEnv);

        Object.defineProperty(window, 'env', {
            value: {
                ...import.meta.env,
                ...runtimeEnv,
            },
            writable: false,
        });
    } catch (err) {
        console.error('❌ Failed to load /config:', err);
        window.env = import.meta.env;
    }
};

export const getEnv = () => {
    return window.env || import.meta.env;
};
