# Account and Settings

> Manage your YAT account and client settings

---

## 📋 Table of Contents

- [Account Management](#account-management)
- [Client Settings](#client-settings)
- [Language and Theme](#language-and-theme)
- [Data Management](#data-management)
- [Security Settings](#security-settings)

---

## Account Management

### Login Methods

YAT supports the following login methods:

- **GitHub** - Login with GitHub account (Recommended)
- **Google** - Login with Google account
- **Email** - Register with email (Coming soon)

### Login Process

1. Open YAT client
2. Click **Login** button
3. Select login method
4. Authorize access
5. Complete login

> 📸 **[Screenshot Location]** Login Page
> 
> Description: Shows GitHub/Google login buttons

### Account Information

After login, view account information:

- **Username**
- **Email**
- **Avatar**
- **Registration Time**

### Logout

1. Click **Settings**
2. Click **Logout**
3. Confirm logout

> ⚠️ **Note**: After logout:
> - Tunnels will stop
> - Edge connections will disconnect
> - Need to relogin to use

---

## Client Settings

### Open Settings

Click **Settings** icon in left navigation.

> 📸 **[Screenshot Location]** Settings Page
> 
> Description: Shows settings items list

### General Settings

#### Auto Start

- **Enable**: YAT starts with system
- **Disable**: Manual start

**macOS**:
```
System Settings > General > Login Items
```

**Windows**:
```
Task Manager > Startup
```

#### Minimize to Tray

- **Enable**: Minimize to system tray when closing window
- **Disable**: Exit program when closing window

#### Show Main Window on Startup

- **Enable**: Auto show main window on startup
- **Disable**: Run in background on startup

---

## Language and Theme

### Language Settings

YAT supports multiple languages:

- ✅ **简体中文** (zh-CN)
- ✅ **English** (en)
- ⚠️ **日本語** (ja) - In development
- ⚠️ **Français** (fr) - In development

**Switch Language**:
1. Settings > Language
2. Select language
3. Interface auto-switches

### Theme Settings

YAT supports three theme modes:

#### Light

- White background
- Dark text
- Suitable for bright environments

#### Dark

- Dark background
- Light text
- Suitable for dark environments
- Reduces eye strain

#### System

- Auto follows system theme
- Auto changes when system switches

> 📸 **[Screenshot Location]** Theme Switch
> 
> Description: Shows Light/Dark/System options

### Theme Adaptation

Extensions also follow theme switching:

```typescript
// Receive theme changes in extension
hooks: {
  onThemeChange(isDark, themeMode, context) {
    // Update extension UI
  }
}
```

---

## Data Management

### Data Location

YAT data is stored in following locations:

**macOS**:
```
~/Library/Application Support/YAT/
├── config.json        # Configuration file
├── tunnels.db         # Tunnel data
├── edges.db           # Edge data
└── extensions/        # Extensions directory
```

**Windows**:
```
%APPDATA%/YAT/
```

**Linux**:
```
~/.config/yat/
```

### Clear Cache

If encountering display issues, try clearing cache:

1. Settings > Data Management
2. Click **Clear Cache**
3. Restart YAT

> ⚠️ **Note**: Clearing cache won't delete:
> - Tunnel configuration
> - Edge configuration
> - Account information

### Export Data

Export data configuration (backup):

1. Settings > Data Management
2. Click **Export Configuration**
3. Select save location
4. Save `.json` file

### Import Data

Import configuration (restore):

1. Settings > Data Management
2. Click **Import Configuration**
3. Select backup file
4. Confirm import

> ⚠️ **Warning**: Import will overwrite current configuration!

---

## Security Settings

### Account Security

#### Two-Factor Authentication (2FA)

Coming soon:
- TOTP (Time-based One-Time Password)
- SMS verification
- Hardware keys

#### Login History

View recent login records:
- Time
- Device
- IP address
- Location

### Device Management

View logged-in devices:

- Device name
- Login time
- Last active
- Action (logout)

### Privacy Settings

#### Data Collection

YAT collects following data to improve product:

- ✅ Usage statistics (anonymous)
- ✅ Error logs (anonymous)
- ❌ Tunnel content
- ❌ Personal data

#### Opt-out Data Collection

Settings > Privacy > Disable telemetry

---

## FAQ

### Q: What if I forget password?

YAT uses OAuth login, no password needed.

If using email login:
1. Click **Forgot Password**
2. Enter email
3. Receive reset link
4. Set new password

### Q: How to change bound email?

Currently doesn't support changing email. Need to:
1. Logout current account
2. Register with new email
3. Reconfigure

### Q: Can I delete account?

Yes, but **irreversible**:

1. Contact support team
2. Confirm deletion
3. All data will be cleared

> ⚠️ **Warning**:
> - All tunnels will be deleted
> - All Edges will be unregistered
> - Certificates will be revoked

### Q: Is there a limit on multi-device login?

**No limit**. Same account can login on multiple devices.

### Q: Will data sync?

**Yes**. Following data syncs across devices:

- ✅ Tunnel list
- ✅ Edge list
- ✅ Account settings
- ❌ Client settings (local)

### Q: How to protect account security?

1. Use strong password (if supported)
2. Enable 2FA (coming soon)
3. Regularly check login history
4. Don't save login status on public computers

---

## 💡 Best Practices

### 1. Regular Backup Configuration

```bash
# Backup configuration directory
tar czf yat-backup-$(date +%Y%m%d).tar.gz \
  ~/Library/Application\ Support/YAT/
```

### 2. Keep Client Updated

- Enable auto-update
- Regularly check for new versions
- Read changelog

### 3. Clean Up Unused Data

- Delete unused tunnels
- Unsubscribe unused Edges
- Uninstall unused extensions

### 4. Pay Attention to Security

- Don't login on public networks
- Regularly check login devices
- Update password promptly

---

## 📚 Related Documentation

- [Quick Start](./quick-start.md) - Registration and login
- [FAQ](./faq.md) - Account-related issues
- [Multi-Device Management](./multi-device-roles.md) - Device role management

---

*YAT Team - Making intranet penetration simpler*
