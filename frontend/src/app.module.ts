import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ApiClient } from './api.client.js';

@Module({
  controllers: [AppController],
  providers: [ApiClient],
})
export class AppModule {}
