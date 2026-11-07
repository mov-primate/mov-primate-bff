# Implementation Plan: Capa BFF para MovPrimate

**Branch**: `001-mov-primate-bff` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-mov-primate-bff/spec.md`

## Summary

La capa BFF de MovPrimate tiene la responsabilidad de orquestar autenticación, disponibilidad, reservas y permisos para que el frontend Angular consuma un contrato estable sin conocer detalles de implementación de los microservicios. La capa debe distinguir claramente entre alumno, administrador/profesor y superadmin, y debe aceptar que el usuario nuevo por defecto sea alumno, con la posibilidad de promotion por parte del superadmin cuando el negocio lo requiera.

## Technical Context

**Language/Version**: TypeScript, NestJS 12

**Primary Dependencies**: NestJS 12, TypeScript, HTTP client integrations, JWT/session validation, downstream API and microservice contracts

**Storage**: No primary business persistence; orchestrates downstream services and MongoDB-backed domains

**Testing**: Unit tests, contract tests, integration tests for failing downstream calls and permission scenarios

**Target Platform**: Web API / BFF layer, deployed behind Angular frontend and running in Docker Compose locally

**Project Type**: Backend API / orchestration layer

**Performance Goals**: Fast aggregation of frontend responses with clear status codes and minimal over-fetching

**Constraints**:
- BFF must not own domain logic
- Frontend contract must be stable and normalized
- Every sensitive action must validate token/session and role
- Conflicts, duplicates and permission errors must be returned in a standard shape
- No direct dependence on external messaging for operational flow

**Scale/Scope**:
- Landing page data composition
- Auth and role-aware sessions
- Availability lookup and booking orchestration
- Admin validation and superadmin oversight
- Notification event composition and error translation

## Constitution Check

*GATE: Must pass before implementation begins.*

- Frontend contract is stable and explicit: PASS
- BFF acts as orchestration layer, not business logic owner: PASS
- Role-based access is enforced before sensitive actions: PASS
- Student role is default while superadmin can reassign roles: PASS
- Errors are normalized across downstream services: PASS
- No constitutional violations identified

## Project Structure

### Documentation (this feature)

```text
specs/001-mov-primate-bff/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
├── auth/
├── booking/
├── contracts/
├── orchestration/
├── permissions/
├── shared/
├── users/
└── utils/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: The BFF will expose a stable front-end contract while consolidating orchestration logic for auth, roles, booking, and validation. Domain rules remain in downstream services and API modules.

## Complexity Tracking

No constitutional violations were identified, so no complexity exceptions are required.

## Addendum de alcance obligatorio

- Incorporar `usuario` como cuarto rol.
- Exponer endpoints BFF de superadmin para cambio de rol y desactivación de usuario.
- Exponer acciones admin sobre sus reservas asignadas: confirmar/cancelar/pendiente/rechazar.
- Exponer registro de asistencia (asistió/no asistió/justificó ausencia).
- Orquestar perfil con contador e historial de reservas.
- Enforzar cancelación máxima hasta 1 hora antes y cupo máximo 4 por clase.
- Emitir/propagar confirmación por correo por estado de reserva.
