# 🌐 Guía de diagnóstico de conexiones

> Si una conexión falla, revisa primero la red, el firewall y el estado del nodo Edge.

## 🔍 Diagnóstico rápido

### El nodo Edge no se conecta
- **Síntoma**: la consola muestra `Edge Offline` o `Connection Failed`.
- **Causas posibles**:
  - Edge no está iniciado o se ha detenido de forma inesperada.
  - Se ha perdido la conexión de red.
  - El firewall bloquea un puerto necesario.
  - La resolución DNS falla.

### La conexión es inestable
- **Síntoma**: la conexión se corta intermitentemente y la latencia es alta.
- **Causas posibles**:
  - Ancho de banda insuficiente.
  - CPU o memoria insuficientes en Edge.
  - Modo de transporte inadecuado (P2P frente a Relay).
  - NAT de red complejo.

## 🛠️ Pasos de revisión

### Paso 1: comprueba el estado de Edge
```bash
# Comprobar el proceso de Edge
ps aux | grep edge

# Comprobar el puerto en escucha
lsof -i :8080  # sustituye 8080 por tu puerto configurado

# Ver los registros
tail -f /path/to/edge/logs/app.log
```

### Paso 2: prueba la conectividad
```bash
# Probar el acceso a Edge
ping your-edge-domain.com

# Probar el puerto
telnet your-edge-domain.com 8080
# Alternativa con nc
nc -zv your-edge-domain.com 8080
```

### Paso 3: revisa el firewall
- Abre en el firewall los puertos usados por Edge.
- Comprueba el grupo de seguridad del proveedor de nube.
- Revisa las reglas locales del firewall.

## 📊 Métricas de conexión

YAT muestra estos indicadores:
- **Estado**: `Online`, `Offline` o `Connecting`
- **Latencia**: RTT (Round-Trip Time)
- **Pérdida de paquetes**: porcentaje de paquetes perdidos
- **Ancho de banda**: uso actual

## 🚨 Soluciones frecuentes

### Cambiar el modo de transporte
Si P2P falla, cambia a Relay:
1. En los ajustes del túnel, selecciona `Relay Mode`.
2. Guarda la configuración.
3. Reinicia el túnel.

### Ajustar Edge
```yaml
# config.yaml
performance:
  max_connections: 1000
  bandwidth_limit: 100mbps
  keep_alive: 30s
```

## 📚 Recursos relacionados
- [Gestión de Edge](./edge/management.md)
- [Modos de transporte](./transport-modes.md)
- [Gestión de túneles](./tunnel-management.md)

---
*Última actualización del documento: 2026-05-04*
