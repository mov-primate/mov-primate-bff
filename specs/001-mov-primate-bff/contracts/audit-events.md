# BFF Audit Trail & Event Schema

**Documento de especificación** del sistema de auditoría y esquema de eventos del BFF.

**Última actualización**: 2026-11-05

**Status**: Active

---

## Overview

El BFF registra automáticamente **todas las transiciones de estado** y **acciones administrativas** en una tabla inmutable `audit_events` para:
- Compliance y regulación (trazabilidad completa)
- Debugging y forensics (qué pasó y cuándo)
- Reportes de auditoría (cambios de roles, cancelaciones, asistencia)
- Detección de fraude (múltiples cancelaciones, cambios rápidos de rol)

**Principios**:
- Append-only (nunca se modifica ni elimina un registro de auditoría)
- Timestamps en UTC (zona horaria servidor, nunca cliente)
- Inmutable (no se puede cambiar `valor_anterior` o `valor_nuevo` después de crear)

---

## 1. Audit Event Schema

### Core Attributes

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|---|---|
| `id` | UUID | ✓ | Identificador único del evento |
| `timestamp` | ISO8601 UTC | ✓ | Momento en que ocurrió la acción (ej: 2026-11-05T14:35:42.123Z) |
| `actor_id` | UUID | ✓ | user_id de quién realizó la acción |
| `actor_rol` | enum | ✓ | Rol del actor en momento del evento (usuario\|alumno\|admin\|superadmin) |
| `accion` | enum | ✓ | Tipo de acción (ver tabla de acciones) |
| `tipo_recurso` | enum | ✓ | Tipo de recurso afectado (BOOKING\|USER\|ROLE_CHANGE\|ATTENDANCE\|SYSTEM) |
| `id_recurso` | UUID/string | ✓ | ID del recurso (booking_id, user_id, etc.) |
| `valor_anterior` | JSON | Condicional | Estado anterior (null si creación) |
| `valor_nuevo` | JSON | Condicional | Estado nuevo (null si eliminación) |
| `razon` | string | ✗ | Motivo de la acción (ej: "Approved by teacher", "Justificada ausencia") |
| `escuela_id` | UUID | ✗ | Escuela/org del recurso (para filtrado de scope) |
| `aula_id` | UUID | ✗ | Aula específica si aplica |
| `ip_address` | string | ✗ | IP del cliente que realizó la acción |
| `user_agent` | string | ✗ | User-Agent del cliente (navegador, versión) |
| `request_id` | UUID | ✓ | Identificador de la request HTTP (para correlación) |

---

## 2. Acciones Auditables

### BOOKING (Reserva)

| Acción | Cuándo | Recurso | valor_anterior | valor_nuevo |
|--------|--------|---------|---|---|
| BOOKING_CREATED | Alumno/admin crea reserva | booking_id | null | {id, alumno_id, profesor_id, start_time, estado} |
| BOOKING_CONFIRMADO | Admin confirma (estado → confirmado) | booking_id | {estado: pendiente} | {estado: confirmado, confirmed_by, confirmed_at} |
| BOOKING_CANCELADO | Alumno o admin cancela | booking_id | {estado: anterior} | {estado: cancelado, cancelled_by, cancelled_at, reason} |
| BOOKING_RECHAZADO | Admin rechaza (estado → rechazado) | booking_id | {estado: pendiente} | {estado: rechazado, rejected_by, rejected_at, reason} |
| BOOKING_DELETED | Soft-delete (raramente) | booking_id | {deleted: false} | {deleted: true, deleted_by, deleted_at} |

**Ejemplo BOOKING_CREATED**:
```json
{
  "id": "audit-uuid-1",
  "timestamp": "2026-11-05T14:35:42.123Z",
  "actor_id": "alumno-user-123",
  "actor_rol": "alumno",
  "accion": "BOOKING_CREATED",
  "tipo_recurso": "BOOKING",
  "id_recurso": "booking-uuid-456",
  "valor_anterior": null,
  "valor_nuevo": {
    "id": "booking-uuid-456",
    "alumno_id": "alumno-user-123",
    "profesor_id": "prof-user-789",
    "fecha_inicio": "2026-11-10T10:00:00Z",
    "fecha_fin": "2026-11-10T11:00:00Z",
    "estado": "pendiente",
    "cupo": 1
  },
  "razon": null,
  "escuela_id": "escuela-main",
  "aula_id": "aula-A101",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "request_id": "req-uuid-http-123"
}
```

