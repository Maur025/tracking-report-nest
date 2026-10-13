import { HttpHandler } from 'msw';
import { registryEventsEventNotificationHandler } from './registry-events-event-notification-handler.js';

export const mswHandlers: HttpHandler[] = [
  registryEventsEventNotificationHandler(),
];
