"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const path = require("path");
const fs = require("fs");
const http_status_interceptor_1 = require("./interceptors/http-status.interceptor");
function parsePort() {
    const args = process.argv.slice(2);
    const portIndex = args.indexOf('-p');
    if (portIndex !== -1 && args[portIndex + 1]) {
        const port = parseInt(args[portIndex + 1], 10);
        if (!isNaN(port) && port > 0 && port < 65536) {
            return port;
        }
    }
    const envPort = parseInt(process.env.SERVER_PORT || '', 10);
    if (!isNaN(envPort) && envPort > 0 && envPort < 65536) {
        return envPort;
    }
    const railwayPort = parseInt(process.env.PORT || '', 10);
    if (!isNaN(railwayPort) && railwayPort > 0 && railwayPort < 65536) {
        return railwayPort;
    }
    return 3000;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalInterceptors(new http_status_interceptor_1.HttpStatusInterceptor());
    app.enableShutdownHooks();
    const port = parsePort();
    const distWeb = path.resolve(__dirname, '../../dist-web');
    const server = app.getHttpAdapter().getInstance();
    if (fs.existsSync(distWeb)) {
        server.use(express.static(distWeb));
        server.get('*', (req, res, next) => {
            if (req.originalUrl.startsWith('/api'))
                return next();
            const indexPath = path.join(distWeb, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            }
            else {
                next();
            }
        });
        console.log(`Static frontend hosting enabled at ${distWeb}`);
    }
    else {
        console.warn(`Static frontend not found at ${distWeb}, skipping SPA hosting`);
    }
    try {
        await app.listen(port);
        console.log(`Server running on http://localhost:${port}`);
    }
    catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ 端口 ${port} 被占用，请设置其他 SERVER_PORT 后重试。`);
            process.exit(1);
        }
        else {
            throw err;
        }
    }
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map