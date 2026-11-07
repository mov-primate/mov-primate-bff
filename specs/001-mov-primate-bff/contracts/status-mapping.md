# BFF Status Mapping & UI State Transitions

**Documento de especificación** del mapeo entre estados del backend y estados de la UI.

**Última actualización**: 2026-11-05

**Status**: Active

---

## Overview

El BFF define transiciones de estado consistentes entre:
- **Backend state**: Estado en base de datos (pendiente, confirmado, cancelado, rechazado, completado)
- **UI state**: Estado visible al usuario (pending, approved, rejected, cancelled, done)
- **UI actions available**: Botones/acciones disponibles según estado y rol

**Objetivo**: Evitar ambigüedad en UX y permitir frontend predecible.

---

## 1. Booking State Lifecycle

### State Diagram

```
[CREADO]
   |
   v
[PENDIENTE] ---> [CONFIRMADO] ---> [COMPLETADO]
   |                    |
   |                    +---> [CANCELADO]
   |
   +---> [RECHAZADO]
   |
   +---> [CANCELADO]
```

### State Definitions

| Estado Backend | Descripción | Duración | Quién puede cambiar |
|--------|---|---|---|
| `pendiente` | Reserva creada, esperando confirmación | Típ. < 24h | admin (confirmar/rechazar/cancelar), alumno (cancelar si <1h) |
| `confirmado` | Admin aprobó, sesión confirmada | Hasta sesión | alumno (cancelar si <1h), admin (cancelar, marcar completado) |
| `completado` | Sesión ocurrió, registro cerrado | Permanente | Solo lectura (puede registrar asistencia) |
| `cancelado` | Reserva cancelada (por cualquier razón) | Permanente | Solo lectura |
| `rechazado` | Admin rechazó explícitamente | Permanente | Solo lectura |

---

## 2. Frontend UI State Mapping

### Alumno View

| Estado Backend | UI Label | Color | Icono | Acciones Disponibles |
|--------|---|---|---|---|
| pendiente | "Pending Approval" | Amber | ⏳ | Cancel (if <1h before start) |
| confirmado | "Confirmed" | Green | ✓ | Cancel (if <1h before start), View Details |
| completado | "Completed" | Gray | ✓ | View Details, Download Certificate (optional) |
| cancelado | "Cancelled" | Red | ✗ | View Details (read-only), Rebook |
| rechazado | "Rejected" | Red | ✗ | View Details (read-only), Rebook |

**Visualización**:
```
ALUMNO VIEW (Spanish)
┌─────────────────────────────────────┐
│ Mi Reserva: 10 Nov, 10:00 AM        │
├─────────────────────────────────────┤
│ Estado: Confirmada ✓ (GREEN)        │
│ Profesor: Prof. García              │
│ Duración: 1 hora                    │
├─────────────────────────────────────┤
│ [ Cancelar ] [ Ver Detalles ]       │ (Actions)
└─────────────────────────────────────┘
```

### Admin/Profesor View

| Estado Backend | UI Label | Color | Icono | Acciones Disponibles |
|--------|---|---|---|---|
| pendiente | "Awaiting Decision" | Amber | ⏳ | Approve, Reject, Cancel, View Details |
| confirmado | "Approved" | Green | ✓ | Mark Done, Cancel, View Details |
| completado | "Done" | Gray | ✓ | Record Attendance, View Details |
| cancelado | "Cancelled" | Red | ✗ | View Details (read-only) |
| rechazado | "Rejected" | Red | ✗ | View Details (read-only) |

**Visualización**:
```
ADMIN VIEW (Spanish)
┌─────────────────────────────────────┐
│ Reserva de: Juan Pérez              │
│ Fecha: 10 Nov, 10:00 AM             │
│ Estado: Pendiente (AMBER) ⏳        │
├─────────────────────────────────────┤
│ [ Aprobar ] [ Rechazar ] [ Cancelar ]│ (Quick Actions)
│ [ Ver Detalles ]                    │
└─────────────────────────────────────┘
```

---

## 3. State Transition Rules

### From PENDIENTE

**Allowed transitions**:
- `pendiente` → `confirmado` (admin clicks "Approve")
- `pendiente` → `rechazado` (admin clicks "Reject")
- `pendiente` → `cancelado` (alumno clicks "Cancel" if <1h, or admin clicks "Cancel")

**Validations**:
- Alumno can only cancel if `now() < (booking.start_time - 60 min)` in server timezone
- Admin can cancel anytime
- Cannot confirm if session has already started

**API Call** (from BFF):
```
PATCH /api/bookings/{booking_id}/status
{
  "nuevo_estado": "confirmado",
  "razon": "Approved by teacher"
}
Response: 200 OK + updated booking with new estado
```

---

### From CONFIRMADO

**Allowed transitions**:
- `confirmado` → `completado` (admin clicks "Mark Done" after session ends, or automatic after session time)
- `confirmado` → `cancelado` (alumno clicks "Cancel" if <1h, or admin clicks "Cancel")

