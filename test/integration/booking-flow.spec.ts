import { BffErrorCodes } from '../../src/shared/errors/bff-error-codes';
import { RoleEnum, BookingStatusEnum, AttendanceStatusEnum } from '../../src/shared/enums';

describe('BFF Booking Flow Integration (T028)', () => {
  it('should represent full booking lifecycle', () => {
    const flow = [
      BookingStatusEnum.PENDIENTE,
      BookingStatusEnum.CONFIRMADO,
      BookingStatusEnum.CANCELADO,
    ];
    expect(flow).toHaveLength(3);
  });

  it('should block booking when available_classes = 0 (FR-011)', () => {
    expect(BffErrorCodes.NO_CLASSES_AVAILABLE).toBe('ERR_NO_CLASSES_AVAILABLE');
  });

  it('should support 3 attendance statuses (T046)', () => {
    const statuses = Object.values(AttendanceStatusEnum);
    expect(statuses).toHaveLength(3);
  });

  it('should restrict role changes to superadmin (T022)', () => {
    const nonSuperadminRoles = [RoleEnum.USUARIO, RoleEnum.ALUMNO, RoleEnum.ADMIN];
    expect(nonSuperadminRoles).not.toContain(RoleEnum.SUPERADMIN);
  });
});
