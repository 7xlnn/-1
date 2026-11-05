import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';

function parsePort(): number {
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
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  // 1. 开启优雅关闭 Hooks (关键!)
  app.enableShutdownHooks();

  // 2. 解析端口
  const port = parsePort();

  // 3. 托管前端静态产物（H5 构建输出 dist-web，位于项目根目录）
  const distWeb = path.resolve(__dirname, '../../dist-web');
  const server = app.getHttpAdapter().getInstance();
  if (fs.existsSync(distWeb)) {
    // 静态资源
    server.use(express.static(distWeb));
    // SPA 回退：非 /api 路径都落到 index.html，避免刷新/直达子路由 404
    server.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      const indexPath = path.join(distWeb, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
    console.log(`Static frontend hosting enabled at ${distWeb}`);
  } else {
    console.warn(`Static frontend not found at ${distWeb}, skipping SPA hosting`);
  }

  try {
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 被占用，请设置其他 SERVER_PORT 后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
