import { HttpHandler } from 'msw';
import { progressHandler } from './progress-handler.js';
import { registryEventsEventNotificationHandler } from './registry-events-event-notification-handler.js';
import { registryProgressHandler } from './registry-progress-handler.js';
import { rulesHandler } from './rules-handler.js';

export const mswHandlers: HttpHandler[] = [
  registryEventsEventNotificationHandler(),
  rulesHandler(),
  registryProgressHandler(),
  progressHandler(),
];
