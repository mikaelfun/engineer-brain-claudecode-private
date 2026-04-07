---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/Authentication/Captive Portal/Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAuthentication%2FCaptive%20Portal%2FSetup%20Guides"
importDate: "2026-04-06"
type: setup-guide
---

## Additional Private/Public Preview steps

- Minimum Windows App version 2.0.916.0.
- Set these reg keys in CMD as Administrator:

```cmd
reg ADD "HKCU\SOFTWARE\Microsoft\Windows365" /v ProviderRedirectionForBoot /t REG_DWORD /d 1 /F
reg ADD "HKCU\SOFTWARE\Microsoft\Windows365" /v EnableShowCaptivePortal /t REG_DWORD /d 1 /F
```

- When testing disconnect your device from internet connection and follow the steps in the next section.

## Regular Steps at GA

1. Sign in to your Windows 365 Boot device.
2. When network loss is detected, an error dialog appears indicating that the user needs to connect to the internet to login to their Cloud PC.
3. Select **Open network settings**.
4. In Quick Settings, select the Wi-Fi icon, choose the appropriate network, and select **Connect**.
5. When prompted, select **Open browser** to launch the captive portal page.
6. Complete the network's sign-in or acceptance steps.
