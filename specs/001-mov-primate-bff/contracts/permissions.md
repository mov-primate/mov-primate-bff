# BFF Permission Model & Authorization Contract

**Documento de especificación** del modelo de permisos y autorización del BFF.

**Última actualización**: 2026-11-05

**Status**: Active

---

## Overview

El BFF implementa un modelo de autorización explícito basado en:
- **Rol del usuario** (usuario, alumno, admin, superadmin)
- **Acción solicitada** (crear, leer, actualizar, eliminar, cancelar, auditar)
- **Recurso objetivo** (reservas, usuarios, auditoría, sesiones)
- **Alcance/scope** (propio, equipo, organización, global)

---

## 1. Role Definitions

### usuario (Rol inicial/sin privilegios)

- **Descripción**: Cuenta nueva sin acciones de negocio permitidas
- **Creación**: Automática al registrarse en la app
- **Promoción**: Solo superadmin puede promover a `alumno` o `admin`
- **Restricciones**: No puede crear reservas, no ve auditoría

### alumno (Estudiante/cliente)

- **Descripción**: Usuario que puede crear y gestionar sus propias reservas
- **Acciones permitidas**: 
  - Crear reservas propias
  - Ver historial de reservas propias
  - Cancelar reservas propias (hasta 1h antes del inicio)
  - Ver información de profesores
  - Recibir notificaciones
- **Restricciones**: No puede ver reservas de otros, no puede auditar

### admin (Administrador de sesiones/profesor)

- **Descripción**: Profesor o coordinador que gestiona reservas y asistencia de su escuela/aula
- **Acciones permitidas**:
  - Ver reservas de alumnos asignados a su aula/clase
  - Confirmar, rechazar o cancelar reservas
  - Registrar asistencia
  - Ver historial de sus propias reservas
  - Acceso a auditoría de su escuela/aula
  - Generar reportes de asistencia
- **Restricciones**: 
  - Solo ver/modificar reservas de su `escuela_id` o `aula_id`
  - No puede cambiar roles de usuarios
  - No puede acceder a auditoría global

### superadmin (Propietario/gestor global)

- **Descripción**: Dueño del gimnasio o gestor de plataforma
- **Acciones permitidas**:
  - Todas las acciones de todos los roles
  - Cambiar rol de usuarios (usuario ↔ alumno ↔ admin)
  - Desactivar/suspender usuarios
  - Ver auditoría completa (todas las escuelas)
  - Acceder a reportes globales
  - Configurar políticas (cupos, ventanas de cancelación, etc.)
- **Restricciones**: Ninguna en operaciones normales

---

## 2. Role Hierarchy

```
superadmin (permisos máximos)
  ├── admin (permisos de escuela/aula)
  │    └── alumno (permisos personales)
  │         └── usuario (sin permisos)
```

**Principio**: No hereda permisos automáticamente. Cada rol tiene conjunto discreto de acciones.

---

## 3. Permission Matrix (Rol × Acción × Recurso)

### Recurso: BOOKING (Reserva)

| Rol | Crear | Leer Propio | Leer Otros | Actualizar Propio | Actualizar Otros | Cancelar Propio | Cancelar Otros | Audit |
|-----|---|---|---|---|---|---|---|---|
| usuario | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| alumno | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ (si <1h) | ✗ | ✗ |
| admin | ✓ | ✓ | ✓ (scope) | ✓ (scope) | ✓ (scope) | ✓ | ✓ (scope) | ✓ (scope) |
| superadmin | ✓ | ✓ | ✓ (all) | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notas**:
- `alumno - Crear`: Solo reservas propias (alumno_id == token.user_id)
- `alumno - Cancelar`: Solo si `now() < (booking.start_time - 60 min)` en zona horaria servidor
- `admin - Leer/Actualizar`: Limitado a reservas donde `escuela_id == admin.escuela_id` o `aula_id == admin.aula_id`
- `admin - Cancelar`: Puede cancelar cualquier reserva de su escuela, pero se registra como cancelación por admin (auditoría)

---

### Recurso: USER (Usuario)

| Rol | Crear | Leer Propio | Leer Otros | Actualizar Propio | Actualizar Rol | Desactivar | Audit |
|-----|---|---|---|---|---|---|---|
| usuario | ✗ | ✓ | ✗ | ✓ (solo perfil) | ✗ | ✗ | ✗ |
| alumno | ✗ | ✓ | ✗ | ✓ (solo perfil) | ✗ | ✗ | ✗ |
| admin | ✗ | ✓ | ✓ (scope) | ✗ | ✗ | ✗ | ✗ |
| superadmin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notas**:
- `usuario/alumno - Leer Propio`: Solo perfil propio
- `usuario/alumno - Actualizar Propio`: Solo nombre, email, foto de perfil; no rol
- `admin - Leer Otros`: Usuarios en su escuela solamente
- `superadmin - Actualizar Rol`: Cambio usuario → alumno, alumno → admin, admin → usuario (cualquier transición)

