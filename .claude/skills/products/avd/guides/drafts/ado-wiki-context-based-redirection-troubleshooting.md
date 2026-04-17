---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Context Based Redirection/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Context%20Based%20Redirection/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Context Based Redirection - Troubleshooting

## Monitoring / Reporting

In-session Redirections details show:
- Clipboard: Enabled / Disabled
- Printer: Enabled / Disabled
- USB: Enabled / Disabled
- Drive: Enabled / Disabled

## CSS Action Plans

### Diagnose

- Confirm client type (Web vs App).
- Validate CA policy is block-based.
- Inspect token for expected acrs.
- Validate redirection interpretation rules.

### Validate expected behavior

- Context present → redirection enabled.
- Context missing → redirection disabled.

### Mitigation

- Correct CA targeting.
- Ensure all auth contexts are referenced by at least one CA policy.
- Reconnect session.

### Unsupported paths

- Modifying redirections mid-session (Unsupported).
- Using allow-based CA policies (Not supported).
