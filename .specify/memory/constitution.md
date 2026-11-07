# Constitución del BFF MovPrimate

## Principios fundamentales

### I. Orquestación segura y centrada en roles
El BFF debe coordinar las solicitudes del cliente con la lógica de negocio, validando autenticación, autorización por rol y contexto antes de invocar servicios downstream. Debe distinguir claramente alumno, administrador/profesor y superadmin.

### II. Contrato único de cliente
El frontend debe consumir un conjunto claro de endpoints y respuestas del BFF, evitando que la experiencia dependa de detalles internos de cada microservicio. El BFF debe exponer un contrato estable para landing page, autenticación, reservas y validación.

### III. Integración disciplinada
El BFF actúa como capa de composición y adaptación. No debe duplicar reglas de negocio que pertenezcan a otros servicios, pero sí debe asegurar validación, normalización y derivación de respuestas útiles para el cliente.

### IV. Respuestas consistentes y útiles
Cada endpoint debe devolver estructuras claras, mensajes consistentes y códigos de error reproducibles para evitar ambigüedad en la UX y en el diagnóstico técnico. Debe reflejar el resultado de la operación y los permisos del usuario autenticado.

### V. Observabilidad y trazabilidad
Las llamadas al BFF deben dejar evidencia de origen, flujo, errores, roles y tiempos de respuesta para facilitar depuración, soporte y monitoreo.

## Restricciones del producto

- Stack backend: NestJS 12 + TypeScript
- Debe apoyar Angular 21 en la capa de cliente
- Debe centralizar lógica de composición y seguridad de acceso
- Debe conectarse con API y microservicios del dominio
- Debe funcionar localmente con MongoDB y Docker
- Debe estar listo para despliegue en AWS
- Debe exponer flujos para alumno, profesor/admin y superadmin

## Flujo de trabajo de desarrollo

- Toda nueva ruta del BFF debe definirse con contrato, flujo de validación y escenario de uso.
- Los cambios de respuesta o estructura deben ser revisados antes de publicarse.
- Las reglas de seguridad no pueden ser relajadas en favor de velocidad.
- El BFF debe cumplir con el flujo de Spec Kit del proyecto y mantener documentación de decisiones técnicas.
- Las decisiones que afecten contratos, roles o permisos deben revisarse explícitamente antes de fusionarse.

## Gobernanza

El BFF MovPrimate debe preservar la claridad de integración, la seguridad del acceso y la consistencia funcional entre la app y los servicios del dominio. Cualquier cambio en la composición, el contrato o la autorización debe ser revisado antes de fusionarse.

**Versión**: 1.0.1 | **Ratificada**: 2026-11-04 | **Última modificación**: 2026-11-04