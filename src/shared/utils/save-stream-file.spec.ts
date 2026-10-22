import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { saveStreamToFile } from './save-stream-file.js';

describe('saveStreamToFile', () => {
  let workingDirectory: string;

  beforeEach(async () => {
    workingDirectory = await mkdtemp(path.join(tmpdir(), 'save-stream-file-'));
  });

  afterEach(async () => {
    await rm(workingDirectory, { recursive: true, force: true });
  });

  const buildStream = (content: string): Readable =>
    Readable.from([Buffer.from(content)]);

  const listPartials = async (): Promise<string[]> =>
    (await readdir(workingDirectory)).filter((file) => file.endsWith('.part'));

  it('should write the stream content into the target file', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'report.pdf');

    // WHEN
    await saveStreamToFile(buildStream('PDF-CONTENT'), filePath);

    // THEN
    expect(await readFile(filePath, 'utf-8')).toBe('PDF-CONTENT');
  });

  it('should create the missing directories of the target file', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'nested', 'deep', 'report.pdf');

    // WHEN
    await saveStreamToFile(buildStream('PDF-CONTENT'), filePath);

    // THEN
    expect(await readFile(filePath, 'utf-8')).toBe('PDF-CONTENT');
  });

  it('should not leave partial files behind on success', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'report.pdf');

    // WHEN
    await saveStreamToFile(buildStream('PDF-CONTENT'), filePath);

    // THEN
    expect(await listPartials()).toEqual([]);
  });

  it('should overwrite an existing target file', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'report.pdf');
    await writeFile(filePath, 'OLD-CONTENT', 'utf-8');

    // WHEN
    await saveStreamToFile(buildStream('NEW-CONTENT'), filePath);

    // THEN
    expect(await readFile(filePath, 'utf-8')).toBe('NEW-CONTENT');
  });

  it('should remove the partial file and propagate the error when the stream fails', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'report.pdf');
    const failingStream = new Readable({
      read() {
        this.destroy(new Error('Stream exploded'));
      },
    });

    // WHEN / THEN
    await expect(saveStreamToFile(failingStream, filePath)).rejects.toThrow(
      'Stream exploded',
    );
    expect(await listPartials()).toEqual([]);
  });

  it('should keep the previous target file untouched when the stream fails', async () => {
    // GIVEN
    const filePath = path.join(workingDirectory, 'report.pdf');
    await writeFile(filePath, 'OLD-CONTENT', 'utf-8');

    const failingStream = new Readable({
      read() {
        this.destroy(new Error('Stream exploded'));
      },
    });

    // WHEN / THEN
    await expect(saveStreamToFile(failingStream, filePath)).rejects.toThrow(
      'Stream exploded',
    );
    expect(await readFile(filePath, 'utf-8')).toBe('OLD-CONTENT');
  });

  it('should resolve relative paths against the current working directory', async () => {
    // GIVEN
    const fileName = `relative-report-${crypto.randomUUID()}.pdf`;
    const filePath = path.join(process.cwd(), fileName);

    // WHEN
    await saveStreamToFile(buildStream('PDF-CONTENT'), filePath);

    // THEN
    expect(await readFile(filePath, 'utf-8')).toBe('PDF-CONTENT');

    await rm(filePath, { force: true });
  });
});
