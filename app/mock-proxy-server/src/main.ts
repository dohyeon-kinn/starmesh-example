import { NestFactory } from '@nestjs/core';
import { Server } from 'proxy-chain';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors();
  const proxyServer = new Server({
    port: 8000,
    verbose: true,
    prepareRequestFunction: () => {
      return {
        requestAuthentication: false,
        upstreamProxyUrl: null,
      };
    },
  });
  await proxyServer.listen();
  proxyServer.on('connection', (connection) => {
    console.log(connection);
  });
  proxyServer.on('request', (request) => {
    console.log(request);
  });
}

bootstrap();