**Ejemplo BOOKING_CONFIRMADO**:
```json
{
  "id": "audit-uuid-2",
  "timestamp": "2026-11-05T14:40:15.456Z",
  "actor_id": "prof-user-789",
  "actor_rol": "admin",
  "accion": "BOOKING_CONFIRMADO",
  "tipo_recurso": "BOOKING",
  "id_recurso": "booking-uuid-456",
  "valor_anterior": {
    "estado": "pendiente"
  },
  "valor_nuevo": {
    "estado": "confirmado",
    "confirmed_by": "prof-user-789",
    "confirmed_at": "2026-11-05T14:40:15.456Z"
  },
  "razon": "Approved - room confirmed",
  "escuela_id": "escuela-main",
  "aula_id": "aula-A101",
  "request_id": "req-uuid-http-124"
}
```

---

### USER (Usuario/Cambio de Rol)

| Acción | Cuándo | Recurso | valor_anterior | valor_nuevo |
|--------|--------|---------|---|---|
| ROLE_CHANGED | Superadmin cambia rol de usuario | user_id | {rol: old_role} | {rol: new_role, changed_by, changed_at} |
| USER_DEACTIVATED | Superadmin desactiva usuario | user_id | {estado: activo} | {estado: inactivo, reason} |
| USER_REACTIVATED | Superadmin reactiva usuario | user_id | {estado: inactivo} | {estado: activo} |
| USER_PROFILE_UPDATED | Usuario actualiza perfil | user_id | {nombre: old} | {nombre: new} (solo cambios) |

**Ejemplo ROLE_CHANGED**:
```json
{
  "id": "audit-uuid-3",
  "timestamp": "2026-11-05T15:10:00.789Z",
  "actor_id": "superadmin-user-001",
  "actor_rol": "superadmin",
  "accion": "ROLE_CHANGED",
  "tipo_recurso": "USER",
  "id_recurso": "alumno-user-123",
  "valor_anterior": {
    "rol": "usuario",
    "nombre": "Juan Pérez"
  },
  "valor_nuevo": {
    "rol": "alumno",
    "nombre": "Juan Pérez",
    "changed_by": "superadmin-user-001",
    "changed_at": "2026-11-05T15:10:00.789Z"
  },
  "razon": "Student registration approved",
  "ip_address": "203.0.113.99",
  "request_id": "req-uuid-http-125"
}
```

---

### ATTENDANCE (Asistencia)

| Acción | Cuándo | Recurso | valor_anterior | valor_nuevo |
|--------|--------|---------|---|---|
| ATTENDANCE_RECORDED | Admin registra asistencia | booking_id | {asistencia: null} | {asistencia: asistio\|no_asistio\|falta_justificada, recorded_by} |
| ATTENDANCE_UPDATED | Admin actualiza asistencia | booking_id | {asistencia: old} | {asistencia: new, updated_by} |

**Ejemplo ATTENDANCE_RECORDED**:
```json
{
  "id": "audit-uuid-4",
  "timestamp": "2026-11-10T11:05:00.000Z",
  "actor_id": "prof-user-789",
  "actor_rol": "admin",
  "accion": "ATTENDANCE_RECORDED",
  "tipo_recurso": "ATTENDANCE",
  "id_recurso": "booking-uuid-456",
  "valor_anterior": {
    "asistencia": null
  },
  "valor_nuevo": {
    "asistencia": "asistio",
    "recorded_by": "prof-user-789",
    "recorded_at": "2026-11-10T11:05:00.000Z"
  },
  "razon": "Session completed on time",
  "escuela_id": "escuela-main",
  "request_id": "req-uuid-http-126"
}
```

---

### SYSTEM (Configuración, cambios de política)

