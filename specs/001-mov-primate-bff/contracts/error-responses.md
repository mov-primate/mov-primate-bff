# BFF Error Response Contract

**Documento de especificación** de respuestas de error estandarizadas del BFF.

**Última actualización**: 2026-11-05

**Status**: Active

---

## Overview

El BFF retorna **códigos de error agnósticos del backend** (backend-agnostic error codes) de modo que:
- El frontend puede traducir códigos a mensajes en idioma del usuario
- Los servicios downstream pueden cambiar sin afectar el contrato del BFF
- Los errores son reproducibles y testables

**Estructura base**:

```json
{
  "status": 400,
  "code": "ERR_INVALID_REQUEST",
  "message": "Brief error description (EN)",
  "timestamp": "2026-11-05T14:35:00Z",
  "request_id": "uuid (for tracing)",
  "data": { /* optional context */ }
}
```

---

## Error Code Categories

### 4xx Client Errors

#### 400 Bad Request

**Codes**:
- `ERR_INVALID_REQUEST`: Malformed JSON or missing required fields
- `ERR_VALIDATION_FAILED`: Field validation failed (e.g., invalid email format)
- `ERR_INVALID_PAGINATION`: Invalid limit, cursor, or sort parameter

**Example**:
```json
{
  "status": 400,
  "code": "ERR_VALIDATION_FAILED",
  "message": "Field 'duracion_minutos' must be positive integer",
  "data": {
    "field": "duracion_minutos",
    "received_value": -60,
    "constraint": "positive_integer"
  }
}
```

---

#### 401 Unauthorized

**Codes**:
- `ERR_MISSING_TOKEN`: No Authorization header provided
- `ERR_INVALID_TOKEN`: Token malformed or invalid signature
- `ERR_EXPIRED_TOKEN`: Token expired; user must re-authenticate
- `ERR_INSUFFICIENT_CREDENTIALS`: Token valid but missing required claims (e.g., user_id)

**Example**:
```json
{
  "status": 401,
  "code": "ERR_EXPIRED_TOKEN",
  "message": "Your session has expired. Please log in again.",
  "data": {
    "expired_at": "2026-11-05T12:00:00Z",
    "retry_after": "immediate"
  }
}
```

---

#### 403 Forbidden

