# Data Model: Capa BFF para MovPrimate

## Entidades de contrato

- UserSession
  - userId, role, permissions, tokenState
- BookingView
  - bookingId, studentId, slotStart, slotEnd, status, auditRef
- RoleChangeRequest
  - targetUserId, fromRole, toRole, requestedBy, reason
- ApiError
  - code, message, details, traceId
- AttendanceUpdate
  - bookingId, status (attended|missed|justified), updatedBy

## Reglas

- RoleChangeRequest solo válido si requestedBy es superadmin.
- BookingView se filtra por rol del solicitante.
- Booking cancelation en BFF se valida contra regla de 1 hora antes.
