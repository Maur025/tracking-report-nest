import z, { enum as _enum, string as _string, coerce, object } from 'zod';

const envNumberSchema = (def: number, min: number = 0) => {
  return coerce.number().int().min(min).prefault(def);
};

const envPortSchema = (def: number) =>
  coerce.number().int().positive().max(65535).prefault(def);

export const environmentSchema = object({
  APP_ID: _string().nonempty().default('REPORT01'),
  APP_NAME: _string().nonempty().default('tracking-report'),
  TZ: _string().nonempty().default('America/La_Paz'),

  WS_PORT: envPortSchema(10701),
  APP_PORT: envPortSchema(10801),
  APP_STATIC_PATH: _string().nonempty().default('./public'),

  WS_GATEWAY_HOST_PROCESSOR: _string().nonempty().default('localhost'),
  WS_GATEWAY_PORT_PROCESSOR: envPortSchema(7170),

  UUID: _string().nonempty().default('f0f0f0f0'),

  DB_URL: _string().nonempty().default('./database/tracking-report.sqlite'),

  NODE_ENV: _enum(['development', 'test', 'production']).default('development'),

  REDIS_HOST: _string().nonempty().default('localhost'),
  REDIS_PORT: envPortSchema(6379),

  BULLMQ_JOB_ATTEMPTS: envNumberSchema(3, 1),
  BULLMQ_JOB_BACKOFF_TYPE: _enum(['exponential', 'fixed']).default(
    'exponential',
  ),
  BULLMQ_JOB_BACKOFF_DELAY: envNumberSchema(1000, 100),
  BULLMQ_JOB_REMOVE_ON_COMPLETE: envNumberSchema(100),
  BULLMQ_JOB_REMOVE_ON_FAIL: envNumberSchema(500),
});

export type EnvironmentSchema = z.infer<typeof environmentSchema>;
