import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportManagementController } from './report-management.controller.js';
import { ReportManagementService } from './report-management.service.js';

describe('ReportManagementController', () => {
  let controller: ReportManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportManagementController],
      providers: [{ provide: ReportManagementService, useValue: {} }],
    }).compile();

    controller = module.get<ReportManagementController>(
      ReportManagementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
