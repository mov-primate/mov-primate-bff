# Downstream Service Contracts

**Documento de definición de contratos** entre el BFF y los microservicios internos (Booking Service, User Service, Notification Service).

**Última actualización**: 2026-11-05

**Status**: Pendiente de refinamiento con equipos de microservicios

---

## 1. Booking Service

**Base URL**: `http://booking-service:3001/api/v1` (dev/staging) / AWS endpoint (prod)

### 1.1 Create Booking

**Endpoint**: `POST /bookings`

**Authentication**: Bearer token (JWT) o API key

**Request Body**:
```json
{
  "alumno_id": "uuid",
  "profesor_id": "uuid",
  "fecha_inicio": "2026-11-10T10:00:00Z",
  "duracion_minutos": 60,
  "tipo_sesion": "class|training|consultation",
  "notas_alumno": "string (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "id": "booking-uuid",
  "alumno_id": "uuid",
  "profesor_id": "uuid",
  "fecha_inicio": "2026-11-10T10:00:00Z",
  "fecha_fin": "2026-11-10T11:00:00Z",
  "estado": "pendiente",
  "cupo_utilizado": 1,
  "created_at": "2026-11-05T14:30:00Z",
  "created_by": "alumno-uuid"
}
```

**Error Responses**:
- `409 Conflict`: Slot already booked or quota exceeded
  ```json
  {"code": "ERR_BOOKING_CONFLICT", "message": "Slot occupied or quota limit reached"}
  ```
- `400 Bad Request`: Invalid payload or missing required fields
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User lacks permission to create booking

**Fallback**: If Booking Service is unreachable, return 503 Service Unavailable with retry guidance.

---

### 1.2 Get Booking by ID

**Endpoint**: `GET /bookings/{booking_id}`

**Authentication**: Bearer token

**Success Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "alumno_id": "uuid",
  "profesor_id": "uuid",
  "fecha_inicio": "2026-11-10T10:00:00Z",
  "fecha_fin": "2026-11-10T11:00:00Z",
  "estado": "confirmado|cancelado|pendiente|rechazado",
  "asistencia": null | "asistio" | "no_asistio" | "falta_justificada",
  "cupo_utilizado": 1,
  "notas": "string (optional)",
  "created_at": "2026-11-05T14:30:00Z",
  "updated_at": "2026-11-05T14:35:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Booking does not exist
- `403 Forbidden`: User lacks permission to view this booking

---

### 1.3 List Bookings (with pagination)

**Endpoint**: `GET /bookings?limit=20&cursor=<base64_encoded_id>&filters`

**Query Parameters**:
- `limit` (optional, default=20): Number of results per page
- `cursor` (optional): Base64-encoded booking_id for cursor-based pagination
- `estado` (optional): Filter by status (pendiente, confirmado, cancelado, rechazado)
- `alumno_id` (optional): Filter by student
- `profesor_id` (optional): Filter by teacher
- `fecha_desde` (optional): ISO8601 date filter (start)
- `fecha_hasta` (optional): ISO8601 date filter (end)

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "booking-uuid",
      "alumno_id": "uuid",
      "profesor_id": "uuid",
      "fecha_inicio": "2026-11-10T10:00:00Z",
      "estado": "confirmado",
      "asistencia": null
    }
  ],
  "pagination": {
    "limit": 20,
    "total_count": 150,
    "next_cursor": "eyJib29raW5nX2lkIjogIjEyMzQ1Njc4LWFiY2QtZWYwMSJ9"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid cursor or filter parameters
- `403 Forbidden`: User lacks permission to list bookings (scope by role)

---

### 1.4 Update Booking Status

**Endpoint**: `PATCH /bookings/{booking_id}/status`

**Authentication**: Bearer token (admin/superadmin only)

**Request Body**:
```json
{
  "nuevo_estado": "confirmado|cancelado|rechazado",
  "razon": "string (optional)",
  "notificar_alumno": true
}
```

**Success Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "estado": "confirmado",
  "updated_at": "2026-11-05T14:35:00Z",
  "evento_auditoria_id": "audit-uuid"
}
```

**Error Responses**:
- `404 Not Found`: Booking does not exist
- `409 Conflict`: Cannot change status (e.g., already cancelled)
- `403 Forbidden`: User lacks permission to update this booking

---

### 1.5 Cancel Booking

**Endpoint**: `DELETE /bookings/{booking_id}` or `PATCH /bookings/{booking_id}/cancel`

**Authentication**: Bearer token

**Request Body** (optional):
```json
{
  "razon_cancelacion": "string (optional)",
  "notificar_profesor": true
}
```

**Success Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "estado": "cancelado",
  "cancelled_at": "2026-11-05T14:35:00Z",
  "evento_auditoria_id": "audit-uuid"
}
```

