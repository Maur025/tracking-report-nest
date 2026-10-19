import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto.js';
import { EnterpriseController } from './enterprise.controller.js';
import { EnterpriseService } from './enterprise.service.js';

describe('EnterpriseController', () => {
  let controller: EnterpriseController;
  let mockService: {
    create: Mock;
    findAll: Mock;
    findOne: Mock;
    remove: Mock;
  };

  beforeEach(async () => {
    mockService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterpriseController],
      providers: [{ provide: EnterpriseService, useValue: mockService }],
    }).compile();

    controller = module.get<EnterpriseController>(EnterpriseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate creation to the service', () => {
    // GIVEN
    const dto = { name: 'Acme' } as CreateEnterpriseDto;
    mockService.create.mockReturnValue('enterprise-id');

    // WHEN
    const result = controller.create(dto);

    // THEN
    expect(result).toBe('enterprise-id');
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate the remaining operations to the service', async () => {
    // GIVEN
    const paginationDto = { page: 0, size: 10 } as PaginationDto;

    // WHEN
    await controller.findAll(paginationDto);
    await controller.findOne('1');
    await controller.remove('1');

    // THEN
    expect(mockService.findAll).toHaveBeenCalledWith(paginationDto);
    expect(mockService.findOne).toHaveBeenCalledWith('1');
    expect(mockService.remove).toHaveBeenCalledWith('1');
  });
});
