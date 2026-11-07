# Contracts: Capa BFF para MovPrimate

**Carpeta**: `specs/001-mov-primate-bff/contracts/`

**Propósito**: Definición exhaustiva de contratos, APIs, permisos, auditoría y esquemas del BFF MovPrimate.

**Última actualización**: 2026-11-05

**Status**: Complete (5 documentos + clarifications summary)

---

## Documentos en esta carpeta

### 1. 📋 downstream-services.md
**Especificación de microservicios descendentes**
- **Booking Service**: 6 endpoints (POST/GET/PATCH /bookings, PATCH /status, PATCH /attendance)
- **User Service**: 4 endpoints (GET /users/:id, PATCH /users/:id/role, PATCH /users/:id/status, GET /users)
- **Notification Service**: 2 endpoints (POST /notifications/email async, POST /notifications/in-app)
- Fallback strategy, retry logic, timeout handling
- Tasks: T036, T037, T038

### 2. ⚠️ error-responses.md
**Especificación de respuestas de error estandarizadas**
- Estructura base: `{status, code, message, timestamp, request_id, data}`
- 6 categorías de status HTTP: 400, 401, 403, 404, 409, 500, 503
- 12+ códigos agnósticos: ERR_BOOKING_CONFLICT, ERR_INVALID_ROLE, ERR_UNAUTHORIZED, etc.
- Mapping frontend para traducción
- Task: T039

### 3. 🔐 permissions.md
**Modelo de autorización y control de acceso**
- 4 roles: usuario, alumno, admin, superadmin
- **Matriz Rol × Acción × Recurso** explícita
- Scope levels: OWN (propio), SCOPE (escuela), ALL (global)
- Authorization enforcement points
- Task: T040

### 4. 📊 audit-events.md
**Schema inmutable de auditoría**
- Tabla `audit_events` append-only
- 8+ campos: id, timestamp, actor_id, actor_rol, accion, tipo_resurso, id_recurso, valor_anterior, valor_nuevo, razon, escuela_id, ip_address
- Acciones: BOOKING_*, ROLE_CHANGED, USER_*, ATTENDANCE_*, SYSTEM_*
- SQL DDL con particionamiento
- Retention policy (3 años), GDPR compliance
- Task: T041

### 5. 🔄 status-mapping.md
**Mapeo de estados y transiciones**
- Ciclo de vida: pendiente → confirmado → completado (o cancelado/rechazado)
- UI labels con colores e iconos por estado
- Transiciones válidas con validaciones
- Substates de asistencia
- Task: T043

### 6. 📋 CLARIFICATIONS_SUMMARY.md
**Resumen de clarificaciones (Session 2026-11-05)**
- 5 preguntas respondidas
- Mapeo Q → Documento → Tasks
- Cobertura: 75% → 95%+
- 7 CRITICAL/HIGH issues resueltos

---

## Endpoints BFF (organizado por sección de contrato)

### Landing & Auth
- `GET /landing` - Datos públicos (sin autenticación)
- `POST /auth/login` - Autenticación
- `GET /auth/session` - Validación de sesión

### Bookings (Estudiante)
- `GET /bookings/slots` - Disponibilidad (query de Booking Service)
- `POST /bookings` - Crear reserva (permisos: alumno)
- `GET /bookings` - Listar propias (cursor-based pagination, permisos: alumno)
- `PATCH /bookings/{id}/cancel` - Cancelar (ventana <1h, permisos: alumno)

### Bookings (Administrador)
- `GET /admin/bookings/pending` - Pendientes por aprobar (permisos: admin)
- `PATCH /admin/bookings/{id}/status` - Aprobar/Rechazar (permisos: admin, scope-based)
- `PATCH /admin/bookings/{id}/attendance` - Registrar asistencia (permisos: admin, scope-based)
- `GET /admin/bookings?filters` - Listar con paginación (permisos: admin, scope-based)

### Users (Superadmin)
- `GET /superadmin/users` - Listar usuarios (permisos: superadmin)
- `PATCH /superadmin/users/{id}/role` - Cambiar rol (permisos: superadmin solo)
- `PATCH /superadmin/users/{id}/status` - Desactivar/Reactivar (permisos: superadmin)

### Auditoría
- `GET /audit/events?filters` - Listar eventos (permisos: admin scope, superadmin all)

---

## Contratos Críticos (Resumen)

| Contrato | Definición | Documento |
|----------|-----------|-----------|
| **Reserva** | Duración: **1 hora exacta**, Cupo máximo: **4 alumnos/sesión** | downstream-services.md §1.1 |
| **Cancelación** | No permitida dentro de **1 hora antes de inicio** (zona horaria servidor) | status-mapping.md §3, permissions.md |
| **Errores** | Formato uniforme: `{status, code, message, timestamp, request_id, data}` | error-responses.md §1 |
| **Cambio de Rol** | Permitido **solo a superadmin** | permissions.md §7 (PATCH /users/{id}/role) |
| **Permisos** | Matriz explícita Rol × Acción × Recurso | permissions.md §3 |
| **Auditoría** | Tabla inmutable append-only (NEVER UPDATE/DELETE) | audit-events.md §3 |
| **Paginación** | Cursor-based (NO limit/offset) | downstream-services.md §1.3, T042 |
| **Asistencia** | Estados: asistio, no_asistio, falta_justificada | status-mapping.md §4, permissions.md |