---

### Recurso: AUDIT_EVENTS (Auditoría)

| Rol | Leer | Exportar | Delete |
|-----|---|---|---|
| usuario | ✗ | ✗ | ✗ |
| alumno | ✗ | ✗ | ✗ |
| admin | ✓ (scope) | ✓ (scope) | ✗ |
| superadmin | ✓ (all) | ✓ (all) | ✗ |

**Notas**:
- `admin`: Solo auditoría de su escuela/aula
- `superadmin`: Auditoría completa
- Auditoría es inmutable (no se puede eliminar, solo leer)

---

### Recurso: ATTENDANCE (Asistencia)

| Rol | Registrar Propio | Registrar Otros | Leer Propio | Leer Otros |
|-----|---|---|---|---|
| usuario | ✗ | ✗ | ✗ | ✗ |
| alumno | ✗ | ✗ | ✓ | ✗ |
| admin | ✗ | ✓ (scope) | ✓ | ✓ (scope) |
| superadmin | ✗ | ✓ | ✓ | ✓ |

**Notas**:
- `alumno - Leer Propio`: Asistencia registrada en sus propias reservas
- `admin - Registrar Otros`: Registrar asistencia en reservas de su escuela
- Requiere `PATCH /bookings/{id}/attendance` con rol `admin` o `superadmin`

---

## 4. Authorization Enforcement Points

### BFF Middleware: Authentication

**Punto de entrada**: Antes de procesar cualquier ruta

```typescript
// Pseudocódigo
@Middleware('auth')
async validateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ code: 'ERR_MISSING_TOKEN' });
  
  try {
    req.user = verifyJWT(token);  // { user_id, rol, escuela_id, aula_id }
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ code: 'ERR_EXPIRED_TOKEN' });
    return res.status(401).json({ code: 'ERR_INVALID_TOKEN' });
  }
  
  next();
}
```

### Per-Endpoint Authorization

**Patrón general**:

```typescript
@Post('/bookings')
@UseGuards(AuthGuard)
@CheckPermission('BOOKING', 'CREATE', 'OWN')  // Custom decorator
async createBooking(req, res) {
  const userId = req.user.user_id;
  const userRole = req.user.rol;
  
  // 1. Validate role can CREATE booking
  if (!hasPermission(userRole, 'BOOKING', 'CREATE')) {
    return res.status(403).json({ code: 'ERR_INSUFFICIENT_PERMISSION' });
  }
  
  // 2. For alumno: enforce ownership
  if (userRole === 'alumno' && req.body.alumno_id !== userId) {
    return res.status(403).json({ code: 'ERR_SCOPE_DENIED' });
  }
  
  // 3. For admin: enforce scope (escuela_id match)
  if (userRole === 'admin') {
    const escuela = await getEscuelaFromBooking(req.body);
    if (escuela.id !== req.user.escuela_id) {
      return res.status(403).json({ code: 'ERR_SCOPE_DENIED' });
    }
  }
  
  // 4. Proceed with business logic
  const booking = await bookingService.create(req.body);
  return res.status(201).json(booking);
}
```

---

## 5. Scope-Based Authorization

### Scope Levels

| Scope | Definition | Who Enforces | Example |
|-------|----|----|---|
| OWN | User's own resource only | BFF | Alumno reads/cancels own bookings |
| SCOPE | User's team/organization/school | BFF | Admin reads bookings in own `escuela_id` |
| ALL | All resources | BFF | Superadmin reads all bookings |

### Scope Derivation from Token

```typescript
// JWT token includes scope context
const token = {
  user_id: "user-uuid",
  rol: "admin",
  escuela_id: "escuela-123",  // Scope for admin
  aula_id: "aula-456",         // Optional, more granular scope
  iat: 1699000000,
  exp: 1699086400
};
```

---

## 6. Permission Checks in Common Endpoints

### GET /bookings (List)

**Role** | **Filter Applied** | **Result**
---------|----------|-----------
`alumno` | `WHERE alumno_id = {user_id}` | Only own bookings
`admin` | `WHERE escuela_id = {user.escuela_id}` | Only own school bookings
`superadmin` | No filter | All bookings

---

### PATCH /bookings/{id}/status (Approve/Reject)

**Checks**:
1. Role is `admin` or `superadmin`?
   - If no: Return 403 ERR_INSUFFICIENT_PERMISSION
2. Booking's `escuela_id` matches user's `escuela_id`?
   - If no (and user is admin): Return 403 ERR_SCOPE_DENIED
