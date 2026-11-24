# Preguntas frecuentes

## Primeros pasos

### No puedo iniciar sesión
Comprueba la conexión, la hora del sistema y que el navegador puede abrir GitHub o Google. Si la ventana no vuelve al cliente, copia el enlace de autenticación manualmente.

### No hay Edge disponible
Suscríbete a un Edge oficial o compartido. Si usas uno propio, verifica que el proceso está en línea y que el nodo aparece en la consola.

### El túnel no arranca
1. Comprueba que el servicio local responde.
2. Verifica la dirección y el puerto locales.
3. Confirma que el puerto remoto no está ocupado.
4. Revisa el estado del Edge.

## Conexión

### La conexión es inestable
Cambia temporalmente a `Relay Mode`. Si mejora, la red no permite mantener la ruta P2P.

### HTTP devuelve 502
El Edge llega pero el servicio local no responde. Prueba:

```bash
curl -I http://127.0.0.1:3000
```

### TCP rechaza la conexión
Confirma el puerto remoto, el firewall y el listener de Edge.

### UDP pierde paquetes
Mide latencia y pérdida. Si la red es mala, considera TCP o Relay Mode.

## Dominios y certificados

### El CNAME no verifica
Consulta [Diagnóstico de DNS](./dns-troubleshooting.md). Comprueba que no existe un registro A en el mismo nombre y espera la propagación.

### El certificado caduca
YAT renueva automáticamente 30 días antes. Para forzar la renovación:

```bash
./edge certs renew --config config.yaml
```

### Cambio de Edge y el dominio deja de funcionar
Cada CNAME apunta a un Edge concreto. Actualiza el registro al nuevo valor.

## WireGuard

### Los miembros no se ven
1. Confirma que Edge tiene WireGuard habilitado.
2. Comprueba que ambos miembros están en la misma red.
3. Revisa IP forwarding y firewall.

### El ping funciona pero un puerto no responde
El problema no es la ruta WireGuard. Comprueba el listener del servicio y las reglas de firewall del sistema.

### Docker bloquea el reenvío
Revisa la cadena `DOCKER-USER` y la convivencia entre nftables e iptables legacy. Más detalle en [Configuración de Edge WireGuard](./edge/wireguard.md#docker-host-iptables-interference).

## Rendimiento

### CPU alta en Edge
Reduce el número de conexiones, cambia el registro a `WARN` o `ERROR`, y amplía hardware si el tráfico es real.

### Memoria alta
Revisa caché, conexiones inactivas y transferencias grandes. Usa streaming para archivos grandes.

### Latencia alta
Prueba P2P Direct, elige un Edge más cercano y comprueba la calidad de red.

## Cuenta y permisos

### ¿Cómo quito un dispositivo?
Abre la gestión de dispositivos y elimina la instalación que ya no uses.

### ¿Cómo comparto un túnel?
Usa la sección de colaboración y asigna el rol mínimo necesario.

### ¿Puedo usar YAT gratis?
Consulta la página de descarga o el panel de cuenta para los límites vigentes del plan.

## Recursos

- [Guía de inicio rápido](./quick-start.md)
- [Diagnóstico de DNS](./dns-troubleshooting.md)
- [Gestión de certificados](./certificate-management.md)
- [Optimización del rendimiento](./performance-optimization.md)

---
*Última actualización del documento: 2026-05-04*