| Acción | Cuándo | Recurso | valor_anterior | valor_nuevo |
|--------|--------|---------|---|---|
| SYSTEM_CONFIG_CHANGED | Superadmin cambia política (cupo, ventana cancelación, etc.) | config_id | {cupo: 4} | {cupo: 5} |
| SYSTEM_MAINTENANCE | Mantenimiento de sistema | system | {mode: operational} | {mode: maintenance} |

---

## 3. Storage & Indexing

### Database Table Definition (SQL)

```sql
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() AT TIME ZONE 'UTC',
  actor_id UUID NOT NULL,
  actor_rol VARCHAR(20) NOT NULL,
  accion VARCHAR(50) NOT NULL,
  tipo_recurso VARCHAR(50) NOT NULL,
  id_recurso VARCHAR(255) NOT NULL,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  razon TEXT,
  escuela_id UUID,
  aula_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_id UUID NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_timestamp CHECK (timestamp <= now() AT TIME ZONE 'UTC' + INTERVAL '1 second')
) PARTITION BY RANGE (EXTRACT(YEAR FROM timestamp), EXTRACT(MONTH FROM timestamp));

-- Índices para consultas frecuentes
CREATE INDEX idx_audit_actor_id ON audit_events(actor_id, timestamp DESC);
CREATE INDEX idx_audit_recurso ON audit_events(tipo_recurso, id_recurso, timestamp DESC);
CREATE INDEX idx_audit_escuela ON audit_events(escuela_id, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp DESC);
CREATE INDEX idx_audit_accion ON audit_events(accion);

-- Full-text search (opcional para logs de auditoría)
CREATE INDEX idx_audit_razon_fts ON audit_events USING GIN(to_tsvector('spanish', razon));
```

**Políticas de inmutabilidad**:
```sql
-- No UPDATE, no DELETE en audit_events (solo INSERT)
REVOKE UPDATE, DELETE ON audit_events FROM audit_user;
GRANT INSERT, SELECT ON audit_events TO audit_user;
```

---

## 4. Access Control to Audit Logs

### Who Can Read Audit Events?

| Rol | Puede leer | Alcance |
|-----|---|---|
| usuario | ✗ | N/A |
| alumno | ✗ | N/A |
| admin | ✓ | Solo su escuela/aula (`WHERE escuela_id = {user.escuela_id}`) |
| superadmin | ✓ | Todas (`WHERE 1=1`) |

**Endpoint**: `GET /api/audit/events?filters`

```typescript
@Get('/audit/events')
@UseGuards(AuthGuard)
async listAuditEvents(req) {
  const { user } = req;
  
  if (user.rol !== 'admin' && user.rol !== 'superadmin') {
    return res.status(403).json({ code: 'ERR_INSUFFICIENT_PERMISSION' });
  }
  
  const filter = {};
  
  // Admin sees only own school
  if (user.rol === 'admin') {
    filter.escuela_id = user.escuela_id;
  }
  
  // Superadmin sees all
  // (no filter)
  
  const events = await auditService.list(filter);
  return res.json(events);
}
```

---

## 5. Writing Audit Events (BFF Internal)

### Audit Middleware

```typescript
// Attach audit context to every request
@Middleware('audit')
async auditContext(req, res, next) {
  req.auditContext = {
    request_id: uuidv4(),
    actor_id: req.user?.user_id,
    actor_rol: req.user?.rol,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };
  
  next();
}

// After successful mutation (POST, PATCH, DELETE), record event
@Post('/bookings')
async createBooking(req, res) {
  const booking = await bookingService.create(req.body);
  
  // Record audit event
  await auditService.create({
    ...req.auditContext,
    accion: 'BOOKING_CREATED',
    tipo_recurso: 'BOOKING',
    id_recurso: booking.id,
    valor_anterior: null,
    valor_nuevo: booking,
    razon: req.body.notas || null,
    escuela_id: booking.escuela_id,
    aula_id: booking.aula_id
  });
  
  return res.status(201).json(booking);
}
```

---

## 6. Querying Audit Events

### BFF Endpoint: List Audit Events

**Endpoint**: `GET /api/audit/events`

