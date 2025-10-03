# Development Guide

## Prerequisites
- Node.js 20.x.x

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nirdosh17/clipboard-manager.git
   cd clipboard-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app locally:
   ```bash
   npm start
   ```
   You should see <img src="resources/icon-50.png" width="20" height="20"> icon in your menu bar.

## Project Structure

```
clipboard-manager/
├── src/
│   └── index.js          # Main Electron process
├── resources/            # App icons and assets
├── dist/                 # Build output
└── package.json          # Project configuration
```

## Building

### Build for all platforms:
```bash
npm run build
```

### Build for macOS:
```bash
npm run build:mac
```

### Build for specific architecture:
```bash
npm run build:mac:arm64  # Apple Silicon
npm run build:mac:x64    # Intel
```

### Build DMG:
```bash
npm run build:dmg
```


## Release Process
Update the version in `package.json` and push the changes to the `main` branch.

The GitHub Actions workflow will automatically create new github tag from package version, build binaries and create a release.

## License

MIT
