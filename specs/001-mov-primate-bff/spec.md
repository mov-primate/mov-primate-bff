# Feature Specification: Capa BFF para MovPrimate

**Feature Branch**: `001-mov-primate-bff`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Define la capa BFF para orquestar reservas, autenticación, contratos con frontend y microservicios para MovPrimate. Debe facilitar la autenticación del alumno, el profesor y el superadmin, y exponer pantallas y eventos consistentes para el frontend."

## User Scenarios & Testing

### User Story 1 - Frontend consume un BFF consistente (Priority: P1)
El frontend de Angular consume una capa BFF con endpoints claros para landing page, autenticación, disponibilidad y reservas.

**Why this priority**: El BFF es la interfaz estable entre la experiencia del usuario y los servicios internos, por lo que la consistencia del contrato es crítica para evitar fricción y errores.

**Independent Test**: El cliente puede consumir un payload consistente para autenticación y reserva sin conocer detalles internos del microservicio.

**Acceptance Scenarios**:
1. **Given** que el frontend necesita cargar la landing page, **When** llama al BFF, **Then** recibe un contrato estable con datos públicos y sin filtrar información interna.
2. **Given** que el cliente solicita la disponibilidad del horario, **When** usa el BFF, **Then** recibe solo el estado relevante para la vista del usuario.

---

### User Story 2 - Alumno inicia sesión y reserva desde el BFF (Priority: P1)
El alumno autenticado realiza el flujo de booking a través del BFF, que compone varias llamadas y valida permisos.

**Why this priority**: El alumno necesita un flujo seguro y sencillo, sin saber qué servicios internos se ejecutan.

**Independent Test**: Un alumno puede autenticarse y reservar una sesión de 1 hora desde el frontend usando el BFF como único punto de entrada.

**Acceptance Scenarios**:
1. **Given** que el alumno está autenticado, **When** solicita la lista de slots, **Then** el BFF responde con disponibilidad y sin romper la UI.
2. **Given** que el alumno intenta reservar un horario ocupado, **When** llama al BFF, **Then** retorna un error de negocio claro y una respuesta consistente.

---

### User Story 3 - Administrador valida reservas y revisa estado (Priority: P1)
El profesor o administrador usa el BFF para aprobar o rechazar reservas con permisos explícitos y respuestas consistentes.

**Why this priority**: La autorización de acciones administrativas debe mantenerse centralizada y consistente.

**Independent Test**: Un administrador autenticado puede aprobar o rechazar reservas desde el frontend sin manejar detalles de implementación del dominio.

**Acceptance Scenarios**:
1. **Given** que el administrador tiene el rol correcto, **When** invoca la validación, **Then** el BFF ejecuta la operación y devuelve el estado actualizado.
2. **Given** que el usuario no tiene permisos, **When** intenta validar, **Then** el BFF responde con error 403 o equivalente de autorización.

---

### User Story 4 - Superadmin supervisa la operación (Priority: P1)
El dueño del gimnasio accede a reportes y supervisión global a través del BFF para casos excepcionales.

**Why this priority**: El superadmin debe ver información agregada sin mezclar responsabilidades entre servicios.

**Independent Test**: El superadmin puede consultar una vista global correcta de reservas y usuarios con acceso autorizado.

**Acceptance Scenarios**:
1. **Given** que el superadmin está autenticado, **When** consulta la operación global, **Then** el BFF compone la información sin exponer datos no autorizados.
2. **Given** que hay una excepción, **When** el superadmin interviene, **Then** el sistema responde con permisos y acciones controladas.

---

### User Story 5 - Notificaciones y eventos fluyen al cliente (Priority: P2)
El BFF expone respuestas y eventos de notificación con respuestas claras para la UI.

**Why this priority**: La información de confirmación o rechazo debe llegar al cliente en forma consistente y sin dependencias externas.

**Independent Test**: El cliente recibe respuestas de notificación y estado después de aceptar o rechazar una reserva.

**Acceptance Scenarios**:
1. **Given** que la reserva cambia de estado, **When** el BFF procesa la respuesta, **Then** devuelve un payload actualizadO con notificación relevante.
2. **Given** que hubo un error de dominio, **When** el BFF invoca servicios downstream, **Then** responde con el mensaje claro para la experiencia del usuario.

