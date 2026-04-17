# NetLog Capture Guide (Alternative to Fiddler/HAR)

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/use-netlog-capture-network-traffic

## When to Use
- Fiddler is unavailable (e.g., restricted environment)
- HAR captures from DevTools truncate necessary information
- Built into Chromium-based browsers (Edge, Chrome, Electron)

## Known Limitations
- POST request bodies are NOT captured
- Sites in IE compatibility mode are NOT captured

## Capture Steps (Desktop)

1. Close all browser tabs except one
2. Navigate to:
   - Edge: `edge://net-export`
   - Chrome: `chrome://net-export`
3. Options: Select "Include raw bytes (will include cookies and credentials)"
4. Leave Maximum log size blank
5. Click "Start Logging to Disk" → choose save location
6. Open new tab in same window, reproduce the issue
7. Return to NetLog tab → "Stop Logging"

**Important**: Closing/navigating away from NetLog tab stops logging automatically.

## Mobile Devices
- Android: Supported in Edge and Chrome
- iOS: Supported in Chrome only
- Email option available to send log

## Analysis
- Upload to https://netlog-viewer.appspot.com/#import
- Key tabs: Events, Proxy, Timeline, DNS, Sockets, Cache
