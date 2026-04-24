---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/use-netlog-capture-network-traffic
importDate: 2026-04-23
type: guide-draft
---

# Use NetLog to Capture Network Traffic for Entra ID Troubleshooting

Alternative to Fiddler and HAR captures for diagnosing network issues in Microsoft Entra authentication flows.

## Known Limitations
- POST request bodies are NOT captured
- Sites in IE compatibility mode are NOT captured

## Steps (Browser - Edge/Chrome)
1. Close all browser tabs except one
2. Navigate to `edge://net-export` (Edge) or `chrome://net-export` (Chrome)
3. Select "Include raw bytes (will include cookies and credentials)"
4. Leave Maximum log size blank
5. Click "Start Logging to Disk" and choose save location
6. Open new tab in same browser, reproduce the issue
7. Return to NetLog tab and click "Stop Logging"

## Mobile Devices
- Android: Works in Edge and Chrome
- iOS: Works in Chrome
- Email option available to send log

## Analysis
- Open NetLog Viewer: https://netlog-viewer.appspot.com/#import
- Key tabs: Events, Proxy, Timeline, DNS, Sockets, Cache
