import { RoleEnum } from '../../src/shared/enums';
import { BffErrorCodes } from '../../src/shared/errors/bff-error-codes';

describe('Role and Permission Contracts (T006, T040)', () => {
  it('should define 4 roles', () => {
    const roles = Object.values(RoleEnum);
    expect(roles).toHaveLength(4);
    expect(roles).toContain('usuario');
    expect(roles).toContain('alumno');
    expect(roles).toContain('admin');
    expect(roles).toContain('superadmin');
  });

  it('should have ERR_UNAUTHORIZED error code', () => {
    expect(BffErrorCodes.UNAUTHORIZED).toBe('ERR_UNAUTHORIZED');
  });

  it('should have ERR_INVALID_ROLE error code', () => {
    expect(BffErrorCodes.INVALID_ROLE).toBe('ERR_INVALID_ROLE');
  });
});
