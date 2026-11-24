# Configuración de Edge WireGuard

> Edge puede crear interfaces WireGuard, asignar direcciones a los miembros y reenviar tráfico entre ellos.

## Requisitos

- Linux con kernel 5.6 o posterior, o WireGuard instalado como módulo/userspace
- IP forwarding activo
- Puerto UDP accesible
- Permisos para crear interfaces y reglas nftables
- `config.yaml` con la sección `wireguard`

## Configuración

```yaml
wireguard:
  enabled: true
  listen_port: 51820
  subnet: 100.64.0.0/16
  mtu: 1420
```

Puedes sobrescribir el puerto con la opción de arranque `--wireguard-listen-port`.

## Firewall

```bash
sudo ufw allow 51820/udp

# Si usas iptables
sudo iptables -A INPUT -p udp --dport 51820 -j ACCEPT
sudo iptables -A FORWARD -i wg-yat0-xxx -j ACCEPT
sudo iptables -A FORWARD -o wg-yat0-xxx -j ACCEPT
```

## Verificación

```bash
# Registros
journalctl -u yat-edge -f

# Interfaz
ip link show wg-yat0-xxx

# Reglas nftables
nft list ruleset | grep 'yat-relay'

# Reenvío
sysctl net.ipv4.ip_forward
```

Resultados esperados:

```text
WireGuard functionality enabled
kernel forwarder started: iface=wg-yat0-xxx
wg-yat0-xxx: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420
net.ipv4.ip_forward = 1
```

## Interferencia con Docker e iptables

En hosts con Docker, `FORWARD` puede tener una política `DROP`. Determina el backend:

```bash
iptables --version
```

Si aparece `nf_tables`, Docker y nftables comparten la misma capa. Si aparece `legacy`, puede ser necesario añadir una regla explícita:

```bash
sudo iptables -I DOCKER-USER -i wg-yat0-xxx -j ACCEPT
sudo iptables -I DOCKER-USER -o wg-yat0-xxx -j ACCEPT
```

La cadena `DOCKER-USER` se reconstruye cuando Docker reinicia, por lo que la regla debe persistirse en el firewall del sistema.

Otra opción es cambiar el sistema a `iptables-nft`. Evita desactivar la gestión de iptables de Docker salvo que sepas cómo publicar puertos de contenedores manualmente.

## Kernel antiguo

```bash
uname -r
```

Si el kernel es anterior a 5.6, instala WireGuard o actualiza el kernel.

## Recursos relacionados

- [Redes WireGuard](../wireguard-networking.md)
- [Referencia de configuración](./config-reference.md)
- [FAQ](./faq.md)

---
*YAT Team*