**Validations**:
- Alumno can only cancel if `now() < (booking.start_time - 60 min)`
- Admin can cancel anytime
- Cannot mark "done" before session start time

---

### From COMPLETADO

**Allowed transitions**: NONE (terminal state)

**Why**: Session already occurred; no state changes permitted (read-only mode)

**Actions allowed**:
- Record attendance (PATCH `/bookings/{id}/attendance`)
- View details
- Export attendance report

---

### From CANCELADO

**Allowed transitions**: NONE (terminal state)

**Why**: Cancellation is final; no reversal

**Actions allowed**:
- View cancellation reason
- View audit trail
- Rebook (create new booking for different slot)

---

### From RECHAZADO

**Allowed transitions**: NONE (terminal state)

**Why**: Rejection is final; no reversal

**Actions allowed**:
- View rejection reason
- View audit trail
- Rebook (create new booking)

---

## 4. Attendance Substates

After booking reaches `completado`, admin can record attendance:

| Asistencia | Significado | Símbolo | Impacto en Cupo |
|---|---|---|---|
| null | No registrado aún | ⚠️ | Contar como "asistió" por defecto |
| asistio | Alumno asistió | ✓ | Contar asistencia |
| no_asistio | Alumno no se presentó | ✗ | Registrar inasistencia |
| falta_justificada | Ausencia justificada | ⚠️ | Contabilizar, pero marcar como justificada |

**Endpoint**:
```
PATCH /api/bookings/{booking_id}/attendance
{
  "asistencia": "asistio|no_asistio|falta_justificada",
  "notas": "Justificación o observaciones"
}
Response: 200 OK + updated booking with attendance field
```

---

## 5. Backend Response Format

### Standard Response Body

**Success (200/201)**:
```json
{
  "id": "booking-uuid",
  "alumno_id": "alumno-1",
  "profesor_id": "prof-1",
  "fecha_inicio": "2026-11-10T10:00:00Z",
  "fecha_fin": "2026-11-10T11:00:00Z",
  "estado": "confirmado",
  "asistencia": null,
  "created_at": "2026-11-05T10:00:00Z",
  "updated_at": "2026-11-05T14:35:00Z",
  "created_by": "alumno-1",
  "confirmed_by": "prof-1",
  "confirmed_at": "2026-11-05T14:35:00Z"
}
```

---

## 6. State Validation Pseudocode

```typescript
// BFF endpoint: Update booking status
@Patch('/bookings/:id/status')
async updateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { nuevo_estado, razon } = req.body;
  const { user_id, rol, escuela_id } = req.user;
  
  // 1. Fetch current booking
  const booking = await getBooking(id);
  if (!booking) return res.status(404).json({ code: 'ERR_RESOURCE_NOT_FOUND' });
  
  // 2. Check permission
  if (rol === 'alumno' && nuevo_estado === 'cancelado') {
    // Alumno can only cancel own bookings within 1 hour window
    if (booking.alumno_id !== user_id)
      return res.status(403).json({ code: 'ERR_SCOPE_DENIED' });
    
    const now = new Date();
    const oneHourBefore = new Date(booking.fecha_inicio.getTime() - 60*60*1000);
    if (now > oneHourBefore)
      return res.status(409).json({ code: 'ERR_CANCELLATION_WINDOW_EXPIRED' });
  } else if (rol === 'admin' || rol === 'superadmin') {
    // Admin can change status if booking is in their scope
    if (booking.escuela_id !== escuela_id && rol !== 'superadmin')
      return res.status(403).json({ code: 'ERR_SCOPE_DENIED' });
  } else {
    // usuario cannot change status
    return res.status(403).json({ code: 'ERR_INSUFFICIENT_PERMISSION' });
  }
  
  // 3. Validate state transition
  const validTransitions = {
    pendiente: ['confirmado', 'rechazado', 'cancelado'],
    confirmado: ['completado', 'cancelado'],
    completado: [],  // Terminal
    cancelado: [],   // Terminal
    rechazado: []    // Terminal
  };
  
  if (!validTransitions[booking.estado].includes(nuevo_estado)) {
    return res.status(409).json({
      code: 'ERR_INVALID_STATE_TRANSITION',
      data: {
        current_state: booking.estado,
        requested_state: nuevo_estado,
        valid_transitions: validTransitions[booking.estado]
      }
    });
  }
  
  // 4. Update booking
  const updated = await updateBooking(id, {
    estado: nuevo_estado,
    [`${nuevo_estado}_by`]: user_id,
    [`${nuevo_estado}_at`]: new Date(),
    updated_at: new Date()
  });
  
  // 5. Record audit event
  await auditService.create({
    accion: `BOOKING_${nuevo_estado.toUpperCase()}`,
    id_recurso: id,
    valor_anterior: { estado: booking.estado },
    valor_nuevo: { estado: nuevo_estado },
    razon,
    ...auditContext
  });
  
  // 6. Trigger side effects (notifications)
  await notificationService.send({
    evento: `booking.${nuevo_estado}`,
    booking_id: id,
    alumno_id: booking.alumno_id,
    profesor_id: booking.profesor_id
  });
  
  return res.json(updated);
}
```

