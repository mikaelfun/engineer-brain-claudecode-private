---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/YubiKey MID"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FYubiKey%20MID"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# YubiKey MID Setup

Guide for loading MID certificates onto YubiKey security key.

Reference: https://aka.ms/SecurityKeySetup

## Enroll Instructions

1. Log into Edge browser (inside remote desktop) with MID account (`alias@microsoftsupport.com`)
2. Navigate to **https://mysignins.microsoft.com/security-info**
3. Click **+ Add sign-in Method** → **Security Key**
4. Click **Next** → Select **USB Device** → Click **Next**
5. **Connect the YubiKey to a USB port** (extended ports not allowed; USB hubs and docking stations work)
6. Select "**Security key**" option
7. Click **Ok** twice when prompted
8. Enter PIN (minimum 6 digits) **twice** → click **OK**
9. **Touch the security key twice** when prompted
10. Enter name `<UPN> <Model>` → click **Next**
11. Click **Done** when "You're all set!" message appears

## Help

- New MID account or restore deprovisioned account: https://aka.ms/visops
- Assist issues: https://aka.ms/AssistFAQ or https://aka.ms/assistdesk
