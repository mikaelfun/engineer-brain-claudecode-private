---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Reserve - User Provisioning/Setup"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FReserve%20-%20User%20Provisioning%2FSetup"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reserve - User Provisioning Setup Guide

## Enable user provisioning (admin steps)

User self-provisioning is off by default and must be explicitly enabled by an administrator. Managed in Microsoft Intune, scoped to specific users using Microsoft Entra ID groups.

1. Sign in to Intune admin center > Devices > Windows 365 > Settings
2. Select Create > Windows App settings (preview)
3. Enter Name and Description, select Next
4. Under User self-service actions, toggle "Enable users to provision new Cloud PC instances" to Enabled. Only applies to users with Reserve provisioning policy and license. Select Next.
5. [Optional] Apply Scope Tags. Select Next.
6. Under Assignments, Add groups and select target Entra user groups. Select > Next.
7. Review and select Create.

## End-user experience

1. Log in to Windows App
2. Click device card "Set up my Cloud PC"
3. Consent prompt appears with setup duration notice. Select "Begin Set Up"
4. Device card shows spinning status during provisioning. Notification when complete.
5. Click device card to connect once provisioned.
6. Return from Windows App when done.
7. If access time remaining, card returns to deprovisioned state - can provision again.
