import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventConsumerService } from './event-consumer.service.js';
import { EventService } from './event.service.js';

describe('ConsumerService', () => {
  let service: EventConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventConsumerService,
        { provide: EventService, useValue: {} },
      ],
    }).compile();

    service = module.get<EventConsumerService>(EventConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
