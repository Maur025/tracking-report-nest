import { StreamableFile } from '@nestjs/common';
import { Readable } from 'node:stream';

export const pdfStreamResponse = (
  readable: Readable,
  filename: string = 'report.pdf',
  disposition: 'attachment' | 'inline' = 'attachment',
): StreamableFile =>
  new StreamableFile(readable, {
    type: 'application/pdf',
    disposition: `${disposition}; filename=${filename}.pdf`,
  });
