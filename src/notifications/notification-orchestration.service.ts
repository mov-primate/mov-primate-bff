import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationOrchestrationService {
  private readonly logger = new Logger(NotificationOrchestrationService.name);

  // T024, T025, T049: Emit booking status change notification event
  emitBookingStatusChange(bookingId: string, status: string): void {
    // T026: Fire-and-forget; fallback: log if downstream unavailable
    try {
      this.logger.log(`[NotificationEvent] bookingId=${bookingId} status=${status} ts=${new Date().toISOString()}`);
      // In production: publish to message bus or POST to notification service
    } catch (err) {
      this.logger.warn('[NotificationEvent] Failed to emit notification event', err);
    }
  }
}