### Edge Cases

- ¿Qué pasa si el BFF recibe un token válido pero con un rol no autorizado para la acción?
- ¿Cómo responde el BFF si uno de los microservicios falla durante una reserva?
- ¿Qué ocurre si la app solicita una reserva con un slot inválido o inexistente?
- ¿Cómo maneja el BFF un conflicto de horarios ya detectado en otro servicio?

## Requirements

### Functional Requirements

- **FR-001**: El BFF DEBE expone un contrato uniforme para landing page, autenticación, disponibilidad de slots y reservas.
- **FR-002**: El BFF DEBE validar sesión, rol y contexto antes de ejecutar acciones sensibles.
- **FR-003**: El BFF DEBE distinguir permisos de alumno, administrador/profesor y superadmin.
- **FR-004**: El BFF DEBE orquestar llamadas a API y microservicios sin exponer detalles internos al frontend.
- **FR-005**: El BFF DEBE devolver errores estandarizados para validación, permisos y conflictos de negocio.
- **FR-006**: El BFF DEBE soportar la reserva de sesiones de 1 hora desde la app con respuesta consistente.
- **FR-007**: El BFF DEBE permitir al administrador revisar y validar reservas desde la misma plataforma.
- **FR-008**: El BFF DEBE centralizar la traducción entre contratos del frontend y de los servicios del dominio.
- **FR-009**: El BFF DEBE mantener trazabilidad de llamadas, resultados y tiempo de respuesta.
- **FR-010**: El BFF DEBE permitir al superadmin consultar información global sin exponer datos no autorizados.
- **FR-011**: El BFF DEBE validar que el alumno tenga `available_classes` > 0 (cuota disponible) antes de permitir crear una reserva, consultando al microservicio de alumnos.

### Key Entities

- **Usuario autenticado**: entidad con identidad, sesión y permisos para las acciones permitidas.
- **Solicitud del cliente**: petición del frontend con contexto, rol y payload específico.
- **Respuesta BFF**: resultado normalizado con estado, errores y datos de negocio.
- **Reserva**: recurso compuesto que llega a la UI desde varios servicios.
- **Contrato de integración**: definición de payloads y respuestas entre frontend y BFF.
- **Cuota de clases (available_classes)**: contador de clases disponibles del alumno, fuente de verdad en microservicio de alumnos; BFF valida antes de reserva.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El frontend puede autenticarse y realizar la reserva principal con al menos un 99% de respuestas válidas del BFF.
- **SC-002**: El 100% de las rutas sensibles del BFF validan permisos antes de ejecutar la acción.
- **SC-003**: El BFF responde con errores claros y consistentes para conflicto, no autorizado y faltantes de datos.
- **SC-004**: El tiempo de respuesta promedio del BFF para una reserva principal se mantiene dentro de límites operativos esperados.
- **SC-005**: La app utiliza un único contrato estable del BFF para abarcar landing page, autenticación, reserva y administración.

## Assumptions

- El BFF recibe identidad y rol del usuario autenticado desde un token o sesión validada por la capa de seguridad.
- La capa de servicios downstream ya implementa reglas de negocio y persistencia.
- El BFF no reemplaza la lógica de dominio, solo la orquesta y normaliza.
- La experiencia de Angular depende de los contratos del BFF para mantener estabilidad.
- Los endpoints sensibles se evaluarán con permisos explícitos por rol y por acción.

## Clarifications

### Session 2026-11-05

