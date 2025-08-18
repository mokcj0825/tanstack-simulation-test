import { EventEmitter2 } from 'eventemitter2';
import { EventPayload, RequestContext } from '../types';
import { EVENT_TYPES } from '../config/constants';
import { logger } from './logger';

class EventBusService extends EventEmitter2 {
  private static instance: EventBusService;

  private constructor() {
    super({
      wildcard: true,
      delimiter: '.',
      maxListeners: 100,
      verboseMemoryLeak: true
    });

    this.setupGlobalListeners();
  }

  public static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  private setupGlobalListeners(): void {
    this.on('**', (event: string, payload: EventPayload) => {
      logger.info('Event emitted', {
        requestId: 'system',
        event,
        payload,
        operation: 'event_emission'
      });
    });

    this.on('error', (error: Error) => {
      logger.error('Event bus error', {
        requestId: 'system',
        error: error.message,
        stack: error.stack,
        operation: 'event_bus_error'
      });
    });
  }

  public emitEvent(
    eventType: string,
    data: unknown,
    context: RequestContext
  ): void {
    const payload: EventPayload = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      source: 'api',
      correlationId: context.requestId
    };

    this.emit(eventType, payload);
  }

  public emitApiRequest(context: RequestContext, method: string, path: string): void {
    this.emitEvent(EVENT_TYPES.API_REQUEST, { method, path }, context);
  }

  public emitApiResponse(context: RequestContext, statusCode: number, duration: number): void {
    this.emitEvent(EVENT_TYPES.API_RESPONSE, { statusCode, duration }, context);
  }

  public emitUserCreated(user: unknown, context: RequestContext): void {
    this.emitEvent(EVENT_TYPES.USER_CREATED, user, context);
  }

  public emitUserUpdated(user: unknown, context: RequestContext): void {
    this.emitEvent(EVENT_TYPES.USER_UPDATED, user, context);
  }

  public emitUserDeleted(userId: string, context: RequestContext): void {
    this.emitEvent(EVENT_TYPES.USER_DELETED, { userId }, context);
  }

  public emitDataFetched(dataType: string, count: number, context: RequestContext): void {
    this.emitEvent(EVENT_TYPES.DATA_FETCHED, { dataType, count }, context);
  }

  public emitError(error: Error, context: RequestContext): void {
    this.emitEvent(EVENT_TYPES.ERROR_OCCURRED, {
      message: error.message,
      stack: error.stack
    }, context);
  }

  public subscribeToEvent(
    eventType: string,
    handler: (payload: EventPayload) => void
  ): void {
    this.on(eventType, handler);
  }

  public unsubscribeFromEvent(
    eventType: string,
    handler: (payload: EventPayload) => void
  ): void {
    this.off(eventType, handler);
  }

  public getEventCount(eventType: string): number {
    return this.listenerCount(eventType);
  }

  public getActiveEvents(): string[] {
    return this.eventNames() as string[];
  }
}

export const eventBus = EventBusService.getInstance();
