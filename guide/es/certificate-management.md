# 📜 Guía de gestión de certificados

> Los certificados son la base de la seguridad de las comunicaciones. Revisa su validez con regularidad y renuévalos antes de que expiren para evitar cortes de servicio.

## 🔐 Visión general de los certificados de YAT

YAT usa mTLS (TLS mutuo) para proteger todas las comunicaciones:
- **Certificado Root CA**: raíz con la que se emiten el resto de los certificados.
- **Certificado TLS de Edge**: certificado del nodo Edge para el acceso HTTPS.
- **Certificado gRPC**: protege la comunicación entre servicios gRPC.
- **Certificado de cliente**: autentica la identidad del cliente.

## 📅 Ciclo de vida

### Gestión automática
YAT puede emitir y renovar certificados automáticamente:
- **Let's Encrypt**: solicita certificados SSL/TLS gratuitos.
- **Renovación automática**: se inicia 30 días antes del vencimiento.
- **Supervisión de estado**: muestra en todo momento la validez del certificado.

### Gestión manual
Cuando necesites intervenir manualmente:
```bash
# Ver la información del certificado
./edge certs info --config config.yaml

# Renovar el certificado
./edge certs renew --config config.yaml

# Generar el certificado de nuevo
./edge certs generate --config config.yaml
```

## 🚨 Problemas frecuentes

### Certificado caducado
- **Síntoma**: el navegador muestra «Su conexión no es privada» o `NET::ERR_CERT_DATE_INVALID`.
- **Solución**:
  - Espera la renovación automática, que suele ocurrir 30 días antes del vencimiento.
  - Ejecuta manualmente `./edge certs renew`.
  - Comprueba que la hora del sistema sea correcta.

### Certificado incompatible con el dominio
- **Síntoma**: `NET::ERR_CERT_COMMON_NAME_INVALID`.
- **Solución**:
  - Confirma que el dominio del certificado y el dominio visitado coinciden exactamente.
  - Revisa que el registro CNAME apunte al nodo Edge correcto.
  - Genera el certificado de nuevo con el dominio adecuado.

## 🛠️ Buenas prácticas

- **Dominios**: incluye todos los dominios necesarios, incluido el subdominio `www` si lo usas.
- **Seguridad de claves**: asigna permisos `600` al archivo de clave privada.
- **Copias de seguridad**: guarda certificados y claves en un lugar seguro.
- **Alertas**: configura un aviso 7 días antes del vencimiento.

## 📚 Recursos relacionados
- [Gestión de Edge](./edge/management.md)
- [Dominios personalizados](./custom-domains.md)
- [Preguntas frecuentes sobre certificados](./faq.md#q-edge-certificate-expired)

---
*Última actualización del documento: 2026-05-04*
