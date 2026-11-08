import { BffErrorCodes } from '../../src/shared/errors/bff-error-codes';
import { BookingStatusEnum } from '../../src/shared/enums';

describe('Booking Orchestration Contracts (T013, FR-011, T050)', () => {
  it('should have ERR_NO_CLASSES_AVAILABLE error code', () => {
    expect(BffErrorCodes.NO_CLASSES_AVAILABLE).toBe('ERR_NO_CLASSES_AVAILABLE');
  });

  it('should have 4 booking statuses', () => {
    const statuses = Object.values(BookingStatusEnum);
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain('pendiente');
    expect(statuses).toContain('confirmado');
    expect(statuses).toContain('rechazado');
    expect(statuses).toContain('cancelado');
  });

  it('should encode cursor in base64 for pagination (T042)', () => {
    const bookingId = 'booking123';
    const cursor = Buffer.from(bookingId).toString('base64');
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    expect(decoded).toBe(bookingId);
  });

  it('should expose all standard error codes as contract', () => {
    const codes = Object.values(BffErrorCodes);
    expect(codes).toContain('ERR_NO_CLASSES_AVAILABLE');
    expect(codes).toContain('ERR_BOOKING_CONFLICT');
    expect(codes).toContain('ERR_CANCELLATION_WINDOW');
    expect(codes).toContain('ERR_DOWNSTREAM_UNAVAILABLE');
  });
});
