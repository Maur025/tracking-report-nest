import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { SchedulerCommonService } from './scheduler-common.service.js';

describe('SchedulerCommonService', () => {
  let service: SchedulerCommonService;

  let spySetInterval: Mock;

  const config = {
    PING_INTERVAL_MS: 5000,
    STORAGE_INTERVAL_HRS: 1,
    SAVE_INTERVAL_MIN: 5,
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    spySetInterval = vi.spyOn(global, 'setInterval');

    const mockConfigService = {
      getOrThrow: vi.fn((key: keyof typeof config) => config[key]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerCommonService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = await module.resolve<SchedulerCommonService>(
      SchedulerCommonService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('on', () => {
    it('should mutate global events param, registering events', () => {
      // GIVEN
      const eventTest = 'time.ping';
      const eventCallback = async () => 'Working!';

      // WHEN
      service.on(eventTest, eventCallback, 'valueTest1', 'valueTest2');

      // THEN
      expect(service.events).toBeDefined();
      expect(service.events['time.ping']).toHaveLength(1);
      expect(service.events).toEqual(
        expect.objectContaining({
          'time.ping': [eventCallback],
          'time.save': [],
          'time.storage': [],
        }),
      );
    });

    it('should ignore when event is undefined', () => {
      // GIVEN
      const eventTest = undefined;
      const eventCallback = async () => 'Working!';

      // WHEN
      service.on(eventTest, eventCallback);

      // THEN
      expect(service.events).toBeDefined();
      expect(service.events['time.ping']).toHaveLength(0);
      expect(service.events).toEqual(
        expect.objectContaining({
          'time.ping': [],
          'time.save': [],
          'time.storage': [],
        }),
      );
    });

    it('should add key when does not exist in events', () => {
      // GIVEN
      const eventTest = 'time.event';
      const eventCallback = async () => 'Working!';

      // WHEN
      service.on(eventTest, eventCallback);

      // THEN
      expect(service.events).toBeDefined();
      expect(service.events['time.event']).toBeDefined();
      expect(service.events['time.event']).toHaveLength(1);
      expect(service.events).toEqual(
        expect.objectContaining({
          'time.ping': [],
          'time.save': [],
          'time.storage': [],
          'time.event': [eventCallback],
        }),
      );
    });
  });

  describe('start', () => {
    it('should add 3 intervals, to execute event class', () => {
      // GIVEN
      const timePingCallback = vi.fn();
      const timeSaveCallback = vi.fn();
      const timeStorageCallback = vi.fn();

      service.on('time.ping', timePingCallback);
      service.on('time.save', timeSaveCallback);
      service.on('time.storage', timeStorageCallback);

      const pingInterval = config.PING_INTERVAL_MS;
      const storageInterval = config.STORAGE_INTERVAL_HRS * 60 * 60 * 1000;
      const saveInterval = config.SAVE_INTERVAL_MIN * 60 * 1000;

      // WHEN
      service.start();
      vi.advanceTimersByTime(storageInterval);

      // THEN
      expect(spySetInterval).toHaveBeenCalledTimes(3);
      expect(spySetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        pingInterval,
      );
      expect(spySetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        saveInterval,
      );
      expect(spySetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        storageInterval,
      );

      expect(timePingCallback).toHaveBeenCalledWith(pingInterval);
      expect(timeStorageCallback).toHaveBeenCalledWith(storageInterval);
      expect(timeSaveCallback).toHaveBeenCalledWith(saveInterval);
    });
  });
});
