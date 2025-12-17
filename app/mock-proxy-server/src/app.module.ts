import { Module } from '@nestjs/common';

import { ProxyModule } from './app/proxy/proxy.module';

@Module({
  imports: [ProxyModule],
})
export class AppModule {}
