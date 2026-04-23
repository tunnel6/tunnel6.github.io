# YAT Official Website

[![Deploy to Cloudflare Pages](https://github.com/tunnel6/tunnel6.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/tunnel6/tunnel6.github.io/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official website for YAT (Yet Another Tunnel) - Making intranet penetration simpler and more secure.

**Website**: [https://tunnel6.com](https://tunnel6.com)

## Tech Stack

- **Framework**: [VitePress](https://vitepress.dev/)
- **Language**: Vue 3 + TypeScript
- **Deployment**: Cloudflare Pages / GitHub Pages
- **i18n**: English, 简体中文, Español

## Project Structure

```
yat.github.io/
├── docs/
│   ├── .vitepress/
│   │   └── config.js          # VitePress configuration
│   ├── public/                 # Static assets
│   │   └── images/
│   │
│   ├── # Main pages (in nav)
│   ├── index.md               # Homepage
│   ├── features.md            # Features page
│   ├── download.md            # Download page
│   ├── pricing.md             # Pricing page
│   ├── blog/                  # Blog
│   │   └── index.md
│   │
│   ├── # Documentation
│   ├── guide/                 # User guide
│   ├── developer/             # Developer docs
│   │
│   └── # Hidden pages (footer links)
│       ├── about.md
│       ├── privacy.md
│       ├── terms.md
│       └── changelog.md
│
├── package.json
└── README.md
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run docs:dev
```

The site will be available at `http://localhost:5173`

### Build

```bash
npm run docs:build
```

Output will be in `docs/.vitepress/dist/`

### Preview Production Build

```bash
npm run docs:preview
```

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run docs:build`
   - **Build output directory**: `docs/.vitepress/dist`
3. Deploy!

### GitHub Pages

The site will auto-deploy via GitHub Actions on push to `main` branch.

## Multi-language Support

The website supports three languages:

- **English** (default): `/`
- **简体中文**: `/zh/`
- **Español**: `/es/`

Language configuration is in `docs/.vitepress/config.js`.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **YAT Main Repository**: [https://github.com/tunnel6/yat](https://github.com/tunnel6/-client)
- **Documentation**: [https://tunnel6.com/guide/](https://myroxy.dev/guide/)
- **Download**: [https://unnel6.com/download](https://myroxy.dev/download)
- **Support**: [support#tunnel6.com]
