const { app, BrowserWindow, Tray, Menu, clipboard, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// Store clipboard history
let clipboardHistory = [];
let mainWindow = null;
let tray = null;
let isKeyHeld = false;
let keyReleaseTimer = null;

// Function to add item to clipboard history
const addToHistory = (text) => {
    if (text && text.trim() && !clipboardHistory.includes(text)) {
        clipboardHistory.unshift(text);
        // Keep only last 100 items
        if (clipboardHistory.length > 100) {
            clipboardHistory = clipboardHistory.slice(0, 100);
        }
        updateTrayMenu();
        if (mainWindow) {
            mainWindow.webContents.send('update-clipboard-history', clipboardHistory);
        }
    }
};

// Function to update tray menu with clipboard history
const updateTrayMenu = () => {
    if (!tray) return;

    const menuItems = [
        {
            label: 'Clipboard Manager',
            enabled: false
        },
        { type: 'separator' }
    ];

    if (clipboardHistory.length === 0) {
        menuItems.push({
            label: 'No items copied yet',
            enabled: false
        });
    } else {
        clipboardHistory.slice(0, 10).forEach((item, index) => {
            const truncatedText = item.length > 30 ? item.substring(0, 30) + '...' : item;
            menuItems.push({
                label: truncatedText,
                click: () => {
                    clipboard.writeText(item);
                }
            });
        });

        if (clipboardHistory.length > 10) {
            menuItems.push({
                label: `... and ${clipboardHistory.length - 10} more`,
                enabled: false
            });
        }
    }

    menuItems.push(
        { type: 'separator' },
        {
            label: 'Show Window',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: 'Clear Clipboard History',
            click: () => {
                clipboardHistory = [];
                updateTrayMenu();
                if (mainWindow) {
                    mainWindow.webContents.send('update-clipboard-history', clipboardHistory);
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    );

    const contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu);
};

// Monitor clipboard changes
const startClipboardMonitoring = () => {
    let lastClipboardText = clipboard.readText();

    setInterval(() => {
        const currentClipboardText = clipboard.readText();
        if (currentClipboardText !== lastClipboardText && currentClipboardText.trim()) {
            lastClipboardText = currentClipboardText;
            addToHistory(currentClipboardText);
        }
    }, 1000); // Check every second
};

// Handle key release detection using a timer-based approach
const handleKeyPress = () => {
    isKeyHeld = true;

    // Clear any existing timer
    if (keyReleaseTimer) {
        clearTimeout(keyReleaseTimer);
    }

    // Set a timer to detect key release
    // This simulates the "hold" behavior
    keyReleaseTimer = setTimeout(() => {
        if (isKeyHeld && mainWindow && mainWindow.isVisible()) {
            // Check if window still has focus - if not, keys were likely released
            if (!mainWindow.isFocused()) {
                isKeyHeld = false;
                mainWindow.hide();
            } else {
                // If still focused, reset the timer
                handleKeyPress();
            }
        }
    }, 100); // Check every 100ms
};

const createWindow = () => {
    const indexHTMLPath = path.resolve(__dirname, '../resources/index.html');
    mainWindow = new BrowserWindow({
        width: 436,
        height: 290,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false, // Don't show window on startup
        icon: path.resolve(__dirname, '../resources/electron.png'),
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        frame: false,
        transparent: true,
        hasShadow: false,
        titleBarStyle: 'customButtonsOnHover'
    });

    mainWindow.loadFile(indexHTMLPath);

    // Manually center the window both horizontally and vertically
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const windowWidth = 436;
    const windowHeight = 290;

    const x = Math.round((screenWidth - windowWidth) / 2);
    const y = Math.round((screenHeight - windowHeight) / 2);

    mainWindow.setPosition(x, y);

    // Hide window when closed instead of quitting
    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    // Add window focus/blur handlers for key release detection
    mainWindow.on('blur', () => {
        // When window loses focus, check if user is interacting
        if (isKeyHeld) {
            setTimeout(() => {
                if (mainWindow && mainWindow.isVisible() && !mainWindow.isFocused()) {
                    // Check if user is interacting with the window
                    mainWindow.webContents.send('check-user-interaction');
                }
            }, 100);
        }
    });

    // create system tray
    const iconPath = path.resolve(__dirname, '../resources/electron.png');
    const { nativeImage } = require('electron');

    // Load and resize the icon
    const icon = nativeImage.createFromPath(iconPath);
    const resizedIcon = icon.resize({ width: 20, height: 20 }); // Adjust size as needed

    tray = new Tray(resizedIcon);

    // Set tooltip
    tray.setToolTip('Clipboard Manager');

    // Update tray menu
    updateTrayMenu();

    // Start monitoring clipboard
    startClipboardMonitoring();

    // Register global shortcut
    registerGlobalShortcut();
};

// Register global keyboard shortcut
const registerGlobalShortcut = () => {
    const shortcut = process.platform === 'darwin' ? 'Command+Shift+V' : 'Ctrl+Shift+V';

    const ret = globalShortcut.register(shortcut, () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                // If window is already visible, hide it
                isKeyHeld = false;
                mainWindow.hide();
            } else {
                // Show window and start key monitoring
                isKeyHeld = true;
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send('update-clipboard-history', clipboardHistory);
                handleKeyPress();
            }
        }
    });

    if (!ret) {
        console.log('Registration failed for shortcut:', shortcut);
    }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // Don't quit on macOS, keep running in tray
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers
ipcMain.on('clear-clipboard-history', () => {
    clipboardHistory = [];
    updateTrayMenu();
    if (mainWindow) {
        mainWindow.webContents.send('clipboard-history-cleared');
    }
});

ipcMain.on('paste-item', (event, text) => {
    clipboard.writeText(text);
    // Hide window after pasting
    if (mainWindow) {
        mainWindow.hide();
    }
});

ipcMain.on('hide-window', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
});

ipcMain.on('user-interaction-response', (event, isInteracting) => {
    if (!isInteracting && isKeyHeld && mainWindow && mainWindow.isVisible()) {
        isKeyHeld = false;
        mainWindow.hide();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
