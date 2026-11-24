# Gestión del servidor Edge

> Edge es el nodo público que recibe tráfico, lo reenvía al cliente autenticado y notifica su estado a Captain.

## Componentes

| Componente | Función |
|-----------|---------|
| Listener HTTP/HTTPS | Termina TLS y enruta por dominio |
| Listener TCP/UDP | Expone puertos para túneles TCP/UDP |
| WireGuard | Gestiona interfaces y reenvío de LAN virtual |
| Tunnel agent | Mantiene el canal con el cliente |
| State reporter | Envía estado y métricas a Captain |

## Ciclo de vida

1. **Registro**: el servidor obtiene identidad y certificados.
2. **Conexión**: establece el canal con Captain.
3. **Sincronización**: recibe configuración de túneles y dominios.
4. **Servicio**: escucha los puertos configurados.
5. **Informe**: notifica salud, tráfico y estado de certificados.

## Estado del nodo

| Estado | Interpretación |
|--------|----------------|
| Online | Registrado y sincronizado |
| Offline | No hay conexión con Captain |
| Degraded | Servicio parcial, por ejemplo DNS o certificado en error |

## Operación diaria

```bash
# Estado
./edge server status

# Reiniciar
./edge server restart --config config.yaml

# Ver túneles
./edge tunnel list
```

Si usas systemd:

```bash
sudo systemctl status yat-edge
sudo journalctl -u yat-edge -f
```

## Dominios y salud

La consola muestra:

- CNAME esperado
- Estado de verificación DNS
- Estado del certificado HTTPS
- Latencia y disponibilidad

Si el dominio falla, consulta [Diagnóstico de DNS](../dns-troubleshooting.md) y [Gestión de certificados](../certificate-management.md).

## Límites

Los límites dependen del plan y del hardware. Los valores habituales que hay que vigilar son:

- Número máximo de túneles
- Puertos TCP/UDP disponibles
- Ancho de banda
- Conexiones simultáneas
- Interfaces WireGuard

## Recomendaciones

- Usa systemd para reinicios automáticos.
- Aísla el proceso con un usuario dedicado.
- Guarda `config.yaml` con permisos restrictivos.
- Monitoriza CPU, memoria y ancho de banda.
- Mantén el sistema operativo actualizado.

## Recursos relacionados

- [Desplegar Edge](./deploy.md)
- [Parámetros de arranque](./startup-params.md)
- [Referencia de configuración](./config-reference.md)
- [FAQ de Edge](./faq.md)

---
*YAT Team*
