import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import fs from 'fs/promises';
import EnvPlugin from './vite-plugin-env.js';

const config = ({ mode }) => {
    process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

    return defineConfig({
        base: '/',
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    svgoConfig: {
                        plugins: [
                            {
                                removeViewBox: false,
                            },
                        ],
                    },
                },
            }),
            EnvPlugin(mode),
        ],
        define: {
            'process.env': process.env,
            global: {},
            'import.meta.env.VITE_APP_ON_LOCAL_STORAGE': JSON.stringify(process.env.VITE_APP_ON_LOCAL_STORAGE),
        },
        server: {
            open: true,
            port: 5000,
            proxy: {
                '/api': {
                    target: 'http://localhost:9001n',
                    changeOrigin: true,
                    configure: (proxy) => {
                        proxy.on('proxyReq', function (proxyReq) {
                            console.log('Proxy to  => ', `${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
                        });
                        proxy.on('error', function () {
                            console.log('Error => forget to connect to our vpn?');
                        });
                    },
                    rewrite: (reqPath) => reqPath.replace(/^\/api/, ''),
                },
                '/ws': {
                    target: 'http://localhost:9001n',
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            outDir: 'build',
            target: browserslistToEsbuild(
                mode === 'development'
                    ? ['last 1 chrome version', 'last 15 firefox version', 'last 5 safari version']
                    : ['>0.2%', 'not dead', 'not op_mini all'],
            ),
        },
        css: {
            modules: {
                generateScopedName: 'imbrace_[local]_[hash:base64:5]',
                hashPrefix: 'imbrace',
            },
        },
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.jsx?$/,
            // loader: "tsx",
            // include: /src\/.*\.[tj]sx?$/,
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                plugins: [
                    {
                        name: 'load-js-files-as-jsx',
                        setup(build) {
                            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
                                loader: 'jsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            }));
                        },
                    },
                ],
            },
        },
    });
};

export default config;
