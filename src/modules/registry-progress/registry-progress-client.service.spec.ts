import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RegistryProgressClientService } from './registry-progress-client.service.js';

describe('RegistryProgressClientService', () => {
  let service: RegistryProgressClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressClientService,
        { provide: HttpClient, useValue: {} },
      ],
    }).compile();

    service = module.get<RegistryProgressClientService>(
      RegistryProgressClientService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
