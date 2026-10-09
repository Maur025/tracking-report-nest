import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressClientService } from './progress-client.service.js';

describe('ProgressClientService', () => {
  let service: ProgressClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressClientService,
        {
          provide: HttpClient,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProgressClientService>(ProgressClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
