require('dotenv').config();

(async () => {
    const { connection } = require('mongoose');
    const https = require('https');
    const fs = require('node:fs').promises;

    const app = require('./app');

    const { PORT, HTTPS_PORT } = process.env;
    const { PRIVATE_KEY_PATH, CERTIFICATE_PATH } = process.env;

    const privateKey = await fs.readFile(PRIVATE_KEY_PATH, 'utf-8');
    const certificate = await fs.readFile(CERTIFICATE_PATH, 'utf-8');

    const httpsOption = {
        key: privateKey,
        cert: certificate,
    };

    const httpsServer = https.createServer(httpsOption, app);

    const serverOpenHandler = (name) => {
        const now = (new Date()).toString();

        console.log(`${name} opened at ${now}`);
    };

    app.listen(PORT, serverOpenHandler('HTTP server'));
    httpsServer.listen(HTTPS_PORT, serverOpenHandler('HTTPS server'));

    process.on('exit', () => {
        connection.close();
    });
})();