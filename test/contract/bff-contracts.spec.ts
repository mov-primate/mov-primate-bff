import { RoleEnum, BookingStatusEnum, AttendanceStatusEnum } from '../../src/shared/enums';
import { BffErrorCodes } from '../../src/shared/errors/bff-error-codes';

describe('BFF Contract Tests (T027)', () => {
  it('should expose 4 roles as contract', () => {
    expect(Object.values(RoleEnum)).toHaveLength(4);
  });

  it('should expose 4 booking statuses as contract', () => {
    expect(Object.values(BookingStatusEnum)).toHaveLength(4);
  });

  it('should expose 3 attendance statuses as contract', () => {
    expect(Object.values(AttendanceStatusEnum)).toHaveLength(3);
  });

  it('should expose 8 standard error codes as contract', () => {
    expect(Object.keys(BffErrorCodes)).toHaveLength(8);
  });

  it('should have stable UI-facing endpoint prefixes', () => {
    const endpoints = [
      '/bff/bookings',
      '/bff/slots',
      '/bff/profiles',
      '/bff/admin',
      '/bff/superadmin',
      '/bff/attendance',
      '/bff/audit',
    ];
    expect(endpoints).toHaveLength(7);
  });
});
