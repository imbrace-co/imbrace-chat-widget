import fs from 'fs';
import path from 'path';

export default function EnvPlugin(mode) {
    return {
        name: 'env',
        apply: 'build',
        generateBundle(options, bundle) {
            const directoryPath = path.resolve(__dirname, './public');
            fs.readdirSync(directoryPath).forEach((file) => {
                if (file.endsWith('.js') && file !== 'index.html') {
                    const filePath = path.join('build', file);
                    const htmlContent = fs.readFileSync(filePath, 'utf-8');
                    fs.writeFileSync(filePath, htmlContent.replace(/%VITE_APP_CHAT_WIDGET_HOST%/g, process.env.VITE_APP_CHAT_WIDGET_HOST));
                }
            });
        },
    };
}
