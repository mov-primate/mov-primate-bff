# Tasks: Capa BFF para MovPrimate

**Input**: Design documents from `/specs/001-mov-primate-bff/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks grouped by endpoint and user scope.

## Phase 1: Setup

- [ ] T001 Initialize NestJS app and project structure
- [ ] T002 Configure environment variables and base app modules
- [ ] T003 [P] Set up shared DTOs, validation, and error payloads
- [ ] T004 [P] Configure auth middleware and session/role extraction

## Phase 2: Foundational

- [ ] T005 Implement generic response and error normalization
- [ ] T006 Implement role guard and permission map for student/admin/superadmin
- [ ] T007 Create HTTP client services for API/microservices
- [ ] T008 Create orchestration layer for landing, auth, booking and admin endpoints

## Phase 3: User Story 1 - Landing and auth (Priority: P1)

- [ ] T009 [P] [US1] Implement public landing data endpoint
- [ ] T010 [US1] Implement auth/session validation endpoint
- [ ] T011 [US1] Implement role-aware session response for UI

## Phase 4: User Story 2 - Student booking flow (Priority: P1)

- [ ] T012 [P] [US2] Implement slot query endpoint
- [ ] T013 [US2] [FR-011] Implement booking creation endpoint with available_classes validation: query alumno service, reject if available_classes = 0 with ERR_NO_CLASSES_AVAILABLE
- [ ] T014 [US2] Handle duplicate and conflict errors from downstream services
- [ ] T015 [US2] Implement student booking history endpoint

## Phase 5: User Story 3 - Admin approval/rejection (Priority: P1)

- [ ] T016 [P] [US3] Implement pending reservation listing for admin
- [ ] T017 [US3] Implement approve/reject reservation endpoint
- [ ] T018 [US3] Validate 403 on unauthorized admin access
- [ ] T019 [US3] Map business status changes into UI-safe payloads

## Phase 6: User Story 4 - Superadmin oversight and role management (Priority: P1)

- [ ] T020 [P] [US4] Implement superadmin summary dashboard endpoint
- [ ] T021 [US4] Implement user-role list and change endpoint
- [ ] T022 [US4] Guard role reassignment so only superadmin can execute it
- [ ] T023 [US4] Record and return the change as an auditable event

## Phase 7: User Story 5 - Notifications and event payloads (Priority: P2)

- [ ] T024 [P] [US5] Implement notification payload endpoint or event projection
- [ ] T025 [US5] Handle status-change responses for student and admin users
- [ ] T026 [US5] Add fallback and error messaging for downstream notification failures

## Phase 8: Final validation

- [ ] T027 [P] Contract tests for all user-facing endpoints
- [ ] T028 Integration tests for role gating and downstream failure cases
- [ ] T029 Final documentation and quickstart validation

## Tareas de contratos & clarificaciones (nuevas - Session 2026-11-05)

- [ ] T036 Implementar contrato downstream services: Booking Service (POST/GET/PATCH /bookings, error handling, fallback).
- [ ] T037 Implementar contrato downstream services: User Service (GET /users, PATCH /users/{id}/role, deactivate).
- [ ] T038 Implementar contrato downstream services: Notification Service (POST /notifications/email async, retry logic).
- [ ] T039 Implementar respuestas de error estandarizadas (códigos agnósticos: ERR_BOOKING_CONFLICT, ERR_INVALID_ROLE, etc.) y mapeo a status HTTP 400/401/403/404/409/503.
- [ ] T040 Implementar matriz de permisos (Rol × Acción × Recurso) y guardsde autorización por endpoint.
- [ ] T041 Implementar auditoría inmutable (append-only audit_events table con id, timestamp, actor_id, accion, tipo_recurso, id_recurso, valor_anterior, valor_nuevo, razon, escuela_id, ip_address, request_id).
- [ ] T042 Implementar paginación cursor-based (GET /bookings?cursor=&limit=20) con encoding base64 de booking_id.
- [ ] T043 Implementar mapeo de estados (backend → UI: pendiente, confirmado, completado, cancelado, rechazado) con validación de transiciones permitidas.

## Tareas globales obligatorias (complementarias)

- [ ] T044 Agregar endpoints superadmin para reasignación de rol y desactivación de usuarios.
- [ ] T045 Incorporar flujo `usuario` como rol inicial no privilegiado.
- [ ] T046 Implementar endpoint de asistencia admin (asistió/no asistió/justificó ausencia).
- [ ] T047 Enforzar límite de anulación hasta 1 hora antes al orquestar cancelación.
- [ ] T048 Agregar vista/endpoint agregado para total asistencias por alumno para superadmin.
- [ ] T049 Integrar disparo de notificación por correo ante cambio de estado de reserva.
- [ ] T050 [FR-011] Implementar validación de available_classes en BFF: endpoint GET /alumnos/{id} consulta cuota; si available_classes = 0, rechaza reserva con error ERR_NO_CLASSES_AVAILABLE.
- [ ] T051 Agregar endpoint superadmin para editar available_classes de alumno (PATCH /alumnos/{id}/available-classes).

## Clarifications Integration Notes (Session 2026-11-05)

Esta sección documenta cómo cada clarificación se mapeó a tasks específicas:

### Q1: Downstream Service Contracts
- **Pregunta**: ¿Cuáles son los endpoints específicos, métodos HTTP, esquemas y códigos de error de los microservicios descendentes?
- **Respuesta**: Crear documento "Downstream Service Contracts" con especificación detallada.
- **Tasks creadas**: T036 (Booking Service), T037 (User Service), T038 (Notification Service)
- **Documentación**: `contracts/downstream-services.md` (12.3 KB)
- **Requisitos afectados**: FR-004 (orquestación de llamadas), FR-009 (trazabilidad)

### Q2: Error Response Mapping
- **Pregunta**: ¿El BFF devuelve códigos agnósticos (ERR_BOOKING_CONFLICT) o mensajes localizados?
- **Respuesta**: Códigos agnósticos (Option A); frontend traduce a idioma del usuario.
- **Tasks creadas**: T039 (implementar códigos de error estandarizados)
- **Documentación**: `contracts/error-responses.md` (9.6 KB)
- **Requisitos afectados**: FR-005 (errores estandarizados), SC-003 (respuestas claras y consistentes)

### Q3: Permission Model (Rol × Acción × Recurso)
- **Pregunta**: ¿Cuál es la matriz exacta de permisos para cada rol?
- **Respuesta**: Matriz explícita: usuario (sin permisos), alumno (propio), admin (scope), superadmin (todos)
- **Tasks creadas**: T040 (guardsde autorización)
- **Documentación**: `contracts/permissions.md` (13 KB)
- **Requisitos afectados**: FR-002 (validación de sesión/rol), FR-003 (distinción de permisos), FR-006-010

### Q4: Audit Trail & Event Schema
- **Pregunta**: ¿Qué eventos se auditan y cuál es el esquema exacto?
- **Respuesta**: Auditar todas las transiciones de estado (bookings, roles, asistencia); esquema inmutable append-only.
- **Tasks creadas**: T041 (implementar tabla audit_events inmutable)
- **Documentación**: `contracts/audit-events.md` (14.8 KB)
- **Requisitos afectados**: FR-009 (trazabilidad), Principio V (observabilidad)

### Q5: Booking History Pagination
- **Pregunta**: ¿Estrategia de paginación: limit/offset, cursor o keyset?
- **Respuesta**: Cursor-based (Option A) para evitar offset drift en datasets grandes.
- **Tasks creadas**: T042 (paginación cursor-based con encoding base64)
- **Documentación**: `contracts/downstream-services.md` (sección 1.3 List Bookings)
- **Requisitos afectados**: FR-015 (historial de reservas), SC-004 (performance)

### Status Mapping (Adicional)
- **Documentación**: `contracts/status-mapping.md` (14.1 KB)
- **Tasks creadas**: T043 (mapeo de estados backend → UI y validación de transiciones)
- **Requisitos afectados**: FR-001 (contrato uniforme), FR-008 (traducción de contratos)

---

## Coverage Summary (Post-Clarifications)

| Área | Antes | Después | Estado |
|------|-------|---------|--------|
| Functional Requirements | 10/10 | 10/10 | ✓ Cubierto |
| Success Criteria | 5/5 | 5/5 | ✓ Cubierto |
| Downstream Contracts | Ambiguo | Especificado | ✓ Resuelto (T036-T038) |
| Error Handling | Vago | Estandarizado | ✓ Resuelto (T039) |
| Permissions | Parcial | Matriz completa | ✓ Resuelto (T040) |
| Audit Trail | Vago | Esquema inmutable | ✓ Resuelto (T041) |
| Pagination | Indefinido | Cursor-based | ✓ Resuelto (T042) |
| Status Mapping | Implícito | Explícito | ✓ Resuelto (T043) |
| Global Rules | 6 reglas | 6 reglas + matriz | ✓ Actualizado |

**Cobertura estimada**: 75% (antes) → 95%+ (después)
