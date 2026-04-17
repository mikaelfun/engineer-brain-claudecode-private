---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Link/Components/Intune/Change Screen Timeout Setting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Link/Components/Intune/Change%20Screen%20Timeout%20Setting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Change Windows 365 Link Screen Timeout Setting via Intune

Uses the same Power Policy CSP as other Windows devices:
[Power Policy CSP | Microsoft Learn](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-power#displayofftimeoutpluggedin)

## Steps to Create Intune Policy

1. Create a new configuration policy: Devices → Configuration → Create → New Policy
2. Platform: Windows 10 and later
3. Profile type: Settings catalog
4. Name: Windows 365 Screen Timeout (or preferred name)
5. Description: a description of your choosing
6. Configuration settings: Search for "video and display settings" and choose "Turn off the display (plugged in)". Set the value (in seconds) before the display turns off.
7. Assignment: Target only Windows 365 Link devices using "add all devices" with an Include filter using the Windows 365 device filter.
8. Review and Create: click Create to create the policy