**Query Parameters**:
```
?actor_id=<uuid>              # Filter by who performed action
&accion=BOOKING_CONFIRMADO    # Filter by action type
&tipo_recurso=BOOKING         # Filter by resource type
&id_recurso=<uuid>            # Filter by specific resource
&escuela_id=<uuid>            # Filter by school (admin scope)
&fecha_desde=2026-11-01       # Filter by date range (ISO8601)
&fecha_hasta=2026-11-30
&limit=50                     # Pagination
&cursor=<base64_id>
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "audit-uuid-1",
      "timestamp": "2026-11-05T14:35:42.123Z",
      "actor_id": "alumno-user-123",
      "actor_rol": "alumno",
      "accion": "BOOKING_CREATED",
      "tipo_recurso": "BOOKING",
      "id_recurso": "booking-uuid-456",
      "valor_anterior": null,
      "valor_nuevo": { "id": "booking-uuid-456", "estado": "pendiente" },
      "razon": null
    }
  ],
  "pagination": {
    "limit": 50,
    "total_count": 1250,
    "next_cursor": "..."
  }
}
```

### Common Queries

**Todas las acciones de un alumno**:
```
GET /api/audit/events?actor_id=alumno-123&limit=100
```

**Historial completo de una reserva**:
```
GET /api/audit/events?tipo_recurso=BOOKING&id_recurso=booking-456
```

**Todos los cambios de rol en la última semana** (superadmin):
```
GET /api/audit/events?accion=ROLE_CHANGED&fecha_desde=2026-10-29&fecha_hasta=2026-11-05
```

**Auditoría de una escuela** (admin):
```
GET /api/audit/events?escuela_id=escuela-main (automáticamente filtrado por escuela_id del admin)
```

---

## 7. Retention Policy

- **Retención**: Mínimo 3 años (regulación típica de auditoría)
- **Archivo**: Después de 1 año, mover a cold storage (S3 Glacier)
- **Eliminación**: Tras 3 años, eliminar de forma segura (no recuperable)
- **Cumplimiento**: Documentar cada eliminación masiva (no por registro individual)

---

## 8. Privacy & GDPR Compliance

### Data Minimization

- Evitar guardar datos sensibles innecesarios (ej: contraseñas)
- Guardar `ip_address` solo para análisis de fraude (anonimizar después de 90 días)

### Right to be Forgotten (GDPR)

- Si un usuario solicita eliminación, anonimizar su `actor_id` en audit_events (no eliminar, reemplazar con placeholder)
- Mantener integridad del evento (para trazabilidad), solo enmascarar identidad

---

## 9. Monitoring & Alerts

### Anomaly Detection

| Patrón | Alerta | Acción |
|--------|--------|--------|
| > 10 BOOKING_CANCELADO en 1 hora por mismo actor | WARNING | Flag para revisión manual |
| ROLE_CHANGED a superadmin | CRITICAL | Notificar admin inmediatamente |
| Acceso a audit_events 100+ veces en 5 min | WARNING | Posible ataque de enumeración |
| Falta de audit events para endpoint que debería registrar | CRITICAL | Bug en middleware de auditoría |

---

## 10. Testing Audit Trail

```typescript
describe('Audit Trail', () => {
  
  it('should record BOOKING_CREATED event', async () => {
    const alumnoToken = createToken({ user_id: 'alumno-1', rol: 'alumno' });
    
    const res = await client.post('/api/bookings')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .send({ profesor_id: 'prof-1', fecha: '2026-11-10T10:00:00Z' });
    
    expect(res.status).toBe(201);
    
    // Verify audit event was recorded
    const audit = await auditService.find({
      tipo_recurso: 'BOOKING',
      id_recurso: res.body.id,
      accion: 'BOOKING_CREATED'
    });
    
    expect(audit).toBeDefined();
    expect(audit.actor_id).toBe('alumno-1');
    expect(audit.valor_nuevo.estado).toBe('pendiente');
  });

  it('should not allow updating audit events', async () => {
    const auditId = 'audit-uuid-1';
    
    const res = await db.query(
      'UPDATE audit_events SET razon = $1 WHERE id = $2',
      ['Modified', auditId]
    );
    
    expect(res).toThrow(); // Permission denied
  });
});
```

---

**Last Reviewed**: 2026-11-05  
**Next Review**: 2026-11-20  
**Owner**: BFF Team  
**Related Docs**: permissions.md, error-responses.md
