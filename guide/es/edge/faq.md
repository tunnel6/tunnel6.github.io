# Preguntas frecuentes de Edge

## Estado

### ¿Qué hago si Edge aparece Offline?

```bash
# Proceso
ps aux | grep edge

# Puerto
lsof -i :443

# Registro
journalctl -u yat-edge -f

# Reinicio
sudo systemctl restart yat-edge
```

Si el proceso está activo pero el nodo sigue Offline, comprueba la salida DNS y la conectividad con Captain.

### ¿Edge puede cambiar de IP?
Sí, si el dominio sigue apuntando al nuevo valor y el servidor se reinicia. Para WireGuard, evita cambiar la dirección pública mientras haya redes activas.

## Registros

### ¿Dónde están los registros?

Con systemd:

```bash
journalctl -u yat-edge -f
```

Si ejecutas Edge en primer plano, los registros se muestran en la terminal o en el archivo configurado en `log.file`.

## Implementación

### ¿Cuántos Edge puede tener una cuenta?
Depende del plan. En la consola se muestra el límite actual antes de crear un nodo.

### ¿Qué sistemas operativos soporta?
Linux x86_64 y ARM64 en versiones modernas. Docker también funciona si configuras correctamente la red y los puertos.

## Rendimiento

### ¿Qué hardware necesito?
- Pruebas: 1 vCPU y 1 GB
- Uso personal: 2 vCPU y 2 GB
- Producción: 4 vCPU, 4 GB o más, SSD y suficiente ancho de banda

## Recursos relacionados

- [Gestión de Edge](./management.md)
- [Desplegar Edge](./deploy.md)
- [Diagnóstico de conexiones](../connection-troubleshooting.md)

---
*YAT Team*
