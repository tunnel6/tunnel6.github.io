# Notas de versión de YAT v1.3.0

## Destacados

- **Unirse con código de invitación**: nuevo mecanismo de invitación para redes privadas. Puedes unirte con un código sin repetir toda la configuración en cada dispositivo, e importarlo en el daemon de `yat-cli`.
- **Estado del enlace**: la lista de miembros integra salud por niveles y distingue claramente conexión directa, retransmisión y sin conexión.
- **Control de ruta**: permite forzar la ruta entre pares y negociar rutas compartidas, con mensajes de error más claros al cambiar de ruta.
- **Detalles del par**: cuadro de información rediseñado con endpoints observados, estadísticas de handshake y diagnósticos de conexión.
- **Vista de lista de redes**: nueva vista en lista para facilitar la incorporación a redes.

## Mejoras

Monitoreo global del estado de Edge, actualizaciones dirigidas por eventos de salud, prevención de clics accidentales al cambiar ruta, mensajes multilingües y compilación incremental de extensiones.

## Correcciones

Se corrigieron inestabilidad por condiciones de carrera, estados anómalos tras cambiar de cuenta o editar miembros, desconexiones durante selección de relé y varios problemas de compatibilidad entre plataformas.