**Codes**:
- `ERR_INSUFFICIENT_PERMISSION`: User's role lacks permission for this action
- `ERR_SCOPE_DENIED`: User can perform action, but not on this resource (e.g., admin viewing other admin's bookings)
- `ERR_ACTION_NOT_ALLOWED`: Action is globally disabled (e.g., bookings closed for maintenance)

**Example**:
```json
{
  "status": 403,
  "code": "ERR_SCOPE_DENIED",
  "message": "You can only view bookings assigned to your classroom.",
  "data": {
    "user_role": "admin",
    "user_classroom_id": "class-123",
    "requested_classroom_id": "class-456",
    "allowed_action": "view_own_classroom_bookings"
  }
}
```

---

#### 404 Not Found

**Codes**:
- `ERR_RESOURCE_NOT_FOUND`: Requested resource does not exist (e.g., booking_id not found)
- `ERR_ENDPOINT_NOT_FOUND`: Endpoint does not exist (HTTP 404 fallback)

**Example**:
```json
{
  "status": 404,
  "code": "ERR_RESOURCE_NOT_FOUND",
  "message": "Booking not found",
  "data": {
    "resource_type": "booking",
    "resource_id": "booking-uuid-not-exists"
  }
}
```

---

#### 409 Conflict

**Codes**:
- `ERR_BOOKING_CONFLICT`: Slot already booked by another user
- `ERR_QUOTA_EXCEEDED`: Attempting to exceed slot capacity (max 4 students)
- `ERR_INVALID_STATE_TRANSITION`: Cannot change from current state to requested state (e.g., cancel a completed booking)
- `ERR_CANCELLATION_WINDOW_EXPIRED`: Cannot cancel within 1 hour of session start
- `ERR_DUPLICATE_RESOURCE`: Resource already exists (e.g., user email already registered)

**Example (Booking Conflict)**:
```json
{
  "status": 409,
  "code": "ERR_BOOKING_CONFLICT",
  "message": "This time slot is no longer available",
  "data": {
    "session_date": "2026-11-10T10:00:00Z",
    "conflicting_booking_id": "booking-uuid-other",
    "conflicting_student": "Juan Pérez",
    "available_alternatives": [
      {"date": "2026-11-10T11:00:00Z", "spots_available": 3},
      {"date": "2026-11-11T10:00:00Z", "spots_available": 2}
    ]
  }
}
```

**Example (Cancellation Window Expired)**:
```json
{
  "status": 409,
  "code": "ERR_CANCELLATION_WINDOW_EXPIRED",
  "message": "You can only cancel up to 1 hour before the session starts",
  "data": {
    "session_start": "2026-11-10T10:00:00Z",
    "current_time": "2026-11-10T09:20:00Z",
    "minutes_remaining": 40,
    "cancellation_deadline": "2026-11-10T09:00:00Z"
  }
}
```

**Example (State Transition Invalid)**:
```json
{
  "status": 409,
  "code": "ERR_INVALID_STATE_TRANSITION",
  "message": "Cannot change booking status from 'confirmado' to 'pendiente'",
  "data": {
    "current_state": "confirmado",
    "requested_state": "pendiente",
    "valid_transitions": ["cancelado", "completado"]
  }
}
```

---

### 5xx Server Errors

#### 503 Service Unavailable

**Codes**:
- `ERR_SERVICE_UNAVAILABLE`: A downstream service is temporarily unavailable
- `ERR_DATABASE_UNAVAILABLE`: Database connection failed
- `ERR_MAINTENANCE`: BFF is under maintenance

**Behavior**:
- Include `Retry-After` header (in seconds)
- Provide `next_check_time` in response body
- Log incident with `request_id` for debugging

**Example**:
```json
{
  "status": 503,
  "code": "ERR_SERVICE_UNAVAILABLE",
  "message": "The booking service is temporarily unavailable. Please try again in a few moments.",
  "data": {
    "service": "booking-service",
    "retry_after_seconds": 30,
    "next_check_time": "2026-11-05T14:36:00Z",
    "incident_id": "INC-2026-1105-001"
  },
  "headers": {
    "Retry-After": "30"
  }
}
```

---

#### 500 Internal Server Error

**Codes**:
- `ERR_INTERNAL_ERROR`: Unexpected error in BFF logic
- `ERR_UNHANDLED_EXCEPTION`: Exception not caught by middleware

**Behavior**:
- Never expose stack trace or internal details to client
- Always return generic message
- Log full error server-side with `request_id`

**Example**:
```json
{
  "status": 500,
  "code": "ERR_INTERNAL_ERROR",
  "message": "An unexpected error occurred. Our team has been notified.",
  "data": {
    "request_id": "req-uuid-12345",
    "support_contact": "support@movprimate.com"
  }
}
```

---

## Error Response Structure Details

### Required Fields

| Field | Type | Description |
|-------|------|---|
| `status` | number | HTTP status code (400, 401, 403, 404, 409, 500, 503) |
| `code` | string | Machine-readable error code (e.g., ERR_BOOKING_CONFLICT) |
| `message` | string | Human-readable brief message (EN) |
| `timestamp` | ISO8601 | When error occurred (server time) |
| `request_id` | uuid | Unique identifier for request tracing |

### Optional Fields

| Field | Type | Description |
|-------|------|---|
| `data` | object | Context-specific error details (see examples) |
| `details` | string | Longer explanation if needed |
| `trace_url` | string | Link to monitoring/tracing dashboard (internal only) |

---

## Frontend Translation Mapping

The frontend should map error codes to localized messages:

**Example (ES)**:
```javascript
const errorMessages = {
  ERR_BOOKING_CONFLICT: "El horario ya está reservado",
  ERR_QUOTA_EXCEEDED: "No hay lugares disponibles en esta sesión",
  ERR_CANCELLATION_WINDOW_EXPIRED: "Solo puedes cancelar hasta 1 hora antes de la sesión",
  ERR_INSUFFICIENT_PERMISSION: "No tienes permiso para realizar esta acción",
  ERR_EXPIRED_TOKEN: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
  ERR_SERVICE_UNAVAILABLE: "El servicio está temporalmente no disponible. Intenta más tarde",
};
```

---

## Handling Errors in Frontend

### Recommended UI Behavior

1. **Display Error Message**:
   - Use `message` field as fallback if translation not found
   - Highlight critical fields (e.g., if `ERR_VALIDATION_FAILED`, show field name)

2. **Offer Recovery Actions**:
   - 401/403: Redirect to login
   - 409 (booking conflict): Show alternatives (from `data.available_alternatives`)
   - 503: Show retry button with countdown (from `Retry-After` header)

3. **Log for Support**:
   - Capture `request_id` and include in support tickets
   - Send to analytics/error tracking (e.g., Sentry)

4. **Retry Logic**:
   - 409 (transient conflicts): Retry 1x after 100ms
   - 503: Retry with exponential backoff (1s, 2s, 4s, 8s)
   - 5xx: Log and show "contact support" message

---

## Testing Error Responses

### Unit Test Examples

```javascript
describe('Error Responses', () => {
  it('should return 409 when booking slot conflicts', async () => {
    const response = await client.post('/api/bookings', {
      alumno_id: 'user-1',
      profesor_id: 'prof-1',
      fecha: '2026-11-10T10:00:00Z',
    });
    
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('ERR_BOOKING_CONFLICT');
    expect(response.body.data.conflicting_booking_id).toBeDefined();
  });

  it('should return 401 when token expired', async () => {
    const response = await client.get('/api/bookings', {
      headers: { Authorization: 'Bearer expired-token' }
    });
    
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('ERR_EXPIRED_TOKEN');
  });
});
```

---

## Backwards Compatibility

- **Adding error codes**: Safe; clients ignore unknown codes
- **Removing error codes**: Breaking change; requires new API version
- **Changing `data` structure**: Minor change; clients should use defensive coding (e.g., `data?.field`)

---

**Last Reviewed**: 2026-11-05  
**Next Review**: 2026-11-20  
**Owner**: BFF Team
