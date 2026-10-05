import { Module } from '@nestjs/common';
import { EventClientService } from './event-client.service.js';
import { EventController } from './event.controller.js';
import { EventService } from './event.service.js';

@Module({
  controllers: [EventController],
  providers: [EventService, EventClientService],
})
export class EventModule {}
