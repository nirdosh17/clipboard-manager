#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Clipboard Manager Installer${NC}"
echo "=============================="
echo ""

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    DOWNLOAD_ARCH="arm64"
    echo -e "${GREEN}✓${NC} Detected Apple Silicon (arm64)"
elif [ "$ARCH" = "x86_64" ]; then
    DOWNLOAD_ARCH="x64"
    echo -e "${GREEN}✓${NC} Detected Intel (x64)"
else
    echo -e "${RED}✗${NC} Unsupported architecture: $ARCH"
    exit 1
fi

# Get latest release info from GitHub
echo ""
echo "Fetching latest release..."
LATEST_RELEASE=$(curl -s https://api.github.com/repos/nirdosh17/clipboard-manager/releases/latest)
VERSION=$(echo "$LATEST_RELEASE" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/v//')

if [ -z "$VERSION" ]; then
    echo -e "${RED}✗${NC} Failed to fetch latest release"
    exit 1
fi

echo -e "${GREEN}✓${NC} Latest version: $VERSION"

# Download URL
DOWNLOAD_URL="https://github.com/nirdosh17/clipboard-manager/releases/download/v${VERSION}/clipboard-manager-${VERSION}-${DOWNLOAD_ARCH}.zip"
ZIP_FILE="/tmp/clipboard-manager-${VERSION}-${DOWNLOAD_ARCH}.zip"

# Download the release
echo ""
echo "Downloading Clipboard Manager..."
if ! curl -L -o "$ZIP_FILE" "$DOWNLOAD_URL"; then
    echo -e "${RED}✗${NC} Download failed"
    exit 1
fi
echo -e "${GREEN}✓${NC} Downloaded successfully"

# Extract to /Applications
echo ""
echo "Installing to /Applications..."
unzip -q -o "$ZIP_FILE" -d /tmp/clipboard-manager-install

# Remove quarantine attribute
echo "Removing quarantine attribute..."
xattr -cr "/tmp/clipboard-manager-install/Clipboard Manager.app"

# Move to Applications
if [ -d "/Applications/Clipboard Manager.app" ]; then
    echo -e "${YELLOW}!${NC} Removing existing installation..."
    rm -rf "/Applications/Clipboard Manager.app"
fi

mv "/tmp/clipboard-manager-install/Clipboard Manager.app" /Applications/
echo -e "${GREEN}✓${NC} Installed to /Applications/Clipboard Manager.app"

# Cleanup
rm -rf "$ZIP_FILE" /tmp/clipboard-manager-install
echo -e "${GREEN}✓${NC} Cleaned up temporary files"

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "To launch Clipboard Manager:"
echo "  1. Open /Applications/Clipboard Manager.app"
echo "  2. On first launch, right-click and select 'Open'"
echo "  3. Use CMD + Shift + V to access your clipboard history"
echo ""
