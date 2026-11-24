# Multidispositivo y roles

> YAT permite usar varios dispositivos en la misma cuenta y compartir recursos con permisos distintos.

## Dispositivos

Cada instalación del cliente se registra como un dispositivo. La consola muestra su nombre, estado, rol y recursos asociados.

### Buenas prácticas
- Usa nombres identificables.
- Elimina dispositivos que ya no uses.
- No compartas secretos de registro entre instalaciones.

## Roles

| Rol | Permisos |
|-----|----------|
| Owner | Control total de la cuenta y sus recursos |
| Admin | Gestiona Edge y túneles, pero no propiedades de cuenta |
| Operator | Inicia y detiene túneles autorizados |
| Viewer | Consulta estado y estadísticas |

Los permisos exactos dependen del recurso y del plan, pero el principio es el mismo: lectura, operación y administración separadas.

## Compartir un túnel

1. Abre los detalles del túnel.
2. Entra en la sección de colaboración.
3. Añade un dispositivo o usuario.
4. Asigna el rol mínimo necesario.
5. Guarda y reinicia el túnel si cambia el permiso de ejecución.

## Compartir un Edge

Un Edge propio puede compartirse con otros dispositivos o usuarios. El propietario conserva la gestión del servidor; los suscriptores solo pueden usarlo como punto de entrada.

1. Abre **Edges**.
2. Selecciona el Edge.
3. Añade los destinatarios.
4. Define si pueden suscribirse o solo verlo.
5. Guarda los permisos.

## Escenarios

### Equipo pequeño
El propietario administra Edge y túneles; otros miembros operan túneles con rol `Operator`.

### Proyecto temporal
Comparte solo el túnel necesario y revoca el acceso al terminar.

### Varios equipos propios
Usa un Edge por entorno y evita compartir credenciales locales entre equipos.

## Seguridad

- Asigna `Viewer` cuando solo se necesita observabilidad.
- Usa `Operator` para turnos y mantenimiento.
- Revisa permisos después de cambiar de dispositivo.
- Elimina accesos caducados.

## Recursos relacionados

- [Cuenta y ajustes](./account-settings.md)
- [Gestión de túneles](./tunnel-management.md)
- [Gestión de Edge](./edge/management.md)

---
*Última actualización del documento: 2026-05-04*
