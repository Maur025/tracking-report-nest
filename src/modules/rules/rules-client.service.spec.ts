import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RulesClientService } from './rules-client.service.js';

describe('RulesClientService', () => {
  let service: RulesClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesClientService,
        {
          provide: HttpClient,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RulesClientService>(RulesClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});