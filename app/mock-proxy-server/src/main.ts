import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors();

  app.use('/proxy', (req, res, next) => {
    const raw = req.query?.url;
    if (!raw || typeof raw !== 'string' || !raw.startsWith('http')) {
      res.status(400).send('Missing ?url=');
      return;
    }

    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      res.status(400).send('Invalid url');
      return;
    }

    return createProxyMiddleware({
      target: url.origin,
      changeOrigin: true,
      secure: true,
      followRedirects: true,
      pathRewrite: () => `${url.pathname}${url.search}`,
    })(req, res, next);
  });

  await app.listen(4000);
}

bootstrap();
