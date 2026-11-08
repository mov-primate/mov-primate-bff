# Tasks: Capa BFF para MovPrimate

**Input**: Design documents from `/specs/001-mov-primate-bff/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks grouped by endpoint and user scope.

## Phase 1: Setup

- [x] T001 Initialize NestJS app and project structure
- [x] T002 Configure environment variables and base app modules
- [x] T003 [P] Set up shared DTOs, validation, and error payloads
- [x] T004 [P] Configure auth middleware and session/role extraction

## Phase 2: Foundational

- [x] T005 Implement generic response and error normalization
- [x] T006 Implement role guard and permission map for student/admin/superadmin
- [x] T007 Create HTTP client services for API/microservices
- [x] T008 Create orchestration layer for landing, auth, booking and admin endpoints

## Phase 3: User Story 1 - Landing and auth (Priority: P1)

- [x] T009 [P] [US1] Implement public landing data endpoint
- [x] T010 [US1] Implement auth/session validation endpoint
- [x] T011 [US1] Implement role-aware session response for UI

## Phase 4: User Story 2 - Student booking flow (Priority: P1)

- [x] T012 [P] [US2] Implement slot query endpoint
- [x] T013 [US2] [FR-011] Implement booking creation endpoint with available_classes validation: query alumno service, reject if available_classes = 0 with ERR_NO_CLASSES_AVAILABLE
- [x] T014 [US2] Handle duplicate and conflict errors from downstream services
- [x] T015 [US2] Implement student booking history endpoint

## Phase 5: User Story 3 - Admin approval/rejection (Priority: P1)

- [x] T016 [P] [US3] Implement pending reservation listing for admin
- [x] T017 [US3] Implement approve/reject reservation endpoint
- [x] T018 [US3] Validate 403 on unauthorized admin access
- [x] T019 [US3] Map business status changes into UI-safe payloads

## Phase 6: User Story 4 - Superadmin oversight and role management (Priority: P1)

- [x] T020 [P] [US4] Implement superadmin summary dashboard endpoint
- [x] T021 [US4] Implement user-role list and change endpoint
- [x] T022 [US4] Guard role reassignment so only superadmin can execute it
- [x] T023 [US4] Record and return the change as an auditable event

## Phase 7: User Story 5 - Notifications and event payloads (Priority: P2)

- [x] T024 [P] [US5] Implement notification payload endpoint or event projection
- [x] T025 [US5] Handle status-change responses for student and admin users
- [x] T026 [US5] Add fallback and error messaging for downstream notification failures

## Phase 8: Final validation

- [x] T027 [P] Contract tests for all user-facing endpoints
- [x] T028 Integration tests for role gating and downstream failure cases
- [x] T029 Final documentation and quickstart validation

## Tareas de contratos & clarificaciones (nuevas - Session 2026-11-05)

- [x] T036 Implementar contrato downstream services: Booking Service (POST/GET/PATCH /bookings, error handling, fallback).
- [x] T037 Implementar contrato downstream services: User Service (GET /users, PATCH /users/{id}/role, deactivate).
- [x] T038 Implementar contrato downstream services: Notification Service (POST /notifications/email async, retry logic).
- [x] T039 Implementar respuestas de error estandarizadas (cÃ³digos agnÃ³sticos: ERR_BOOKING_CONFLICT, ERR_INVALID_ROLE, etc.) y mapeo a status HTTP 400/401/403/404/409/503.
- [x] T040 Implementar matriz de permisos (Rol Ã— AcciÃ³n Ã— Recurso) y guardsde autorizaciÃ³n por endpoint.
- [x] T041 Implementar auditorÃ­a inmutable (append-only audit_events table con id, timestamp, actor_id, accion, tipo_recurso, id_recurso, valor_anterior, valor_nuevo, razon, escuela_id, ip_address, request_id).
- [x] T042 Implementar paginaciÃ³n cursor-based (GET /bookings?cursor=&limit=20) con encoding base64 de booking_id.
- [x] T043 Implementar mapeo de estados (backend â†’ UI: pendiente, confirmado, completado, cancelado, rechazado) con validaciÃ³n de transiciones permitidas.

## Tareas globales obligatorias (complementarias)

- [x] T044 Agregar endpoints superadmin para reasignaciÃ³n de rol y desactivaciÃ³n de usuarios.
- [x] T045 Incorporar flujo `usuario` como rol inicial no privilegiado.
- [x] T046 Implementar endpoint de asistencia admin (asistiÃ³/no asistiÃ³/justificÃ³ ausencia).
- [x] T047 Enforzar lÃ­mite de anulaciÃ³n hasta 1 hora antes al orquestar cancelaciÃ³n.
- [x] T048 Agregar vista/endpoint agregado para total asistencias por alumno para superadmin.
- [x] T049 Integrar disparo de notificaciÃ³n por correo ante cambio de estado de reserva.
- [x] T050 [FR-011] Implementar validaciÃ³n de available_classes en BFF: endpoint GET /alumnos/{id} consulta cuota; si available_classes = 0, rechaza reserva con error ERR_NO_CLASSES_AVAILABLE.
- [x] T051 Agregar endpoint superadmin para editar available_classes de alumno (PATCH /alumnos/{id}/available-classes).

## Clarifications Integration Notes (Session 2026-11-05)

Esta secciÃ³n documenta cÃ³mo cada clarificaciÃ³n se mapeÃ³ a tasks especÃ­ficas:

### Q1: Downstream Service Contracts
- **Pregunta**: Â¿CuÃ¡les son los endpoints especÃ­ficos, mÃ©todos HTTP, esquemas y cÃ³digos de error de los microservicios descendentes?
- **Respuesta**: Crear documento "Downstream Service Contracts" con especificaciÃ³n detallada.
- **Tasks creadas**: T036 (Booking Service), T037 (User Service), T038 (Notification Service)
- **DocumentaciÃ³n**: `contracts/downstream-services.md` (12.3 KB)
- **Requisitos afectados**: FR-004 (orquestaciÃ³n de llamadas), FR-009 (trazabilidad)

### Q2: Error Response Mapping
- **Pregunta**: Â¿El BFF devuelve cÃ³digos agnÃ³sticos (ERR_BOOKING_CONFLICT) o mensajes localizados?
- **Respuesta**: CÃ³digos agnÃ³sticos (Option A); frontend traduce a idioma del usuario.
- **Tasks creadas**: T039 (implementar cÃ³digos de error estandarizados)
- **DocumentaciÃ³n**: `contracts/error-responses.md` (9.6 KB)
- **Requisitos afectados**: FR-005 (errores estandarizados), SC-003 (respuestas claras y consistentes)

### Q3: Permission Model (Rol Ã— AcciÃ³n Ã— Recurso)
- **Pregunta**: Â¿CuÃ¡l es la matriz exacta de permisos para cada rol?
- **Respuesta**: Matriz explÃ­cita: usuario (sin permisos), alumno (propio), admin (scope), superadmin (todos)
- **Tasks creadas**: T040 (guardsde autorizaciÃ³n)
- **DocumentaciÃ³n**: `contracts/permissions.md` (13 KB)
- **Requisitos afectados**: FR-002 (validaciÃ³n de sesiÃ³n/rol), FR-003 (distinciÃ³n de permisos), FR-006-010

### Q4: Audit Trail & Event Schema
- **Pregunta**: Â¿QuÃ© eventos se auditan y cuÃ¡l es el esquema exacto?
- **Respuesta**: Auditar todas las transiciones de estado (bookings, roles, asistencia); esquema inmutable append-only.
- **Tasks creadas**: T041 (implementar tabla audit_events inmutable)
- **DocumentaciÃ³n**: `contracts/audit-events.md` (14.8 KB)
- **Requisitos afectados**: FR-009 (trazabilidad), Principio V (observabilidad)

### Q5: Booking History Pagination
- **Pregunta**: Â¿Estrategia de paginaciÃ³n: limit/offset, cursor o keyset?
- **Respuesta**: Cursor-based (Option A) para evitar offset drift en datasets grandes.
- **Tasks creadas**: T042 (paginaciÃ³n cursor-based con encoding base64)
- **DocumentaciÃ³n**: `contracts/downstream-services.md` (secciÃ³n 1.3 List Bookings)
- **Requisitos afectados**: FR-015 (historial de reservas), SC-004 (performance)

### Status Mapping (Adicional)
- **DocumentaciÃ³n**: `contracts/status-mapping.md` (14.1 KB)
- **Tasks creadas**: T043 (mapeo de estados backend â†’ UI y validaciÃ³n de transiciones)
- **Requisitos afectados**: FR-001 (contrato uniforme), FR-008 (traducciÃ³n de contratos)

---

## Coverage Summary (Post-Clarifications)

| Ãrea | Antes | DespuÃ©s | Estado |
|------|-------|---------|--------|
| Functional Requirements | 10/10 | 10/10 | âœ“ Cubierto |
| Success Criteria | 5/5 | 5/5 | âœ“ Cubierto |
| Downstream Contracts | Ambiguo | Especificado | âœ“ Resuelto (T036-T038) |
| Error Handling | Vago | Estandarizado | âœ“ Resuelto (T039) |
| Permissions | Parcial | Matriz completa | âœ“ Resuelto (T040) |
| Audit Trail | Vago | Esquema inmutable | âœ“ Resuelto (T041) |
| Pagination | Indefinido | Cursor-based | âœ“ Resuelto (T042) |
| Status Mapping | ImplÃ­cito | ExplÃ­cito | âœ“ Resuelto (T043) |
| Global Rules | 6 reglas | 6 reglas + matriz | âœ“ Actualizado |

**Cobertura estimada**: 75% (antes) â†’ 95%+ (despuÃ©s)

