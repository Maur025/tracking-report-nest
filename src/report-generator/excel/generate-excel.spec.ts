import { PassThrough } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { generateExcel } from './generate-excel.js';

describe('generateExcel', () => {
  it('should return a stream and a streaming workbook', () => {
    // WHEN
    const { stream, workbook, closeWorkbook } = generateExcel();

    // THEN
    expect(stream).toBeInstanceOf(PassThrough);
    expect(workbook).toBeDefined();
    expect(closeWorkbook).toBeInstanceOf(Function);
  });

  it('should configure the workbook views', () => {
    // WHEN
    const { workbook } = generateExcel();

    // THEN
    expect(workbook.views).toEqual([
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ]);
  });

  it('should commit the workbook when the workbook is closed', async () => {
    // GIVEN
    const { workbook, closeWorkbook } = generateExcel();
    const commit = vi.spyOn(workbook, 'commit');

    // WHEN
    await closeWorkbook();

    // THEN
    expect(commit).toHaveBeenCalledTimes(1);
  });
});
