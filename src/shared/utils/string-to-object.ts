import { Logger } from '@nestjs/common';

const logger = new Logger('stringToObject');

export const stringToObject = <T>(str: string): T | undefined => {
  if (!str) return undefined;

  try {
    return JSON.parse(str) as T;
  } catch (error) {
    logger.error('Error parsing string to object:', error);

    return undefined;
  }
};
