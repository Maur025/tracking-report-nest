import { StreamableFile } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { pdfStreamResponse } from './pdf-stream-response.js';

describe('pdfStreamResponse', () => {
  it('should build a streamable file with the pdf headers', () => {
    // WHEN
    const response = pdfStreamResponse(new PassThrough(), 'events');

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe('application/pdf');
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=events.pdf',
    );
  });

  it('should honor the disposition and default filename', () => {
    // WHEN
    const response = pdfStreamResponse(new PassThrough(), undefined, 'inline');

    // THEN
    expect(response.getHeaders().disposition).toBe(
      'inline; filename=report.pdf.pdf',
    );
  });
});
