---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Device Redirection/USB Drive Redirection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FDevice%20Redirection%2FUSB%20Drive%20Redirection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# USB Drive Redirection (as Removable Drive)

## About this feature

This feature redirects USB storage (USB stick) as **removable drives** instead of redirected drives and folders.

## Limitations

- Available for **Windows App on Windows 10+ clients** for AVD full desktop only
- Supported on Win 10 & Win 11 Session hosts
- **NOT available** for: Web Client, MacOS, Linux, Android, MSTSC
- **NOT supported** for RemoteApp scenarios

## Setup Steps

1. Configure USB redirection first per [Public Doc](https://learn.microsoft.com/en-us/azure/virtual-desktop/redirection-configure-usb) and the USB Redirection wiki page
2. Set RDP properties via Azure web UI or PowerShell: `RedirectUsbDrive:i:1`

## Verify USB Storage Redirection Working

1. Login to target session host
2. Plug in a USB storage device (e.g., USB stick) to local Windows endpoint
3. Launch File Explorer in remote session > navigate to "This PC"
4. Validate USB device is registered as a **removable disk** rather than network drive
   - Correct: shows as removable disk
   - Incorrect: shows as redirected drive (if not set correctly)

## Troubleshooting

1. Confirm USB redirection works per the USB Redirection guide
2. Check if RDP property `RedirectUsbDrive` is applied as expected from Kusto client trace logs
3. Before escalation to PG, collect [TraceRDS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/816880/TraceRDS) logs
4. Telemetry in RDClient Kusto trace under task name "USBRedirection":
   - `LogClientEvent(m_spCoreApi, L"USBRedirection", L"The first time a thumb drive redirected via USB redirection");`
   - `L"_dwRedirectThumbDriveAsUSB = %d, _bDynamicThumbDriveDisabled = %d"`

## Resources

- [QA Training](https://platform.qa.com/learning-paths/azure-virtual-desktop-avd-feature-usb-drive-redirection-1854-16521/)