3. New status is valid state transition?
   - If no: Return 409 ERR_INVALID_STATE_TRANSITION

---

### PATCH /users/{id}/role (Change Role)

**Checks**:
1. Role is `superadmin`?
   - If no: Return 403 ERR_INSUFFICIENT_PERMISSION
2. New role is valid (usuario, alumno, admin, superadmin)?
   - If no: Return 400 ERR_VALIDATION_FAILED
3. State transition is allowed (e.g., admin → usuario)?
   - If no: Return 409 ERR_INVALID_STATE_TRANSITION

---

## 7. Audit Trail Integration

**Every action** that modifies state (booking, user, role) must record an audit event:

```json
{
  "id": "audit-uuid",
  "timestamp": "2026-11-05T14:35:00Z",
  "actor_id": "admin-user-id",
  "actor_rol": "admin",
  "accion": "BOOKING_CONFIRMADO",
  "tipo_recurso": "BOOKING",
  "id_recurso": "booking-uuid",
  "valor_anterior": { "estado": "pendiente" },
  "valor_nuevo": { "estado": "confirmado" },
  "razon": "Approved by teacher",
  "escuela_id": "escuela-123",
  "ip_address": "203.0.113.42"
}
```

---

## 8. Testing Authorization

### Unit Test Examples

```typescript
describe('Authorization - Bookings', () => {
  
  it('alumno should only see own bookings', async () => {
    const alumnoToken = createToken({ user_id: 'alumno-1', rol: 'alumno' });
    const res = await client.get('/api/bookings')
      .set('Authorization', `Bearer ${alumnoToken}`);
    
    expect(res.body.data).toHaveLength(2);  // Only alumno-1's bookings
    expect(res.body.data.every(b => b.alumno_id === 'alumno-1')).toBe(true);
  });

  it('alumno cannot cancel booking > 1 hour before start', async () => {
    const booking = createBooking({
      start_time: '2026-11-10T14:00:00Z'
    });
    
    const alumnoToken = createToken({ user_id: booking.alumno_id, rol: 'alumno' });
    
    // Simular time: 10:05 (55 min antes, should succeed)
    mockCurrentTime('2026-11-10T13:05:00Z');
    let res = await client.delete(`/api/bookings/${booking.id}`)
      .set('Authorization', `Bearer ${alumnoToken}`);
    expect(res.status).toBe(200);
    
    // Simular time: 12:00 (2h antes, should fail)
    mockCurrentTime('2026-11-10T12:00:00Z');
    res = await client.delete(`/api/bookings/${booking.id}`)
      .set('Authorization', `Bearer ${alumnoToken}`);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ERR_CANCELLATION_WINDOW_EXPIRED');
  });

  it('admin cannot approve bookings outside own scope', async () => {
    const bookingInOtherSchool = createBooking({ escuela_id: 'escuela-999' });
    const adminToken = createToken({
      user_id: 'admin-1',
      rol: 'admin',
      escuela_id: 'escuela-123'  // Different school
    });
    
    const res = await client.patch(`/api/bookings/${bookingInOtherSchool.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nuevo_estado: 'confirmado' });
    
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ERR_SCOPE_DENIED');
  });

  it('superadmin can perform any action', async () => {
    const superadminToken = createToken({
      user_id: 'superadmin-1',
      rol: 'superadmin'
    });
    
    // Superadmin can approve booking from any school
    const res = await client.patch(`/api/bookings/any-booking-id/status`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({ nuevo_estado: 'confirmado' });
    
    expect([200, 201, 404]).toContain(res.status);  // Success or not-found, never 403
  });
});
```

---

## 9. Backwards Compatibility & Evolution

### Adding New Permissions

- Extend matrix with new role or resource
- Provide feature flag for gradual rollout
- Maintain audit trail

### Removing Permissions

- Breaking change; requires API version bump or deprecation notice
- Grandparent existing users; provide migration path

### Changing Role Names

- Never rename existing roles; create new ones
- Support both old and new names for 1 release cycle

---

## 10. Troubleshooting Authorization

| Symptom | Likely Cause | Solution |
|---------|-----|---|
| 403 ERR_INSUFFICIENT_PERMISSION | User role lacks permission | Check role in token; verify token not expired |
| 403 ERR_SCOPE_DENIED | Resource not in user's scope | For admin: verify escuela_id matches; for alumno: verify user_id matches |
| 401 ERR_EXPIRED_TOKEN | Token expired | Refresh token; re-authenticate |
| 401 ERR_INVALID_TOKEN | Token malformed or signature invalid | Check token format (Bearer scheme); verify secret key |

---

**Last Reviewed**: 2026-11-05  
**Next Review**: 2026-11-20  
**Owner**: BFF Team  
**Related Docs**: downstream-services.md, error-responses.md
