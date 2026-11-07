# Requirements Quality Checklist: Capa BFF para MovPrimate

**Purpose**: Validar que la capa BFF mantenga un contrato estable, seguro y consistente para Angular y los servicios downstream.
**Created**: 2026-11-04
**Feature**: [spec.md](./spec.md)

**Review Ownership**: Este checklist valida la calidad del requisito antes de la implementación.

## Contratos y experiencia frontend

- [ ] CHK001 El BFF expone un contrato uniforme para landing page, autenticación, disponibilidad y reservas.
- [ ] CHK002 El frontend recibe respuestas estandarizadas con errores claros y estados de negocio coherentes.
- [ ] CHK003 La capa mantiene los detalles internos de microservicios ocultos para la UI Angular.
- [ ] CHK004 La reserva de 1 hora se expone con una respuesta consistente desde la experiencia del alumno.

## Seguridad y permisos

- [ ] CHK005 El BFF valida sesión, token y rol antes de ejecutar acciones sensibles.
- [ ] CHK006 El alumno, el administrador/profesor y el superadmin tienen permisos diferenciados y explícitos.
- [ ] CHK007 El usuario nuevo se registra como alumno por defecto, pero el superadmin puede asignar roles cuando sea necesario.
- [ ] CHK008 Las acciones de validación y supervisión requieren 403 o equivalente cuando el usuario carece de permisos.

## Integración y errores de negocio

- [ ] CHK009 El BFF traduce errores de servicios downstream sin filtrar detalles internos.
- [ ] CHK010 La respuesta de conflicto y duplicado para horario es consistente y entendible para la UI.
- [ ] CHK011 El BFF expone trazabilidad y mensajes comunes para validación, permisos y errores de negocio.

## Operabilidad

- [ ] CHK012 La capa BFF puede orquestar los servicios del dominio sin mezclar responsabilidades de negocio.
- [ ] CHK013 El flujo principal funciona sin depender de WhatsApp ni coordinación externa.
- [ ] CHK014 La solución es compatible con Docker Compose y con el despliegue objetivo en AWS.

## Notes

- Solo marcar `[x]` cuando el criterio de calidad quede revisado y validado.
- Dejar sin marcar si aún requiere aclaración o ajuste de diseño.

## Reglas globales a verificar

- [ ] CHK015 Se soportan 4 roles contractuales: superadmin, admin, alumno, usuario.
- [ ] CHK016 Superadmin puede cambiar rol y desactivar usuarios vía BFF.
- [ ] CHK017 Admin solo modifica reservas asignadas a su profesorId.
- [ ] CHK018 Estados de reserva admitidos: confirmado, cancelado, pendiente, rechazado.
- [ ] CHK019 BFF aplica/propaga regla de cupo máximo 4 y bloqueo por cupo lleno.
- [ ] CHK020 BFF aplica/propaga regla de anulación hasta 1 hora antes.
- [ ] CHK021 BFF soporta registro de asistencia (asistió/no asistió/justificó ausencia).
- [ ] CHK022 BFF expone datos para panel superadmin de total asistencias por alumno.
- [ ] CHK023 BFF propaga evento/comando de correo de confirmación según estado.
