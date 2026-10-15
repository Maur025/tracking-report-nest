import z, { string as _string, object } from 'zod';

const receiveStrTransformNumber = (def: string) =>
  _string()
    .nonempty()
    .default(def ?? '0')
    .transform((value) => parseInt(value, 10));

export const environmentSchema = object({
  APP_ID: _string().nonempty().default('REPORT01'),
  APP_NAME: _string().nonempty().default('tracking-report'),
  TZ: _string().nonempty().default('America/La_Paz'),

  WS_PORT: receiveStrTransformNumber('10701'),
  APP_PORT: receiveStrTransformNumber('10801'),

  WS_GATEWAY_HOST_PROCESSOR: _string().nonempty().default('localhost'),
  WS_GATEWAY_PORT_PROCESSOR: receiveStrTransformNumber('7170'),

  UUID: _string().nonempty().default('f0f0f0f0'),

  PING_INTERVAL_MS: receiveStrTransformNumber('5000'),
  STORAGE_INTERNAL_HRS: receiveStrTransformNumber('1'),
  SAVE_INTERVAL_MIN: receiveStrTransformNumber('5'),

  DB_URL: _string().nonempty().default('./database/tracking-report.sqlite'),

  NODE_ENV: _string().optional().default('development'),

  REDIS_HOST: _string().nonempty().default('localhost'),
  REDIS_PORT: receiveStrTransformNumber('6379'),

  BULLMQ_JOB_ATTEMPTS: receiveStrTransformNumber('3'),
  BULLMQ_JOB_BACKOFF_TYPE: _string().nonempty().default('exponential'),
  BULLMQ_JOB_BACKOFF_DELAY: receiveStrTransformNumber('1000'),
  BULLMQ_JOB_REMOVE_ON_COMPLETE: receiveStrTransformNumber('100'),
  BULLMQ_JOB_REMOVE_ON_FAIL: receiveStrTransformNumber('500'),
});

export type EnvironmentSchema = z.infer<typeof environmentSchema>;
