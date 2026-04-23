---
layout: page
title: About
---

# About YAT

## Our Mission

YAT (Yet Another Tunnel) is an open-source intranet penetration platform designed to make remote access simple, secure, and high-performance.

We believe everyone should have the ability to access their services from anywhere without compromising security or dealing with complex network configurations.

## Key Principles

- **Security First**: Zero-trust architecture with mTLS encryption
- **Performance**: P2P direct connection and WireGuard support
- **Simplicity**: Beautiful UI, zero configuration required
- **Extensibility**: Rich extension ecosystem for custom use cases
- **Open Source**: Transparent, community-driven development

## Team

YAT is developed by a passionate team of developers who believe in open source and secure networking.

## Technology Stack

### Client (yat-fe)
- **Framework**: Vue 3 + TypeScript
- **Desktop**: Electron
- **Build**: Vite
- **UI**: Custom components

### Edge Server
- **Language**: Go
- **Protocol**: mTLS, HTTP/2, WireGuard
- **Database**: SQLite

### Control Plane (captain)
- **Language**: Go
- **API**: gRPC + REST
- **Database**: PostgreSQL
- **Certificate**: Let's Encrypt (ACME)

## Open Source

YAT is open source under the MIT License.

- **GitHub**: [https://github.com/yat](https://github.com/yat)
- **Issues**: [Report bugs](https://github.com/yat/issues)
- **Discussions**: [Community forum](https://github.com/yat/discussions)

## Contact

- **Email**: [support@myroxy.dev](mailto:support@myroxy.dev)
- **Twitter**: [@yat](https://twitter.com/yat)
- **Discord**: [Join our community](https://discord.gg/yat)

## License

```
MIT License

Copyright (c) 2024 YAT Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
