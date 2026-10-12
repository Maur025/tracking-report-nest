import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RegistryProgressController } from './registry-progress.controller.js';
import { RegistryProgressService } from './registry-progress.service.js';

describe('RegistryProgressController', () => {
  let controller: RegistryProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryProgressController],
      providers: [{ provide: RegistryProgressService, useValue: {} }],
    }).compile();

    controller = module.get<RegistryProgressController>(
      RegistryProgressController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
