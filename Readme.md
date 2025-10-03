# Clipboard Manager

A system tray app that keeps track of your clipboard history with some extra features.

## Development
1. Install node: 20.x.x
2. Run `npm install`
3. Run `npm start`

## Installation

### Quick Install (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/nirdosh17/clipboard-manager/main/install.sh | bash
```

### Manual Installation
1. Download the latest release for your Mac architecture (arm64 for Apple Silicon, x64 for Intel)
2. Extract the zip file
3. Remove the quarantine attribute:
   ```bash
   xattr -cr "Clipboard Manager.app"
   ```
4. Move the app to your Applications folder
5. Right-click the app and select "Open" for the first launch

## Usage

- CMD + Shift + V to open the clipboard manager.
- Arrow keys to navigate through the clipboard history.
- Click on an item or press Enter to paste it.
- Escape to close the window.

## Release
Create a new tag following semantic versioning:
```
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
