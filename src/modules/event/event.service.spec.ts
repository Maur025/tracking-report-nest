import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { EventClientService } from './event-client.service.js';
import { EventService } from './event.service.js';

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PdfReportService, useValue: {} },
        { provide: EventClientService, useValue: {} },
        { provide: EnterpriseConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