---

## 7. Frontend State Machine Implementation (React/Angular)

### React Example (Hooks)

```typescript
const BookingStatusMachine = {
  pendiente: {
    alumnoActions: ['cancel'],  // if within 1h
    adminActions: ['approve', 'reject', 'cancel'],
    nextStates: {
      cancel: 'cancelado',
      approve: 'confirmado',
      reject: 'rechazado'
    }
  },
  confirmado: {
    alumnoActions: ['cancel'],  // if within 1h
    adminActions: ['done', 'cancel'],
    nextStates: {
      cancel: 'cancelado',
      done: 'completado'
    }
  },
  completado: {
    alumnoActions: [],
    adminActions: [],  // Can record attendance separately
    nextStates: {}
  },
  cancelado: {
    alumnoActions: [],
    adminActions: [],
    nextStates: {}
  },
  rechazado: {
    alumnoActions: [],
    adminActions: [],
    nextStates: {}
  }
};

// Component
function BookingCard({ booking, userRole }) {
  const stateConfig = BookingStatusMachine[booking.estado];
  const availableActions = userRole === 'alumno'
    ? stateConfig.alumnoActions
    : stateConfig.adminActions;

  const handleStatusChange = async (action) => {
    const newState = stateConfig.nextStates[action];
    const response = await api.patch(`/bookings/${booking.id}/status`, {
      nuevo_estado: newState
    });
    // Update UI state
    setBooking(response.data);
  };

  return (
    <div>
      <h3>{booking.alumno_name}</h3>
      <p>Estado: {booking.estado}</p>
      <div>
        {availableActions.includes('cancel') && (
          <button onClick={() => handleStatusChange('cancel')}>
            Cancelar
          </button>
        )}
        {availableActions.includes('approve') && (
          <button onClick={() => handleStatusChange('approve')}>
            Aprobar
          </button>
        )}
        {/* ... more actions */}
      </div>
    </div>
  );
}
```

---

## 8. Status-Dependent UI Elements

### Visibility Rules

| Estado | Show "Cancel" | Show "Approve" | Show "Reject" | Show "Attendance" | Show "Details" |
|--------|---|---|---|---|---|
| pendiente | ✓ (if <1h) | ✓ (admin) | ✓ (admin) | ✗ | ✓ |
| confirmado | ✓ (if <1h) | ✗ | ✗ | ✓ (after end time) | ✓ |
| completado | ✗ | ✗ | ✗ | ✓ | ✓ |
| cancelado | ✗ | ✗ | ✗ | ✗ | ✓ (read-only) |
| rechazado | ✗ | ✗ | ✗ | ✗ | ✓ (read-only) |

---

## 9. Pagination & List Views

### Booking List: Filter by State

**Query**:
```
GET /api/bookings?estado=pendiente,confirmado&limit=20
```

**Response Groups**:
```json
{
  "data": [
    {
      "group": "pendiente",
      "items": [
        { "id": "b1", "alumno": "Juan", "estado": "pendiente" },
        { "id": "b2", "alumno": "María", "estado": "pendiente" }
      ]
    },
    {
      "group": "confirmado",
      "items": [
        { "id": "b3", "alumno": "Pedro", "estado": "confirmado" }
      ]
    }
  ],
  "total": 3
}
```

---

## 10. Testing Status Transitions

```typescript
describe('Booking Status Transitions', () => {
  
  it('should allow alumno to cancel within 1 hour window', async () => {
    const booking = createBooking({
      estado: 'confirmado',
      fecha_inicio: futureDate(50, 'minutes')  // 50 min from now
    });
    
    const token = createToken({ user_id: booking.alumno_id, rol: 'alumno' });
    const res = await client.patch(`/api/bookings/${booking.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevo_estado: 'cancelado' });
    
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelado');
  });

  it('should deny alumno cancellation > 1 hour before', async () => {
    const booking = createBooking({
      estado: 'confirmado',
      fecha_inicio: futureDate(90, 'minutes')  // 90 min from now
    });
    
    const token = createToken({ user_id: booking.alumno_id, rol: 'alumno' });
    const res = await client.patch(`/api/bookings/${booking.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevo_estado: 'cancelado' });
    
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ERR_CANCELLATION_WINDOW_EXPIRED');
  });

  it('should allow admin to transition from completado to N/A', async () => {
    const booking = createBooking({
      estado: 'completado'
    });
    
    const token = createToken({ user_id: 'admin-1', rol: 'admin' });
    const res = await client.patch(`/api/bookings/${booking.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevo_estado: 'cancelado' });
    
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ERR_INVALID_STATE_TRANSITION');
  });
});
```

---

**Last Reviewed**: 2026-11-05  
**Next Review**: 2026-11-20  
**Owner**: BFF Team  
**Related Docs**: permissions.md, audit-events.md, error-responses.md
