import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PaginationDto } from './pagination.dto.js';

describe('PaginationDto', () => {
  it('should apply the default values', () => {
    // WHEN
    const dto = new PaginationDto();

    // THEN
    expect(dto.sortBy).toBe('id');
    expect(dto.descending).toBe(false);
    expect(dto.page).toBe(0);
    expect(dto.size).toBe(10);
  });

  it('should transform the descending flag from a query string', () => {
    // WHEN
    const dto = plainToInstance(PaginationDto, { descending: 'true' });

    // THEN
    expect(dto.descending).toBe(true);
  });

  it('should accept valid pagination values', async () => {
    // GIVEN
    const dto = plainToInstance(PaginationDto, {
      sortBy: 'name',
      descending: 'true',
      page: 2,
      size: 25,
    });

    // WHEN
    const errors = await validate(dto);

    // THEN
    expect(errors).toHaveLength(0);
  });

  it('should reject a negative page and a size below one', async () => {
    // GIVEN
    const dto = plainToInstance(PaginationDto, { page: -1, size: 0 });

    // WHEN
    const errors = await validate(dto);

    // THEN
    const properties = errors.map((error) => error.property);
    expect(properties).toContain('page');
    expect(properties).toContain('size');
  });
});
