# YAT v1.3.0 Release Notes

## Highlights

- **Join via Invite Code:** New network invite token mechanism — join a private network with an invite code, no need to repeat the full setup on each device. The exported invite code can be added to the yat-cli daemon process of [yat-fe-linux](https://github.com/tunnel6/yat-fe-linux), a pure Linux implementation, to complete network joining.
- **Link Status at a Glance:** Member list now integrates tiered link health detection. Direct / relay / offline states are clearly distinguishable, with your current device highlighted and sorted first.
- **Path Control:** Supports peer path override and shared path negotiation. Manually choose between direct and relay connections, with friendlier error messages on path switches.
- **Peer Details Upgraded:** Member info dialog redesigned with a sectioned layout, adding observed endpoints, handshake statistics, and other connection diagnostics.
- **Network List View:** New list view mode for a more intuitive network joining experience.

## Improvements

- **Real-time Connection Status:** Global Edge state monitoring + link health event-driven updates — no more polling guesswork.
- **Interaction Polish:** Path switch misclick prevention, offline grace period debounce, lighter status animations, multilingual error messages.
- **Developer Experience:** Incremental extension builds, one-click log path copy.

## Fixes

- Fixed connection instability caused by concurrency races and data conflicts.
- Fixed state anomalies from stale cache/config after account switching or member add/remove.
- Fixed connection drops during relay matching and path recovery scenarios.
- Fixed cross-platform compatibility issues including Windows tray icon residue and UI state desync.