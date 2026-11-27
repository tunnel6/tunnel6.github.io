# Guía de instalación de macOS (build sin firmar / autofirmado)

> El paquete de macOS **no está notarizado por Apple** actualmente, por lo que Gatekeeper puede bloquearlo en el primer inicio. Esta página reúne todas las soluciones posibles: la corrección de un clic, el permiso desde Finder, el permiso desde Ajustes del sistema, comandos de Terminal y la autofirma ad-hoc local.

---

## 🧭 ¿Por qué se bloquea?

La build actual de macOS no está firmada con un certificado de pago Apple Developer ID y no ha pasado por la notarización de Apple. Gatekeeper bloquea este tipo de apps por defecto. Mensajes habituales:

| Mensaje de macOS | Qué significa en realidad |
|------------------|---------------------------|
| «No se puede abrir porque Apple no puede verificar si contiene software malicioso» | Bloqueo normal de una app sin notarizar |
| «YAT está dañado y no se puede abrir» | Mensaje estándar de Gatekeeper para builds sin firmar; **el archivo no está realmente dañado** |
| «No se puede verificar el desarrollador» | Igual que arriba; comportamiento esperado en apps sin firmar |

> ⚠️ Seguridad primero: descarga solo desde la **página oficial de GitHub Releases** y verifica el archivo con el `SHA256SUMS.txt` adjunto antes de continuar.

---

## ✅ Opción 1: instalación estándar (prueba esto primero)

1. Haz doble clic en el `.dmg` descargado.
2. Arrastra **YAT.app** al icono de la carpeta **Applications**.
3. Expulsa el DMG y abre YAT desde **Launchpad** o **Applications**.
4. Si macOS bloquea el inicio, continúa con las opciones siguientes.

> 💡 Arrastra siempre YAT.app a /Applications antes de abrirlo. Ejecutarlo directamente desde la ventana del DMG activa App Translocation (un montaje aleatorio de solo lectura), y la corrección no persiste. Consulta la sección «App Translocation» más abajo.

---

## 🛠 Opción 2: corrección de un clic incluida en el DMG (recomendada)

El DMG incluye un script de corrección de un clic, `③ fixapp.command` («¿falló el primer inicio? ábreme»):

1. **Arrastra primero YAT.app a Applications** y después arrastra el script al Escritorio (o a Applications).
2. Haz doble clic en el script del Escritorio.
3. El script automáticamente:
   - Elimina el atributo `com.apple.quarantine` solo de `YAT.app` (sin cambios a nivel de sistema);
   - Inicia YAT;
   - Si el inicio sigue fallando, añade YAT a la lista de permitidos de Gatekeeper y reintenta;
   - Informa del resultado en un diálogo.

> ❓ **¿El doble clic sobre el script no hace nada?** Es posible que macOS también haya puesto en cuarentena el script. En Finder, mantén pulsada la tecla `Control`, haz clic en el script → elige «Abrir» → pulsa «Abrir» de nuevo en el diálogo. O copia antes el script al Escritorio: ejecutarlo directamente desde el DMG de solo lectura choca con App Translocation.

---

## 🖱 Opción 3: permiso único desde Finder (sin Terminal)

1. Abre **Applications** y busca `YAT`.
2. Mantén pulsada la tecla `Control`, haz clic en el icono de la app y elige **Abrir**.
3. Pulsa **Abrir** otra vez en el diálogo de confirmación.

Solo hay que hacerlo una vez; después la app se abre con normalidad.

> ℹ️ macOS 15 (Sequoia) y posteriores han restringido este acceso. Si «Abrir» no aparece en el menú del Control-clic, usa la Opción 4.

---

## ⚙️ Opción 4: permitir desde Ajustes del sistema

1. Instala con normalidad (Opción 1) y haz doble clic en YAT una vez para provocar el bloqueo.
2. Abre **Ajustes del sistema → Privacidad y seguridad**.
3. Desplázate al final, busca el aviso «YAT fue bloqueado» y pulsa **Abrir igualmente**.
4. Introduce tu contraseña de administrador para confirmar.

---

## ⌨️ Opción 5: comandos de Terminal (equivalente a la corrección de un clic)

Para usuarios de Terminal — las mismas acciones clave que el script de un clic:

```bash
# Elimina el atributo de cuarentena solo de YAT.app (sin cambios globales)
xattr -dr com.apple.quarantine "/Applications/YAT.app"

# Inicia la app
open "/Applications/YAT.app"
```

Para comprobar que el atributo desapareció:

```bash
xattr -l "/Applications/YAT.app" | grep quarantine
# sin salida significa que se eliminó
```

---

## ✍️ Opción 6: autofirma local (codesign ad-hoc)

**Cuándo usarla**:

- Eliminaste el atributo de cuarentena (Opción 5) pero sigue apareciendo «YAT está dañado y no se puede abrir» (firma interna del bundle rota);
- Distribución interna en empresas / equipos donde se prefiere un estado de firma local coherente;
- El paquete se modificó localmente (p. ej., recursos sustituidos) y la firma original ya no valida.

```bash
# Refirma toda la app con una firma ad-hoc (no se necesita cuenta de desarrollador de Apple)
codesign --force --deep --sign - "/Applications/YAT.app"

# Elimina la cuarentena e inicia
xattr -dr com.apple.quarantine "/Applications/YAT.app"
open "/Applications/YAT.app"
```

Verifica el resultado:

```bash
codesign --verify --deep --strict "/Applications/YAT.app"
spctl --assess --verbose "/Applications/YAT.app"
```

**Notas**:

- `--sign -` crea una **firma ad-hoc**: no requiere certificado; solo demuestra la integridad interna del bundle, **no una identidad de desarrollador reconocida por Apple**.
- El helper privilegiado de WireGuard y el demonio Network Agent integrados en YAT ya vienen firmados ad-hoc, de modo que así el bundle queda coherente con la build.
- Para distribución empresarial formal, prefiere la firma Developer ID + notarización en lugar de ad-hoc.

Opcional: añade YAT a la lista de permitidos de Gatekeeper (la acción de respaldo del script):

```bash
sudo spctl --add --label "YAT" "/Applications/YAT.app"
```

---

## 📦 App Translocation: por qué ejecutar directamente desde el DMG no funciona

Cuando una app o un script se **ejecuta directamente desde un DMG de solo lectura**, macOS monta el DMG en una ruta aleatoria de solo lectura (`/private/var/folders/.../AppTranslocation/<uuid>/d/`):

- Aunque se elimine el atributo de cuarentena, lo que se ejecuta es la copia de solo lectura dentro del DMG;
- El siguiente inicio vuelve a bloquearse, así que la corrección no persiste.

**La forma correcta**:

1. Arrastra `YAT.app` a **Applications** y ejecútalo desde `/Applications`;
2. Haz lo mismo con el script de corrección: cópialo primero al Escritorio o a Applications y luego haz doble clic.

---

## ❓ Preguntas frecuentes

| Problema | Solución |
|----------|----------|
| «YAT está dañado y no se puede abrir» | Mensaje estándar para apps sin firmar, no es corrupción real; usa la Opción 5 o 6 |
| El script de corrección no responde al doble clic | Control-clic en el script → Abrir → Abrir; o cópialo antes al Escritorio |
| Sigue bloqueado tras la corrección | Confirma que `YAT.app` está en `/Applications` (no dentro del DMG) y usa la Opción 4 |
| Cómo verificar la descarga | `shasum -a 256 -c SHA256SUMS.txt` |
| Cómo desinstalar | Arrastra `/Applications/YAT.app` a la Papelera; los datos de usuario están en `~/Library/Application Support/YAT` si también quieres eliminarlos |

---

## 🔒 Notas de seguridad

- Todos los comandos de esta página **afectan solo a YAT.app** y no desactivan Gatekeeper globalmente ni debilitan la seguridad del sistema.
- **No** ejecutes comandos de omisión global como `sudo spctl --master-disable`.
- La autofirma ad-hoc no cambia el modelo de confianza de identidades de Apple; es solo una reparación local de integridad.
- Descarga únicamente desde GitHub Releases oficiales y verifica los checksums SHA-256 antes de instalar.

---

## 📚 Documentos relacionados

- [Guía de inicio rápido](./quick-start.md) - primeros pasos tras la instalación
- [Preguntas frecuentes](./faq.md) - otras dudas de instalación y uso