- Q: ¿Cuáles son los endpoints específicos, métodos HTTP, esquemas y códigos de error de los microservicios descendentes? → A: Crear documento "Downstream Service Contracts" con Booking Service, User Service, Notification Service; incluir códigos de error y fallback.
- Q: ¿El BFF devuelve códigos de error agnósticos del backend (ERR_BOOKING_CONFLICT) que el frontend traduce, o mensajes ya localizados? → A: Códigos agnósticos (Option A); el frontend traduce.
- Q: ¿Cuál es la matriz exacta de permisos (Rol × Acción × Recurso) para superadmin, admin, alumno, usuario? → A: Matriz definida: usuario=propio, alumno=sí (propio cancel), admin=cualquiera, superadmin=todas.
- Q: ¿Qué eventos se auditan y cuál es el esquema de auditoría (campos, tipos, almacenamiento)? → A: Auditar todas las transiciones de estado (bookings, roles); esquema con id, timestamp, actor_id, acción, resource_type, resource_id, old_value, new_value, reason, ip_address en tabla audit_events inmutable.
- Q: ¿Estrategia de paginación para historial de reservas: limit/offset, cursor o keyset? → A: Cursor-based (Option A) para evitar offset drift y eficiencia en datasets grandes.

## Reglas globales obligatorias (actualización BFF)

- El BFF debe soportar 4 roles: `superadmin`, `admin`, `alumno`, `usuario`.
- Debe exponer contratos para:
  - reasignación de roles y desactivación de usuarios (solo superadmin),
  - reservas de alumno con selección obligatoria de profesor,
  - actualización de estado por admin (confirmado/cancelado/pendiente/rechazado),
  - asistencia por admin (asistió/no asistió/justificó ausencia),
  - panel superadmin con reservas y total de asistencias por alumno.
  - **gestión de cuota de clases (available_classes)**: solo superadmin puede editar; BFF valida disponibilidad antes de crear reserva.
- Debe negar por alcance toda modificación de admin en reservas no asignadas a su profesorId.
- Debe aplicar regla de anulación hasta 1 hora antes y bloquear slots con cupo 4.
- **Debe validar available_classes > 0 antes de permitir crear reserva (FR-011)**. Si available_classes = 0, rechazar con error ERR_NO_CLASSES_AVAILABLE.
- Debe propagar evento/comando para envío de correo por estado de reserva.


## Matriz de permisos (Rol × Acción × Recurso)

| Rol | Crear Reserva | Cancelar Reserva | Ver Auditoría | Cambiar Rol |
|-----|---|---|---|---|
| usuario | Solo propio | Solo propio (si <1h) | No | No |
| alumno | Sí | Solo propio (si <1h) | No | No |
| admin | Cualquiera | Cualquiera | Propia org | No |
| superadmin | Cualquiera | Cualquiera | Todas | Sí |

## Esquema de auditoría

Todos los cambios de estado (reservas, roles, usuarios) se registran en tabla `audit_events` con estructura inmutable:

```json
{
  "id": "uuid",
  "timestamp": "ISO8601-UTC",
  "actor_id": "user_id",
  "accion": "RESERVA_CREADA|RESERVA_CANCELADA|RESERVA_CONFIRMADA|ROL_CAMBIO|...",
  "tipo_recurso": "RESERVA|USUARIO|...",
  "id_recurso": "booking_id o user_id",
  "valor_anterior": {...},
  "valor_nuevo": {...},
  "razon": "string o null",
  "ip_address": "string o null"
}
```

## Estrategia de respuestas de error

El BFF retorna códigos de error estandarizados (agnósticos del backend) para que el frontend traduzca:

```json
{
  "status": 409,
  "code": "ERR_BOOKING_CONFLICT",
  "message": "Conflict detected",
  "data": {
    "conflicting_booking_id": "...",
    "slot_start": "2026-11-10T10:00:00Z"
  }
}
```

Códigos principales: `ERR_BOOKING_NOT_FOUND`, `ERR_INVALID_ROLE`, `ERR_UNAUTHORIZED`, `ERR_BOOKING_CONFLICT`, `ERR_QUOTA_EXCEEDED`, `ERR_CANCELLATION_WINDOW_EXPIRED`.

## Estrategia de paginación (Historial de reservas)

Cursor-based pagination para evitar offset drift y mantener eficiencia:

- `GET /bookings?limit=20&cursor=<encoded_booking_id>`
- Respuesta incluye `next_cursor` para siguiente página
- Cursor es base64-encoded primary key (booking_id)
- Soporta filtros: `?status=confirmed&fecha_desde=2026-11-01&fecha_hasta=2026-11-30`
- Campos ordenables: fecha de reserva, estado, profesor
