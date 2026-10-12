import { StreamableFile } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { excelStreamResponse } from './excel-stream-response.js';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

describe('excelStreamResponse', () => {
  it('should build a streamable file with the xlsx headers', () => {
    // WHEN
    const response = excelStreamResponse(new PassThrough(), 'events');

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe(XLSX_MIME);
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=events.xlsx',
    );
  });

  it('should keep the default filename', () => {
    // WHEN
    const response = excelStreamResponse(new PassThrough());

    // THEN
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=report.pdf.xlsx',
    );
  });
});
