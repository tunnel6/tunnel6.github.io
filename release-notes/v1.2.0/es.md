# Notas de versión de YAT Desktop v1.2.0

## Novedades

### Redes privadas WireGuard

Crea y administra redes privadas basadas en WireGuard directamente desde YAT. Conecta varios dispositivos en una red privada con asignación automática de subred y supervisión del estado del enlace.

- **Creación y administración**: elige un Edge coordinador, define una subred como `10.24.0.0/24` y selecciona el modo de retransmisión.
- **Miembros**: consulta dispositivos conectados, añade o elimina miembros, cambia nombres de host y edita IPs asignadas.
- **Diagnóstico**: revisa estado de sesión, tipo de ruta y endpoints observados.
- **Configuración local**: previsualiza el archivo WireGuard antes de aplicarlo al adaptador local.
- **Salud en tiempo real**: la tarjeta de red muestra miembros en línea, enlaces activos y un estado global de salud.

## Correcciones

Se corrigió una advertencia de traducción en el panel del servicio de archivos estáticos cuando se usaba un idioma distinto del chino simplificado, además de mejoras generales de estabilidad y rendimiento.
