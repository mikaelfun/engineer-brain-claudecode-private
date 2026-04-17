# AVD USB 与外设重定向 — 排查工作流

**来源草稿**: ado-wiki-a-drag-drop-setup.md, ado-wiki-a-drag-drop-troubleshooting.md, ado-wiki-b-com-port-redirection.md, ado-wiki-b-remotefx-device-redirection-in-avd-session.md, ado-wiki-b-usb-drive-redirection.md, ado-wiki-b-usb-redirection.md
**Kusto 引用**: (无)
**场景数**: 27
**生成日期**: 2026-04-07

---

## Scenario 1: [[_TOC_]]
> 来源: ado-wiki-a-drag-drop-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Here are the redirection settings you can configure in Windows App in a web browser.

### Folder redirection
------------------
When using the Windows App in a web browser, you can transfer files between your local device and your remote session using either theUpload/Download foldersordrag-and-dropfunctionality. A redirected folder appears as a network drive in File Explorer within your remote session. Your administrator may control whether file transfer is enabled.

## Scenario 2: Accessing the Redirected Drive:
> 来源: ado-wiki-a-drag-drop-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to Windows App using your web browser.
1. Connect to a device or app.
1. Once your remote session starts, open**File Explorer**and selectThis PC.
1. There's a redirected drive called**Remote virtual Drive** on **RDWebClient**for Azure Virtual Desktop and**Windows365 virtual drive** on **RDWebClient**. Inside this drive, youll find two folders:
   - **Uploads** Contains files uploaded from your local device.
   - **Downloads** Files placed here will be downloaded to your local device via your browser.

## Scenario 3: Uploading Files from Local to Remote:
> 来源: ado-wiki-a-drag-drop-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
You can upload files in two ways:

##### Option 1: Drag and Drop:
Drag files directly from your local device into the remote session window. These files will automatically appear in theUploadsfolder in the virtual drive.
**Note:** You cannot drag files to a specific location in the remote session, all files will automatically appear in the Uploads folder.

##### Option 2: Upload Button:
1. Select the**Upload files**icon (upward arrow) on the session toolbar. Selecting this icon opens a file explorer window on your local device.
1. Browse and select files you want to upload to the remote session. You can select multiple files by holding down the_CTRL_key on your keyboard for Windows, or the_Command_key for macOS, then selectOpen.
1. Uploaded files will appear in theUploadsfolder.
**Note:** There's a file size limit of 255MB for all file uploads.

##### Downloading Files from Remote to Local:
1. Copy and paste files to the**Downloads**folder.
1. Before the paste can be completed, Windows App prompts you**Do you want to download files to local desktop**? Select**Yes**. Your browser downloads the files in its normal way. If you don't want to see this prompt every time you download files from the current browser, check the box for**Dont ask me againbefore confirming**.
**Note:** We recommend usingCopyrather thanCutwhen downloading files from your remote session to your local device as if there's an issue with the network connection, it can cause the files to be lost.
Uploaded files are available in theUploadsfolder until you sign out of Windows App.
Don't download files directly from your browser in a remote session to theDownloadsfolder as it triggers your local browser to download the file before it is ready. Download files in a remote session to a different folder, then copy and paste them to theDownloadsfolder.

## Scenario 4: Via ASC
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - In ASC go to Resource Explorer -> Expand Microsoft.DesktopVirtualization -> select host pool
   - Confirm `redirectcomports:i:1` is present

## Scenario 5: Via Azure Portal
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Go to host pool -> RDP Properties -> Device Redirection tab
   - Confirm COM Port redirection is enabled
   - Check Advanced tab for `redirectcomports:i:1`

