import { StreamableFile } from '@nestjs/common';
import { Readable } from 'node:stream';

export const excelStreamResponse = (
  readable: Readable,
  filename: string = 'report.pdf',
) =>
  new StreamableFile(readable, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    disposition: `attachment; filename=${filename}.xlsx`,
  });
