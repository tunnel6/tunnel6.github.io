# macOS Installation Guide (Unsigned / Self-Signed Build)

> The macOS package is currently **not notarized by Apple**, so Gatekeeper may block it on first launch. This page collects every working solution: the one-click fix, Finder allow, System Settings allow, terminal commands, and local ad-hoc self-signing.

---

## 🧭 Why is it blocked?

The current macOS build is not signed with a paid Apple Developer ID certificate and has not been through Apple notarization. Gatekeeper blocks such apps by default. Common messages include:

| macOS message | What it actually means |
|---------------|------------------------|
| "Can't be opened because Apple cannot check it for malicious software" | Normal block for a non-notarized app |
| "YAT is damaged and can't be opened" | Gatekeeper's standard message for unsigned builds — **the file is not actually damaged** |
| "Cannot verify the developer" | Same as above, expected for unsigned apps |

> ⚠️ Safety first: download only from the **official GitHub Releases** page and verify the file against the attached `SHA256SUMS.txt` before continuing.

---

## ✅ Option 1: Standard install (try this first)

1. Double-click the downloaded `.dmg`.
2. Drag **YAT.app** onto the **Applications** folder icon.
3. Eject the DMG, then launch YAT from **Launchpad** or **Applications**.
4. If macOS blocks the launch, continue with the options below.

> 💡 Always drag YAT.app into /Applications first. Running it directly from the DMG window triggers App Translocation (a read-only random mount), which makes any fix non-persistent — see the "App Translocation" section below.

---

## 🛠 Option 2: One-click fix inside the DMG (recommended)

The DMG ships with a one-click fix script `③ fixapp.command` ("first launch failed? click me"):

1. **Drag YAT.app into Applications first**, then drag the script to your Desktop (or Applications).
2. Double-click the script on your Desktop.
3. The script automatically:
   - Removes the `com.apple.quarantine` flag from `YAT.app` only (no system-level changes);
   - Launches YAT;
   - If the launch still fails, adds YAT to the Gatekeeper allow-list and retries;
   - Reports the result in a dialog.

> ❓ **Double-clicking the script does nothing?** macOS may have quarantined the script too. Control-click the script in Finder → choose "Open" → click "Open" again in the dialog. Or copy the script to your Desktop first — running it straight from the read-only DMG hits App Translocation.

---

## 🖱 Option 3: One-time allow in Finder (no terminal needed)

1. Open **Applications** and find `YAT`.
2. Hold `Control` and click the app icon, then choose **Open**.
3. Click **Open** again in the confirmation dialog.

This only needs to be done once; afterwards the app opens normally.

> ℹ️ macOS 15 (Sequoia) and later tightened this entry point. If "Open" does not appear in the Control-click menu, use Option 4.

---

## ⚙️ Option 4: Allow in System Settings

1. Install normally (Option 1) and double-click YAT once to trigger the block.
2. Open **System Settings → Privacy & Security**.
3. Scroll to the bottom and find the "YAT was blocked" notice, then click **Open Anyway**.
4. Enter your administrator password to confirm.

---

## ⌨️ Option 5: Terminal commands (equivalent to the one-click fix)

For terminal users — same core actions as the one-click script:

```bash
# Remove the quarantine flag from YAT.app only (no system-wide changes)
xattr -dr com.apple.quarantine "/Applications/YAT.app"

# Launch
open "/Applications/YAT.app"
```

To confirm the flag is gone:

```bash
xattr -l "/Applications/YAT.app" | grep quarantine
# no output means the flag has been removed
```

---

## ✍️ Option 6: Local self-signing (ad-hoc codesign)

**When to use this**:

- You removed the quarantine flag (Option 5) but still see "YAT is damaged and can't be opened" (broken in-bundle signature);
- Enterprise / team internal distribution where a consistent local signature state is preferred;
- The package was locally modified (e.g. resources replaced) and the original signature no longer validates.

```bash
# Re-sign the whole app with an ad-hoc signature (no Apple developer account needed)
codesign --force --deep --sign - "/Applications/YAT.app"

# Clear the quarantine flag and launch
xattr -dr com.apple.quarantine "/Applications/YAT.app"
open "/Applications/YAT.app"
```

Verify the result:

```bash
codesign --verify --deep --strict "/Applications/YAT.app"
spctl --assess --verbose "/Applications/YAT.app"
```

**Notes**:

- `--sign -` creates an **ad-hoc signature**: no certificate is required; it only proves the bundle's internal integrity, **not an Apple-recognized developer identity**.
- YAT's embedded WireGuard privileged helper and Network Agent daemon are already ad-hoc signed, so this keeps the bundle consistent with the build.
- For formal enterprise distribution, prefer Developer ID signing + notarization instead of ad-hoc.

Optional: add YAT to the Gatekeeper allow-list (the script's fallback action):

```bash
sudo spctl --add --label "YAT" "/Applications/YAT.app"
```

---

## 📦 App Translocation: why running straight from the DMG does not work

When an app or script is **run directly from a read-only DMG**, macOS mounts the DMG at a random read-only path (`/private/var/folders/.../AppTranslocation/<uuid>/d/`):

- Even after removing the quarantine flag, what actually runs is the read-only copy inside the DMG;
- The next launch is blocked again, so the fix does not persist.

**The right way**:

1. Drag `YAT.app` into **Applications** and run it from `/Applications`;
2. Do the same for the fix script — copy it to the Desktop or Applications first, then double-click.

---

## ❓ FAQ

| Issue | Solution |
|-------|----------|
| "YAT is damaged and can't be opened" | Standard message for unsigned apps, not real corruption — use Option 5 or 6 |
| Double-clicking the fix script does nothing | Control-click the script → Open → Open; or copy it to the Desktop first |
| Still blocked after the fix | Confirm `YAT.app` lives in `/Applications` (not inside the DMG), then use Option 4 |
| How to verify the download | `shasum -a 256 -c SHA256SUMS.txt` |
| How to uninstall | Drag `/Applications/YAT.app` to the Trash; user data lives in `~/Library/Application Support/YAT` if you want to remove it too |

---

## 🔒 Security notes

- Every command on this page **targets YAT.app only** and does not disable Gatekeeper globally or weaken system security.
- Do **not** run global bypass commands such as `sudo spctl --master-disable`.
- Ad-hoc self-signing does not change Apple's identity trust model; it is a local integrity fix only.
- Download only from the official GitHub Releases and verify SHA-256 checksums before installing.

---

## 📚 Related documents

- [Quick Start](./quick-start.md) - your first steps after installing
- [FAQ](./faq.md) - other installation and usage questions