**Error Responses**:
- `404 Not Found`: Booking does not exist
- `409 Conflict`: Cannot cancel (window expired, already cancelled)
- `403 Forbidden`: User lacks permission to cancel this booking

**BFF Validation**: Enforce 1-hour cancellation window before booking start time (server timezone).

---

### 1.6 Record Attendance

**Endpoint**: `PATCH /bookings/{booking_id}/attendance`

**Authentication**: Bearer token (admin/teacher only)

**Request Body**:
```json
{
  "asistencia": "asistio|no_asistio|falta_justificada",
  "notas": "string (optional)"
}
```

**Success Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "asistencia": "asistio",
  "updated_at": "2026-11-05T14:35:00Z",
  "evento_auditoria_id": "audit-uuid"
}
```

---

## 2. User Service

**Base URL**: `http://user-service:3002/api/v1`

### 2.1 Get User Profile

**Endpoint**: `GET /users/{user_id}`

**Authentication**: Bearer token

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "nombre": "string",
  "email": "string",
  "rol": "usuario|alumno|admin|superadmin",
  "estado": "activo|inactivo|suspendido",
  "fecha_creacion": "2026-01-01T00:00:00Z",
  "profesor_id": "uuid (if alumno)" 
}
```

**Error Responses**:
- `404 Not Found`: User does not exist
- `401 Unauthorized`: Token invalid or expired

---

### 2.2 Update User Role (Superadmin only)

**Endpoint**: `PATCH /users/{user_id}/role`

**Authentication**: Bearer token (superadmin only)

**Request Body**:
```json
{
  "nuevo_rol": "alumno|admin|usuario",
  "razon_cambio": "string (optional)"
}
```

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "rol": "alumno",
  "updated_at": "2026-11-05T14:35:00Z",
  "evento_auditoria_id": "audit-uuid"
}
```

**Error Responses**:
- `404 Not Found`: User does not exist
- `403 Forbidden`: Only superadmin can change roles
- `409 Conflict`: Invalid role transition

---

### 2.3 Deactivate User

**Endpoint**: `PATCH /users/{user_id}/status`

**Authentication**: Bearer token (superadmin only)

**Request Body**:
```json
{
  "nuevo_estado": "inactivo|suspendido",
  "razon": "string (optional)"
}
```

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "estado": "inactivo",
  "updated_at": "2026-11-05T14:35:00Z",
  "evento_auditoria_id": "audit-uuid"
}
```

---

### 2.4 List Users (with pagination)

**Endpoint**: `GET /users?limit=20&cursor=<id>&filters`

**Query Parameters**:
- `limit` (optional, default=20)
- `cursor` (optional): Base64-encoded user_id
- `rol` (optional): Filter by role
- `estado` (optional): Filter by status
- `search` (optional): Search by name/email

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "user-uuid",
      "nombre": "string",
      "email": "string",
      "rol": "alumno",
      "estado": "activo"
    }
  ],
  "pagination": {
    "limit": 20,
    "total_count": 250,
    "next_cursor": "..."
  }
}
```

**Authorization**: Admins see users in their scope; superadmin sees all.

---

## 3. Notification Service

**Base URL**: `http://notification-service:3003/api/v1`

### 3.1 Send Email Notification

**Endpoint**: `POST /notifications/email`

**Authentication**: Bearer token or service-to-service key

**Request Body**:
```json
{
  "destinatario_email": "alumno@example.com",
  "tipo_notificacion": "booking_confirmed|booking_cancelled|booking_rejected|attendance_recorded",
  "datos_contexto": {
    "booking_id": "uuid",
    "nombre_alumno": "string",
    "nombre_profesor": "string",
    "fecha_sesion": "2026-11-10T10:00:00Z",
    "accion_requerida": "string (optional)"
  },
  "idioma": "es|en" (optional, default: es)
}
```

