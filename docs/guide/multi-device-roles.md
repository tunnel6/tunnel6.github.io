# Multi-Device and Role Management

> Learn about YAT's Actor model and multi-device collaboration mechanism

---

## 📋 Table of Contents

- [Actor Model Overview](#actor-model-overview)
- [Role Definitions](#role-definitions)
- [Multi-Device Collaboration](#multi-device-collaboration)
- [Session Management](#session-management)
- [Device Management](#device-management)
- [FAQ](#faq)

---

## Actor Model Overview

### What is Actor Model?

YAT uses **Actor model** to manage multi-device collaboration. Each device plays a **role (Actor)** in the tunnel, working together to complete remote access tasks.

### Why Need Actor Model?

**Scenario Example**:

```
Office computer ──wants to access──► Home Mac

Traditional solution:
- Cannot distinguish who is accessing
- Cannot control permissions
- Confused state

YAT Actor Model:
- Office computer = Consumer
- Home Mac = Publisher
- Clear roles, explicit permissions
```

### Identity Identification

YAT uses two-layer identity identification:

1. **Transport Layer Identity**: `session_id` / `device_id`
2. **Business Layer Identity**: `actor_role` / `actor_session_id` / `actor_device_id`

---

## Role Definitions

### Publisher

**Responsibility**: Provide remote service

**Permissions**:
- ✅ Start tunnel
- ✅ Stop tunnel
- ✅ Control channels
- ✅ Modify configuration

**Example Scenarios**:
- Home Mac provides VNC service
- Company server provides API service
- Local development environment provides debugging service

### Consumer

**Responsibility**: Use remote service

**Permissions**:
- ✅ View tunnel status
- ✅ Access remote address
- ✅ View detailed information
- ❌ Cannot start/stop tunnel
- ❌ Cannot modify configuration

**Example Scenarios**:
- Office computer accessing home Mac
- Mobile phone accessing company server
- Customer accessing demo environment

### Controller

**Responsibility**: Manage tunnel configuration (reserved role)

**Permissions**:
- ✅ All Publisher permissions
- ✅ Manage sharing settings
- ✅ Manage participants

> ⚠️ **Note**: Controller role is currently reserved, not yet implemented.

---

## Multi-Device Collaboration

### Typical Scenarios

#### Scenario 1: Remote Work

```
Home Mac (Publisher)
  ↓ Create tunnel, share
  ↓
Office Laptop (Consumer)
  ↓ Access shared tunnel
  ↓
Remote desktop connection successful
```

**Configuration Steps**:

1. **Home Mac**:
   - Create ARD tunnel
   - Set to **Shared** mode
   - Role auto-set to **Publisher**
   - Start tunnel

2. **Office Laptop**:
   - Login to same account
   - See shared tunnel in tunnel list
   - Role auto-set to **Consumer**
   - Click to connect remote desktop

#### Scenario 2: Team Collaboration

```
Developer A (Publisher)
  ↓ Create API tunnel
  ↓
Developer B (Consumer)
  ↓ Access API
  ↓
Tester C (Consumer)
  ↓ Access API
```

### Role Assignment Rules

#### Assignment at Creation

- **Creator device**: Default **Publisher**
- **Other devices**: Auto **Consumer**

#### Runtime Resolution

YAT resolves roles from following sources:

1. **Participants list** - Runtime participant information
2. **Sessions list** - Session information
3. **Config configuration** - tunnelRole field

```typescript
// Role resolution priority
1. role in participants
2. publisherDeviceId / consumerDeviceId in sessions
3. config.tunnelRole
4. Default fallback
```

### Permission Matrix

| Operation | Publisher | Consumer | Controller |
|-----------|-----------|----------|------------|
| Start Tunnel | ✅ | ❌ | ✅ |
| Stop Tunnel | ✅ | ❌ | ✅ |
| View Status | ✅ | ✅ | ✅ |
| Access Service | ✅ | ✅ | ✅ |
| Modify Configuration | ✅ | ❌ | ✅ |
| Delete Tunnel | ✅ | ❌ | ✅ |
| Manage Participants | ❌ | ❌ | ✅ |

---

## Session Management

### What is Session?

**Session** represents one tunnel running instance.

### Session ID Format

```
Format: {appId}:{tunnelId}:{deviceId}:{actorRole}

Examples: 
- app-ard:tunnel-123:device-abc:publisher
- app-ard:tunnel-123:device-xyz:consumer
```

### Why Need Role Suffix?

Same device may play different roles at different times:

```
Device A morning: publisher (service provider role)
Device A afternoon: consumer (accessing other services role)

Session distinction:
- ard:tunnel-123:device-A:publisher
- ard:tunnel-456:device-A:consumer
```

### Session Lifecycle

```
Create tunnel
  ↓
Start channels → Create Session
  ↓
Running → Session active
  ↓
Stop channels → Session ended
  ↓
Delete tunnel → Session cleaned
```

---

## Device Management

### Device ID

Each device has a unique device ID:

```
Format: device-{random-string}
Example: device-a1b2c3d4e5f6
```

### View Device Information

In tunnel details' **Participants** section, you can see:

- **Device ID**
- **Role**
- **Status** (Online/Offline)
- **Last Online Time**

> 📸 **[Screenshot Location]** Participants List
> 
> Description: Shows device ID, role labels, status indicators

### Device Status

| Status | Description |
|--------|-------------|
| **Online** | Device online, participating in tunnel |
| **Offline** | Device offline |
| **Idle** | Device online but not participating |

### Manage Devices

#### Remove Device (In Development)

Future version support:
1. Enter tunnel details
2. Find participants list
3. Click **Remove** button
4. Confirm remove

> ⚠️ **Note**: Removing Publisher device will cause tunnel to stop

---

## FAQ

### Q: How to switch roles?

Currently **does not support** runtime role switching.

**Solution**:
1. Stop tunnel
2. Delete tunnel
3. Recreate on new device

### Q: Can one device have multiple roles?

**Yes**. Same device can play different roles in different tunnels:

```
Tunnel A: Publisher
Tunnel B: Consumer
```

But in **same tunnel**, one device can only have one role.

### Q: What happens when Publisher goes offline?

**Tunnel will stop**. Because Publisher is service provider, service unavailable when offline.

### Q: Can Consumer become Publisher?

Currently **does not support** dynamic conversion.

**Design reason**:
- Publisher needs to provide local service
- Consumer only accesses service
- Role conversion requires service migration

### Q: How to view current device ID?

In developer tools console:

```javascript
localStorage.getItem('device:id')
```

### Q: Can device ID be modified?

**Not recommended**. Device ID is used for:
- Identity identification
- Session management
- Permission control

Modification may cause:
- Confused tunnel state
- Permission loss
- Session failure

### Q: Will multi-device simultaneous operations conflict?

YAT uses **revision-based conflict resolution** mechanism:

1. Increment revision on each modification
2. Sync latest state on conflict
3. 409 conflict → sync → retry

---

## 💡 Best Practices

### 1. Clear Role Division

- **Publisher**: Stable server device
- **Consumer**: Mobile client device

### 2. Reasonable Sharing Mode Settings

```
Personal multi-device: Shared
Team collaboration: Shared
Sensitive service: Exclusive
```

### 3. Monitor Device Status

Regularly check participants list:
- Is Publisher online
- Is Consumer count reasonable
- Any abnormal devices

### 4. Device Naming Convention

Recommend labeling on devices:

```
MacBook-Pro (Publisher)
ThinkPad (Consumer)
iPhone (Consumer)
```

---

## 📚 Related Documentation

- [Tunnel Management](./tunnel-management.md) - Create shared tunnels
- [Apps and Extensions](./apps-and-extensions.md) - ARD multi-device usage
- [FAQ](./faq.md) - Role-related issues

---

*YAT Team - Making intranet penetration simpler*
