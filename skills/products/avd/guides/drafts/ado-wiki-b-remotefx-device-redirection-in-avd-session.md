---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Device Redirection/RemoteFX Device Redirection in AVD Session"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FDevice%20Redirection%2FRemoteFX%20Device%20Redirection%20in%20AVD%20Session"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RemoteFX Device Redirection in AVD Session

For USB redirection configuration, also see the comprehensive [USB Redirection guide](ado-wiki-b-usb-redirection.md).

## Step 1: Disable PnP Redirection on the AVD VM (Target machine)

1. Server SKU: must have RDSH role installed. Client SKU: must be Professional/Enterprise. Windows 10 Enterprise for Virtual Desktops supports USB redirection.
2. Enable GPO for USB redirection (run `gpedit.msc` elevated):
   - Navigate to: `Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Device and Resource Redirection\Do not allow supported Plug and Play device redirection`
   - Set to **Disabled** (this policy also controls PNP redirection)
3. Run `gpupdate /force` from elevated command prompt

## Step 2: Enable USB redirection on the Local Machine (Destination Machine)

**NOTE**: Requires Pro or Enterprise SKU. Home SKU is NOT supported (no group policy management).

1. Run `gpedit.msc` elevated
2. Navigate to: `Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Connection Client\RemoteFX USB Device Redirection\Allow RDP redirection of other supported RemoteFX USB devices from this computer`
3. Set to **Enabled**, choose RemoteFX USB Redirection Access Rights to **Administrators and Users**
4. Reboot the machine

## Step 3: Confirm Device is Supported

1. Attach USB device to client machine
2. Open `mstsc.exe` > Show Options > Local Resources > More...
3. Check if device appears under **Other supported RemoteFX USB devices**

**Important**:
- If GPO enabled but device not showing under "Other supported RemoteFX USB devices" = device not supported, engage device vendor
- If GPO enabled and "Other supported RemoteFX USB devices" category missing = device not supported

## Step 4: Verify RDP property

Set the following RDP property for proper redirection:
- `audiomode:i:1`

## Step 5: Test in AVD session

- Redirected USB device should appear in session or published app
- If device not recognized, install device driver on remote machine
- On connection bar, click computer icon to select the device (wait 1-2 minutes for system update)
