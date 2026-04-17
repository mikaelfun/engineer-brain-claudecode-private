---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Context Based Redirection/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Context%20Based%20Redirection/Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Context Based Redirection - Support Boundaries & Troubleshooting

## Primary CSS Ownership (In Scope)

**Owning CSS Pod:** Windows Commercial User Experience (UEX)

**CSS is responsible for:**
- Understanding feature behavior of Context-Based Redirections in AVD and Windows 365
- Assisting customers with:
  - Verifying Conditional Access policy application
  - Validating Authentication Context claims
  - Confirming redirection enforcement (Clipboard, Drive, Printer, USB) in-session
- Using session diagnostics (client-side) and admin portals (Entra, Intune, AVD/W365)
- Determining whether issues are configuration-related, expected-by-design, or blocked by policy

CSS does NOT change or design Conditional Access logic; CSS validates correctness and outcome.

## Monitoring / Reporting

In-session Redirections details show:
- Clipboard: Enabled / Disabled
- Printer: Enabled / Disabled
- USB: Enabled / Disabled
- Drive: Enabled / Disabled

## CSS Action Plans

### Diagnose
1. Confirm client type (Web vs App)
2. Validate CA policy is block-based
3. Inspect token for expected acrs
4. Validate redirection interpretation rules

### Validate Expected Behavior
- Context present → redirection enabled
- Context missing → redirection disabled

### Mitigation
- Correct CA targeting
- Ensure all auth contexts are referenced by at least one CA policy
- Reconnect session

### Unsupported Paths
- Modifying redirections mid-session (Unsupported)
- Using allow-based CA policies (Not supported)

## Collaboration-Required Teams & Scenarios

### A. Microsoft Entra ID / Identity
**Engage when:**
- Authentication Context claims are not issued
- Conditional Access policies do not trigger or are evaluated unexpectedly
- Sign-in logs show missing or incorrect claim data

### B. Windows 365 Service / Intune Engineering
**Engage when:**
- Dynamic redirection settings are not selectable or not applied post-policy
- Intune Remote connection experience configuration does not reflect configured Authentication Contexts
- Expected redirection state is not enforced on Cloud PCs

### C. Azure Virtual Desktop (AVD) Engineering
**Engage when:**
- AVD Host Pool / RDP properties do not honor Authentication Context mappings
- Session behavior differs between W365 and AVD
- Redirection enforcement is inconsistent across hosts

### D. Windows App / Client Team (UEX Clients)
**Engage when:**
- Redirection behavior differs by client (Windows App, Web client, macOS/iOS)
- UI indicators (grayed-out options, messaging) do not match expected state

## Explicitly Out of Scope for CSS
- Design Conditional Access policies
- Modify Authentication Context definitions
- Override customer security intent

## Escalation Path
1. CSS engineer performs configuration validation and diagnostics
2. If issue persists: escalate via escalation process, engage owning engineering team depending on failure domain
3. Engineering provides guidance or confirms design behavior
