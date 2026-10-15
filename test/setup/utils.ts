import { Response } from 'supertest';

export const binaryParser = (
  res: Response,
  callback: (err: Error | null, body: any) => void,
): void => {
  const chunks: any[] = [];

  res.on('data', (chunk) => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    callback(null, Buffer.concat(chunks));
  });
};
