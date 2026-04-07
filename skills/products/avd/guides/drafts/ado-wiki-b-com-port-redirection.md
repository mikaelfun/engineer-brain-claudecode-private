---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Device Redirection/COM Port Redirection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/499716"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# COM Port Redirection Troubleshooting

## 1. Confirm COM port redirection is enabled in host pool

### Via ASC
- In ASC go to Resource Explorer -> Expand Microsoft.DesktopVirtualization -> select host pool
- Confirm `redirectcomports:i:1` is present

### Via Azure Portal
- Go to host pool -> RDP Properties -> Device Redirection tab
- Confirm COM Port redirection is enabled
- Check Advanced tab for `redirectcomports:i:1`

### Via RDP file
- **Windows Client**: Navigate to `C:\Users\%username%\AppData\Local\rdclientwpf\<hostpool id>\` -> open RDP file -> confirm `redirectcomports:i:1`
- **Web Client**: Login -> Settings -> Download RDP file -> open in notepad -> confirm `redirectcomports:i:1`

## 2. Confirm COM port redirection is NOT disabled on VM

### Via GPResult
- Run `gpresult /H <path>\gpresult.html` on the session host
- Confirm "Do not allow COM port redirection" is NOT set to Disabled

### Via MSRD-Collect
- Collect MSRD-Collect -> navigate to `_SystemInfo` folder -> open `_Gpresult.html`
- Confirm "Do not allow COM port redirection" is NOT disabled

### Via Registry
- Check `HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services`
- Confirm `fDisableCcm` is NOT set to 0

## 3. Confirm COM device is recognized on local computer
- Open Device Manager on the local machine
- Verify COM port is NOT COM1 or COM2 (must be COM3 or above)
- If COM1/COM2, change to COM3+
- Unplug and replug device to verify COM port assignment is stable

## 4. Confirm COM device is getting redirected
- Login to AVD session -> Open command prompt
- Run `change port /query`
- If COM port was redirected, it will show the redirected port mapping