## Scenario 6: Via RDP file
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Windows Client**: Navigate to `C:\Users\%username%\AppData\Local\rdclientwpf\<hostpool id>\` -> open RDP file -> confirm `redirectcomports:i:1`
   - **Web Client**: Login -> Settings -> Download RDP file -> open in notepad -> confirm `redirectcomports:i:1`

## Scenario 7: Via GPResult
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Run `gpresult /H <path>\gpresult.html` on the session host
   - Confirm "Do not allow COM port redirection" is NOT set to Disabled

## Scenario 8: Via MSRD-Collect
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Collect MSRD-Collect -> navigate to `_SystemInfo` folder -> open `_Gpresult.html`
   - Confirm "Do not allow COM port redirection" is NOT disabled

## Scenario 9: Via Registry
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Check `HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services`
   - Confirm `fDisableCcm` is NOT set to 0

## Scenario 10: 3. Confirm COM device is recognized on local computer
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Open Device Manager on the local machine
   - Verify COM port is NOT COM1 or COM2 (must be COM3 or above)
   - If COM1/COM2, change to COM3+
   - Unplug and replug device to verify COM port assignment is stable

## Scenario 11: 4. Confirm COM device is getting redirected
> 来源: ado-wiki-b-com-port-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Login to AVD session -> Open command prompt
   - Run `change port /query`
   - If COM port was redirected, it will show the redirected port mapping

## Scenario 12: RemoteFX Device Redirection in AVD Session
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
For USB redirection configuration, also see the comprehensive [USB Redirection guide](ado-wiki-b-usb-redirection.md).

## Scenario 13: Step 1: Disable PnP Redirection on the AVD VM (Target machine)
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Server SKU: must have RDSH role installed. Client SKU: must be Professional/Enterprise. Windows 10 Enterprise for Virtual Desktops supports USB redirection.
2. Enable GPO for USB redirection (run `gpedit.msc` elevated):
   - Navigate to: `Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Device and Resource Redirection\Do not allow supported Plug and Play device redirection`
   - Set to **Disabled** (this policy also controls PNP redirection)
3. Run `gpupdate /force` from elevated command prompt

## Scenario 14: Step 2: Enable USB redirection on the Local Machine (Destination Machine)
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**NOTE**: Requires Pro or Enterprise SKU. Home SKU is NOT supported (no group policy management).
1. Run `gpedit.msc` elevated
2. Navigate to: `Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Connection Client\RemoteFX USB Device Redirection\Allow RDP redirection of other supported RemoteFX USB devices from this computer`
3. Set to **Enabled**, choose RemoteFX USB Redirection Access Rights to **Administrators and Users**
4. Reboot the machine

## Scenario 15: Step 3: Confirm Device is Supported
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Attach USB device to client machine
2. Open `mstsc.exe` > Show Options > Local Resources > More...
3. Check if device appears under **Other supported RemoteFX USB devices**
**Important**:
   - If GPO enabled but device not showing under "Other supported RemoteFX USB devices" = device not supported, engage device vendor
   - If GPO enabled and "Other supported RemoteFX USB devices" category missing = device not supported

## Scenario 16: Step 4: Verify RDP property
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Set the following RDP property for proper redirection:
   - `audiomode:i:1`

## Scenario 17: Step 5: Test in AVD session
> 来源: ado-wiki-b-remotefx-device-redirection-in-avd-session.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Redirected USB device should appear in session or published app
   - If device not recognized, install device driver on remote machine
   - On connection bar, click computer icon to select the device (wait 1-2 minutes for system update)

## Scenario 18: Limitations
> 来源: ado-wiki-b-usb-drive-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Available for **Windows App on Windows 10+ clients** for AVD full desktop only
   - Supported on Win 10 & Win 11 Session hosts
   - **NOT available** for: Web Client, MacOS, Linux, Android, MSTSC
   - **NOT supported** for RemoteApp scenarios

## Scenario 19: Setup Steps
> 来源: ado-wiki-b-usb-drive-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Configure USB redirection first per [Public Doc](https://learn.microsoft.com/en-us/azure/virtual-desktop/redirection-configure-usb) and the USB Redirection wiki page
2. Set RDP properties via Azure web UI or PowerShell: `RedirectUsbDrive:i:1`

## Scenario 20: Verify USB Storage Redirection Working
> 来源: ado-wiki-b-usb-drive-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Login to target session host
2. Plug in a USB storage device (e.g., USB stick) to local Windows endpoint
3. Launch File Explorer in remote session > navigate to "This PC"
4. Validate USB device is registered as a **removable disk** rather than network drive
   - Correct: shows as removable disk
   - Incorrect: shows as redirected drive (if not set correctly)

## Scenario 21: Troubleshooting
> 来源: ado-wiki-b-usb-drive-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Confirm USB redirection works per the USB Redirection guide
2. Check if RDP property `RedirectUsbDrive` is applied as expected from Kusto client trace logs
3. Before escalation to PG, collect [TraceRDS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/816880/TraceRDS) logs
4. Telemetry in RDClient Kusto trace under task name "USBRedirection":
   - `LogClientEvent(m_spCoreApi, L"USBRedirection", L"The first time a thumb drive redirected via USB redirection");`
   - `L"_dwRedirectThumbDriveAsUSB = %d, _bDynamicThumbDriveDisabled = %d"`

## Scenario 22: Resources
> 来源: ado-wiki-b-usb-drive-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [QA Training](https://platform.qa.com/learning-paths/azure-virtual-desktop-avd-feature-usb-drive-redirection-1854-16521/)

## Scenario 23: Step 1: Enable USB redirection on the host pool
> 来源: ado-wiki-b-usb-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Set RDP property via Azure web UI or PowerShell:
   - All supported devices: `usbdevicestoredirect:s:*`
   - Specific device class: `usbdevicestoredirect:s:{ClassGUID}`
   - See [RDP file entries for USB redirection](https://techcommunity.microsoft.com/t5/microsoft-security-and/introducing-microsoft-remotefx-usb-redirection-part-2/ba-p/247060)

## Scenario 24: Step 2: Disable PnP Redirection on the AVD VM
> 来源: ado-wiki-b-usb-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Server SKU: must have RDSH role installed. Client SKU: must be Professional/Enterprise.
2. GPO (`gpedit.msc` elevated):
   - `Local Computer Policy\Computer Configuration\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Device and Resource Redirection\Do not allow supported Plug and Play device redirection` = **Disabled**
3. Reboot the machine

## Scenario 25: Step 3: Enable USB redirection on the client machine
> 来源: ado-wiki-b-usb-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**NOTE**: Requires Pro or Enterprise SKU. Home SKU NOT supported.
1. GPO (`gpedit.msc` elevated):
   - `Computer Policy\...\Remote Desktop Connection Client\RemoteFX USB Device Redirection\Allow RDP redirection of other supported RemoteFX USB devices from this computer` = **Enabled**
   - Set access rights to **Administrators and Users**
2. Run `gpupdate /force`
3. Reboot

## Scenario 26: Step 4: Confirm Device Support
> 来源: ado-wiki-b-usb-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Attach USB device to client
2. `mstsc.exe` > Show Options > Local Resources > More...
3. Device must appear under **Other supported RemoteFX USB devices**
**If device not showing**: Device not supported; engage device vendor.

## Scenario 27: Important Notes
> 来源: ado-wiki-b-usb-redirection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **USB redirection is designed for LAN scenarios**. Redirecting over Internet requires high-speed, low-latency network.
2. [Officially supported devices](https://techcommunity.microsoft.com/t5/microsoft-security-and/introducing-microsoft-remotefx-usb-redirection-part-3/ba-p/247085):
   - Some categories explicitly blocked: USB network adapter, USB keyboard
   - USB composite devices containing blocked interfaces (e.g., RFID reader with HID keyboard) cannot be redirected
3. **Driver issues**: Device appears in session but doesn't work properly - contact device vendor for updated drivers compatible with redirected USB devices.
   - Symptom especially on EVD/Server SKU but not Client SKU: caused by session 0 access check enforcement (`IoEnableSessionZeroAccessCheck = 1` set by RDSH role). Changing to 0 can verify the theory.
   - Redirected USB devices have longer instanceID than local instanceID.
4. **USB drives**: By default redirected at high-level drive redirection. For low-level USB redirection (BitLocker/Encryption/CD burn), see [this doc](https://docs.microsoft.com/en-us/troubleshoot/windows-client/remote/usb-devices-unavailable-remotefx-usb-redirection).
