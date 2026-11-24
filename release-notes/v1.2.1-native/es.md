# Notas de versión de YAT Desktop v1.2.1-native

## Novedades

Esta versión reemplaza la capa de red basada en Node.js por una implementación nativa en Rust y Go. El resultado es mejor rendimiento, estabilidad y consistencia entre plataformas.

## Arquitectura

- **Agente de red (Rust)**: proceso nativo responsable de la interfaz WireGuard, los túneles P2P y el ciclo de vida de los pares.
- **Helper Daemon**: componente privilegiado en macOS y Windows para crear y eliminar adaptadores.
- **Puente NAPI**: extensión nativa delgada que conecta Electron con el agente mediante IPC.

## Beneficios

- Elimina fugas de sesión y oscilación de pares causadas por errores de temporización asíncrona.
- Acelera los handshakes de WireGuard y el establecimiento de rutas P2P.
- macOS, Windows y Linux comparten la misma lógica de red principal.
- Separa el frontend y la capa de red para facilitar el mantenimiento.
