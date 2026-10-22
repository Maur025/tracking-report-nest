import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export const saveStreamToFile = async (
  stream: NodeJS.ReadableStream,
  filePath: string,
): Promise<void> => {
  const absolutePath = path.resolve(filePath);
  const directory = path.dirname(absolutePath);

  const tempPath = path.join(
    directory,
    `${path.basename(absolutePath)}.${crypto.randomUUID()}.part`,
  );

  await mkdir(directory, { recursive: true });

  try {
    await pipeline(stream, createWriteStream(tempPath));

    await rename(tempPath, absolutePath);
  } catch (error) {
    await rm(tempPath, { force: true });

    throw error;
  }
};