**Success Response** (202 Accepted):
```json
{
  "notificacion_id": "notification-uuid",
  "destinatario_email": "alumno@example.com",
  "tipo": "booking_confirmed",
  "estado": "enviando",
  "scheduled_at": "2026-11-05T14:35:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email or missing required fields
- `503 Service Unavailable`: Email service temporary outage (queue for retry)

**BFF Behavior**: 
- Fire email asynchronously (non-blocking booking response)
- Retry logic: exponential backoff (1s, 2s, 4s, 8s, 16s)
- Timeout: 5 seconds max wait before considering delivered

---

### 3.2 Send In-App Notification

**Endpoint**: `POST /notifications/in-app` (optional, frontend responsibility)

**Request Body**:
```json
{
  "usuario_id": "uuid",
  "titulo": "string",
  "mensaje": "string",
  "tipo": "info|warning|error|success",
  "accion_url": "string (optional)"
}
```

---

## 4. Error Handling & Fallback Strategy

### Connection Failures

| Service | Timeout | Fallback | BFF Response |
|---------|---------|----------|---|
| Booking Service | 5s | Return 503 | Retry with exponential backoff |
| User Service | 3s | Cache last known state | Return 503 if critical for auth |
| Notification Service | 5s | Queue email for retry | Continue (non-blocking) |

### HTTP Status Code Mapping

| Downstream Status | BFF Status | BFF Code |
|---|---|---|
| 2xx | 200 | Success |
| 400 | 400 | ERR_INVALID_REQUEST |
| 401 | 401 | ERR_UNAUTHORIZED |
| 403 | 403 | ERR_FORBIDDEN |
| 404 | 404 | ERR_NOT_FOUND |
| 409 | 409 | ERR_CONFLICT |
| 5xx | 503 | ERR_SERVICE_UNAVAILABLE |

---

## 5. Versioning & Deprecation

- Current version: **v1**
- Backwards compatibility: Maintained for 1 major release
- Breaking changes: Announced 6 weeks in advance
- Deprecation headers: `Deprecation: true`, `Sunset: <date>` (RFC 8594)

---

## 6. Testing & Validation

**Integration Tests**:
- Mock Booking Service with test fixtures
- Verify error propagation (409 Conflict → BFF 409 + ERR_BOOKING_CONFLICT)
- Validate cursor pagination encoding/decoding
- Test timeout handling (service unreachable after 5s)

**Contract Tests** (Pact-style):
- Booking Service consumer-side: verify request format, verify response contains required fields
- User Service consumer-side: verify role enum values match
- Notification Service consumer-side: verify async fire-and-forget behavior

---

## Apéndice: Ejemplos de flujos end-to-end

### Flujo 1: Alumno crea reserva (Happy Path)

```
1. BFF POST /api/reservas (alumno_id, profesor_id, fecha, duracion)
   ├─ Validar token y rol (alumno)
   ├─ Llamar Booking Service POST /bookings
   │  ├─ Si 201: Registro exitoso
   │  ├─ Si 409: Slot ocupado o cupo superado
   │  └─ Si 5xx: Fallback a 503 + retry
   ├─ Si éxito:
   │  ├─ Llamar Notification Service POST /notifications/email (async, no esperar)
   │  └─ Retornar 201 + booking_id al frontend
   └─ Si error: Retornar error code + mensaje
```

### Flujo 2: Admin aprueba reserva

```
1. BFF PATCH /api/reservas/{booking_id}/estado (nuevo_estado=confirmado)
   ├─ Validar token y rol (admin)
   ├─ Validar scope (reserva pertenece a profesorId del admin)
   ├─ Llamar Booking Service PATCH /bookings/{id}/status
   ├─ Registrar evento auditoría (audit_events table)
   └─ Notificar alumno vía email (async)
```

### Flujo 3: Listar reservas con paginación

```
1. BFF GET /api/reservas?limit=20&cursor=X&estado=confirmado
   ├─ Validar token y rol
   ├─ Construir filtros según rol (alumno → solo propias, admin → scope, superadmin → todas)
   ├─ Llamar Booking Service GET /bookings?limit=20&cursor=X&filters
   ├─ Decodificar cursor para siguiente página
   └─ Retornar { data: [...], pagination: { next_cursor } }
```

---

**Revisor**: BFF Team  
**Próxima revisión**: 2026-11-20
