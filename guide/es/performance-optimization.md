# ⚡ Guía de optimización del rendimiento

> Ajusta el número de canales y el límite de ancho de banda según el uso real, y vigila CPU, memoria y red para detectar cuellos de botella a tiempo.

## 📊 Métricas importantes

### Indicadores clave
- **Uso de CPU**: porcentaje ocupado en el nodo Edge.
- **Uso de memoria**: porcentaje ocupado en el nodo Edge.
- **Ancho de banda**: subida y descarga en tiempo real.
- **Conexiones**: conexiones activas en ese momento.
- **Latencia**: tiempo de ida y vuelta (RTT) de extremo a extremo.

### Herramientas
- Panel de monitorización de la consola de YAT
- `top` / `htop` para procesos
- `iftop` para tráfico de red
- `iostat` para E/S de disco

## 🛠️ Estrategias de optimización

### 1. Nodos Edge

#### Configuración
```yaml
# config.yaml
performance:
  max_connections: 1000          # máximo de conexiones
  bandwidth_limit: 100mbps       # límite de ancho de banda
  keep_alive: 30s                # intervalo de keep-alive
  worker_threads: 4              # hilos de trabajo
```

#### Hardware
- **CPU**: 2 núcleos como mínimo; 4 o más para alta concurrencia.
- **Memoria**: 2 GB como mínimo; añade 512 MB por cada 100 conexiones concurrentes.
- **Disco**: SSD para que la escritura de registros no frene el servicio.
- **Red**: interfaz de 1 Gbps y suficiente ancho de banda de subida.

### 2. Tuneles

#### Elección del modo de transporte
| Escenario | Modo recomendado | Motivo |
|-----------|------------------|--------|
| Red local | P2P Direct | Menor latencia y mejor rendimiento |
| Red móvil | Relay Mode | Más estable y compatible |
| NAT complejo | Relay Mode | La probabilidad de éxito de P2P baja |
| Requisitos altos de seguridad | Relay Mode | El tráfico pasa por el nodo Edge |

#### Canales
- **Cantidad**: define solo los necesarios; los canales sin uso consumen recursos.
- **Ancho de banda**: da prioridad a los servicios críticos.
- **Tiempos de espera**: usa valores realistas para liberar conexiones inactivas.

## 🚨 Diagnóstico

### CPU elevada
- **Causas posibles**:
  - Demasiadas conexiones
  - Cifrado intensivo
  - Nivel de registro demasiado detallado
- **Soluciones**:
  - Limita las conexiones máximas
  - Amplía el hardware
  - Cambia el registro a `WARN` o `ERROR`

### Memoria elevada
- **Causas posibles**:
  - Caché excesiva
  - Conexiones que no se liberan
  - Transferencias de archivos grandes
- **Soluciones**:
  - Ajusta la caché
  - Revisa la gestión de conexiones
  - Usa transmisión en streaming para archivos grandes

## 📚 Recursos relacionados
- [Gestión de Edge](./edge/management.md)
- [Modos de transporte](./transport-modes.md)
- [Gestión de túneles](./tunnel-management.md)
- [Preguntas frecuentes sobre rendimiento](./faq.md#q-performance-issues)

---
*Última actualización del documento: 2026-05-04*
