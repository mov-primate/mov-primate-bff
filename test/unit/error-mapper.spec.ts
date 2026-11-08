import { ErrorMapperService } from '../../src/shared/errors/error-mapper.service';
import { BffErrorCodes } from '../../src/shared/errors/bff-error-codes';

describe('ErrorMapperService (T039)', () => {
  const mapper = new ErrorMapperService();

  it('should map ERR_NO_CLASSES_AVAILABLE to 422', () => {
    const err = { response: { data: { code: 'ERR_NO_CLASSES_AVAILABLE', message: 'Sin clases' } } };
    const { status, payload } = mapper.map(err);
    expect(status).toBe(422);
    expect(payload.code).toBe(BffErrorCodes.NO_CLASSES_AVAILABLE);
  });

  it('should map ERR_BOOKING_CONFLICT to 409', () => {
    const err = { response: { data: { code: 'ERR_BOOKING_CONFLICT', message: 'Conflicto' } } };
    const { status, payload } = mapper.map(err);
    expect(status).toBe(409);
    expect(payload.code).toBe(BffErrorCodes.BOOKING_CONFLICT);
  });

  it('should map ERR_CANCELLATION_WINDOW to 422', () => {
    const err = { response: { data: { code: 'ERR_CANCELLATION_WINDOW', message: 'Sin ventana' } } };
    const { status, payload } = mapper.map(err);
    expect(status).toBe(422);
    expect(payload.code).toBe(BffErrorCodes.CANCELLATION_WINDOW);
  });

  it('should map ECONNREFUSED to 503', () => {
    const err = { code: 'ECONNREFUSED', message: 'Connection refused' };
    const { status, payload } = mapper.map(err);
    expect(status).toBe(503);
    expect(payload.code).toBe(BffErrorCodes.DOWNSTREAM_UNAVAILABLE);
  });

  it('should map unknown errors to 500', () => {
    const err = { message: 'Unknown' };
    const { status } = mapper.map(err);
    expect(status).toBe(500);
  });
});
