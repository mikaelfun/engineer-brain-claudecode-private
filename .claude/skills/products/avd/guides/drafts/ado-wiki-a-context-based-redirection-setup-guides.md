---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Context Based Redirection/Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FContext%20Based%20Redirection%2FSetup%20Guides"
importDate: "2026-04-06"
type: troubleshooting-guide
topic: Context Based Redirection (CBR) — Setup
---

# Context Based Redirection — Setup Guide

## Optional Preparation

Create a group in Azure Portal and add the required members to the group.

---

## Configure Conditional Access

Associate Conditional Access policies with specific authentication context claims, and ensure policies target correct users / groups.

1. Search **Conditional Access** in the search bar.
2. Navigate to **Conditional Access > Manage > Authentication Context > New Authentication context**.
3. Create and assign authentication context claims (e.g., C1, C2).
4. Create CA policies targeting these authentication contexts with **block-based** policy configuration.

> ⚠️ **Important**: Only block-based CA policies are supported. Allow-based CA policies are not supported for Context Based Redirection.

---

## Configure AVD Hostpool and VM

Configure the AVD host pool settings to enable Context Based Redirection:

1. In the Azure Portal, navigate to the target **Host Pool**.
2. Update **RDP Properties** to include the appropriate redirection settings.
3. Ensure VM is configured to enforce redirection policies from session host side.

---

## AVD Redirection Settings

Set the relevant redirection properties in the host pool:

- **Clipboard redirection** — enable/disable
- **Drive redirection** — enable/disable
- **Printer redirection** — enable/disable
- **USB redirection** — enable/disable

---

## Configure CPC Redirection Settings (Windows 365)

For Windows 365 environments, configure via **Intune Remote connection experience**:

1. Navigate to Intune.
2. Configure the Remote connection experience settings.
3. Assign authentication contexts to the relevant redirection policies.

---

## Validate Redirection Settings When Connected

After connecting to the session, verify the in-session redirection details:

- Clipboard: Enabled / Disabled
- Printer: Enabled / Disabled
- USB: Enabled / Disabled
- Drive: Enabled / Disabled

> Expected behavior:
> - Authentication context **present** → redirection **enabled**
> - Authentication context **missing** → redirection **disabled**