---

## Clarificaciones Resueltas (Session 2026-11-05)

| # | Pregunta | Respuesta | Documentos |
|---|----------|-----------|------------|
| 1 | Downstream service contracts? | Definidos 3 servicios, 12 endpoints, payloads, error codes | downstream-services.md |
| 2 | Error handling: agnóstico o localizado? | Agnóstico (frontend traduce): códigos ERR_* | error-responses.md |
| 3 | Permission matrix? | Matriz explícita 4 roles × 4 recursos × 3-7 acciones | permissions.md |
| 4 | Audit trail schema? | Tabla inmutable append-only, 8+ campos | audit-events.md |
| 5 | Pagination strategy? | Cursor-based con encoding base64 (evita offset drift) | downstream-services.md §1.3, T042 |

---

## Status Quo

✅ **Completado**:
- Downstream service contracts (3 servicios, 12 endpoints especificados)
- Error response standardization (6 status HTTP, 12+ error codes)
- Permission matrix (4 roles, 3 recursos, autorización explícita)
- Audit trail schema (append-only, 8 campos, retention policy)
- Status mapping (5 estados, transiciones validadas, UI labels)

✅ **Coverage**: 95%+ de especificación cubierta

✅ **Issues resueltos**: 7/7 CRITICAL/HIGH issues resueltos

---

## Tasks Asociadas (para implementación)

| Task | Descripción | Documento |
|------|-------------|-----------|
| T036 | Implementar Booking Service contract | downstream-services.md §1 |
| T037 | Implementar User Service contract | downstream-services.md §2 |
| T038 | Implementar Notification Service contract | downstream-services.md §3 |
| T039 | Implementar error responses (códigos agnósticos) | error-responses.md |
| T040 | Implementar matriz de permisos & guards | permissions.md |
| T041 | Implementar auditoría inmutable (audit_events table) | audit-events.md |
| T042 | Implementar paginación cursor-based | downstream-services.md §1.3 |
| T043 | Implementar mapeo de estados & transiciones | status-mapping.md |

---

## Cómo usar esta carpeta

### Desarrolladores
1. Leer documento relevante para tu task (T036-T043)
2. Seguir ejemplos de payload/response
3. Usar testing examples del documento
4. Validar contra documento antes de PR

### QA/Testing
1. error-responses.md: Casos de error a probar (400, 401, 403, 404, 409, 500, 503)
2. permissions.md: Casos de autorización a probar (cada rol + acción)
3. status-mapping.md: Casos de transición a probar (estado inicial → nuevo estado)
4. audit-events.md: Verificar que eventos se registran correctamente

### Gerentes/Planificadores
- Leer CLARIFICATIONS_SUMMARY.md para overview de lo resuelto
- Ver cobertura: 75% → 95%+ después de clarificaciones

---

## Referencia rápida: Códigos de Error

```
400 Bad Request:
  ERR_INVALID_REQUEST, ERR_VALIDATION_FAILED, ERR_INVALID_PAGINATION

401 Unauthorized:
  ERR_MISSING_TOKEN, ERR_INVALID_TOKEN, ERR_EXPIRED_TOKEN, ERR_INSUFFICIENT_CREDENTIALS

403 Forbidden:
  ERR_INSUFFICIENT_PERMISSION, ERR_SCOPE_DENIED, ERR_ACTION_NOT_ALLOWED

404 Not Found:
  ERR_RESOURCE_NOT_FOUND, ERR_ENDPOINT_NOT_FOUND

409 Conflict:
  ERR_BOOKING_CONFLICT, ERR_QUOTA_EXCEEDED, ERR_INVALID_STATE_TRANSITION,
  ERR_CANCELLATION_WINDOW_EXPIRED, ERR_DUPLICATE_RESOURCE

500/503 Server Errors:
  ERR_INTERNAL_ERROR, ERR_SERVICE_UNAVAILABLE, ERR_UNHANDLED_EXCEPTION
```

---

## Referencia rápida: Matriz de Permisos

```
            | usuario | alumno | admin | superadmin |
BOOKING     |    ✗   |   ✓   |   ✓   |     ✓     |
  Create    |    ✗   |  Own  |  All  |    All    |
  Cancel    |    ✗   | <1h   |  All  |    All    |
USER        |    ✗   |   ✗   |  Scope|     ✓     |
  Change Role|    ✗   |   ✗   |   ✗   |     ✓     |
AUDIT       |    ✗   |   ✗   | Scope |     All    |
```

---

**Revisor**: BFF Team  
**Próxima revisión**: Post-T043 (validar implementación)  
**Estado**: Ready for Implementation ✅
