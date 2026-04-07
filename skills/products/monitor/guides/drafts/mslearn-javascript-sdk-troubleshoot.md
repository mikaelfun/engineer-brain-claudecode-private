# Application Insights JavaScript SDK Troubleshooting

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/javascript-sdk-troubleshooting
> Quality: guide-draft | 21vApplicable: true

## SDK LOAD Failure

Exception: `SDK LOAD Failure: Failed to load Application Insights SDK script`

### Cause Analysis

| # | Cause | Likelihood | Fix |
|---|-------|-----------|-----|
| 1 | Intermittent network | Most common (mobile) | Auto-resolves on refresh; CDN caching helps |
| 2 | CDN outage | Rare | Test CDN endpoint directly; create support ticket |
| 3 | SDK init failure | Config issue | Check DevTools Network/Console tabs |
| 4 | CDN blocked | Corporate/security | Whitelist endpoints or self-host |

### Diagnostic Steps

1. **Network tab** (F12): verify SDK script download -> 200/304
2. **Console tab**: check for JavaScript exceptions from `ai.2.min.js`
3. **Minimal config test**:
```js
cfg: { instrumentationKey: "<guid>" }
```
4. **Enable console logging**:
```js
cfg: { instrumentationKey: "<guid>", loggingLevelConsole: 2 }
```
5. **Debug mode** (dev only!):
```js
cfg: { instrumentationKey: "<guid>", enableDebug: true }
// Use unminified: ai.2.js instead of ai.2.min.js
```

### CDN Blockage Resolution

- Check: [Google Transparency Report](https://transparencyreport.google.com/safe-browsing/search), [VirusTotal](https://www.virustotal.com/gui/home/url), [Sucuri](https://sitecheck.sucuri.net/)
- User blockers: whitelist `js.monitor.azure.com` in browser/plugin/firewall
- Corporate firewall: IT adds CDN endpoints to allowlist
- Self-host SDK: host `ai.2.#.#.min.js` on own CDN
- npm packages: embed SDK in application bundle (best for corporate environments)

## Source Map Support

| Issue | Fix |
|-------|-----|
| RBAC | Assign Storage Blob Data Reader on blob container |
| Source map not found | Verify uploaded to correct container; filename = `{jsfile}.map` |

## Click Analytics Plugin

Warning: "Click Event rows with no parentId value"

**Fix**: Add `data-parentid` or `data-<prefix>-parentid` attribute to parent HTML element:
```html
<div data-heart-id="demo Header" data-heart-parentid="demo.Header">
```
