---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Device Redirection/USB Redirection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FDevice%20Redirection%2FUSB%20Redirection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# USB Redirection for AVD/WVD

## Step 1: Enable USB redirection on the host pool

- Set RDP property via Azure web UI or PowerShell:
  - All supported devices: `usbdevicestoredirect:s:*`
  - Specific device class: `usbdevicestoredirect:s:{ClassGUID}`
- See [RDP file entries for USB redirection](https://techcommunity.microsoft.com/t5/microsoft-security-and/introducing-microsoft-remotefx-usb-redirection-part-2/ba-p/247060)

## Step 2: Disable PnP Redirection on the AVD VM

1. Server SKU: must have RDSH role installed. Client SKU: must be Professional/Enterprise.
2. GPO (`gpedit.msc` elevated):
   - `Local Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Device and Resource Redirection\Do not allow supported Plug and Play device redirection` = **Disabled**
3. Reboot the machine

## Step 3: Enable USB redirection on the client machine

**NOTE**: Requires Pro or Enterprise SKU. Home SKU NOT supported.

1. GPO (`gpedit.msc` elevated):
   - `Computer Policy\...\Remote Desktop Connection Client\RemoteFX USB Device Redirection\Allow RDP redirection of other supported RemoteFX USB devices from this computer` = **Enabled**
   - Set access rights to **Administrators and Users**
2. Run `gpupdate /force`
3. Reboot

## Step 4: Confirm Device Support

1. Attach USB device to client
2. `mstsc.exe` > Show Options > Local Resources > More...
3. Device must appear under **Other supported RemoteFX USB devices**

**If device not showing**: Device not supported; engage device vendor.

## Step 5: Test in AVD session

- Redirected USB device should appear in session
- If not recognized, install device driver on remote machine

## Important Notes

1. **USB redirection is designed for LAN scenarios**. Redirecting over Internet requires high-speed, low-latency network.
2. [Officially supported devices](https://techcommunity.microsoft.com/t5/microsoft-security-and/introducing-microsoft-remotefx-usb-redirection-part-3/ba-p/247085):
   - Some categories explicitly blocked: USB network adapter, USB keyboard
   - USB composite devices containing blocked interfaces (e.g., RFID reader with HID keyboard) cannot be redirected
3. **Driver issues**: Device appears in session but doesn't work properly - contact device vendor for updated drivers compatible with redirected USB devices.
   - Symptom especially on EVD/Server SKU but not Client SKU: caused by session 0 access check enforcement (`IoEnableSessionZeroAccessCheck = 1` set by RDSH role). Changing to 0 can verify the theory.
   - Redirected USB devices have longer instanceID than local instanceID.
4. **USB drives**: By default redirected at high-level drive redirection. For low-level USB redirection (BitLocker/Encryption/CD burn), see [this doc](https://docs.microsoft.com/en-us/troubleshoot/windows-client/remote/usb-devices-unavailable-remotefx-usb-redirection).
