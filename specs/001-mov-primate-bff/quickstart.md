# Quickstart: Capa BFF para MovPrimate

## 1) Ejecutar servicio

1. Configurar variables de entorno del BFF.
2. Levantar stack con Docker Compose.
3. Verificar salud del BFF en endpoint de health.

## 2) Validar flujo principal

1. Alumno autenticado consulta slots.
2. Alumno crea reserva de 1 hora.
3. Admin aprueba/rechaza reserva.
4. Superadmin lista usuarios y ejecuta cambio de rol alumno -> profesor/admin.

## 3) Validar seguridad

- Intentar cambio de rol con usuario no superadmin y confirmar denegación.
- Confirmar trazabilidad de cada cambio de rol.
- Confirmar que admin no modifica reservas de otro profesor.
- Confirmar cancelación denegada dentro de la última hora.
- Confirmar operación de asistencia y notificación por correo en cambios de estado.
