import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class SchedulerCommonService {
  private pingIntervalMs: number;
  private storageIntervalMs: number;
  private saveIntervalMs: number;

  public events: Record<string, ((value: number) => unknown)[]> = {
    'time.ping': [],
    'time.save': [],
    'time.storage': [],
  };

  constructor(private readonly configService: ConfigService) {
    this.pingIntervalMs = configService.getOrThrow<number>('PING_INTERVAL_MS');

    this.storageIntervalMs =
      configService.getOrThrow<number>('STORAGE_INTERVAL_HRS') * 60 * 60 * 1000;

    this.saveIntervalMs =
      configService.getOrThrow<number>('SAVE_INTERVAL_MIN') * 60 * 1000;
  }

  on(
    ev: string | undefined,
    fn: (value: number) => unknown,
    // oxlint-disable-next-line no-unused-vars
    ...args: unknown[]
  ): void {
    if (!ev) return;

    if (!this.events[ev]) this.events[ev] = [];

    if (ev) this.events[ev].push(fn);
  }

  start(): void {
    this.setupIntervals();
  }

  private setupIntervals() {
    this.setIntervalWithParams('time.ping', this.pingIntervalMs);

    this.setIntervalWithParams('time.storage', this.storageIntervalMs);

    this.setIntervalWithParams('time.save', this.saveIntervalMs);
  }

  private setIntervalWithParams(key: string, intervalMs: number) {
    setInterval(() => {
      this.events[key].forEach((fn) => fn(intervalMs));
    }, intervalMs);
  }
}
