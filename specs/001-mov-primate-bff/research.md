# Research: Capa BFF para MovPrimate

## Decisiones clave

1. El BFF orquesta, no implementa reglas de dominio.
2. Todas las rutas sensibles validan rol (alumno/admin/superadmin).
3. Los errores de agenda, perfiles y auth se normalizan en un payload único.
4. El cambio de rol solo se expone a superadmin y se delega al servicio de alumnos/API.

## Riesgos y mitigaciones

- Riesgo: inconsistencias de errores entre microservicios.
  - Mitigación: capa de mapeo de errores por código funcional.
- Riesgo: filtrado de datos no autorizados.
  - Mitigación: DTO por rol y guards por endpoint.

## Resultado

Se implementará un contrato estable para Angular con controles estrictos de permisos y trazabilidad.

## Reglas globales incorporadas

- RBAC con 4 roles: superadmin, admin, alumno, usuario.
- Superadmin: role-change + deactivate-user + control global de reservas.
- Admin: operaciones solo sobre reservas asignadas; estados + asistencia.
- Alumno: reserva 1h con profesor obligatorio, sin duplicados/solapes.
