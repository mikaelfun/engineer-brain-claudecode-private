---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/SxSStack/AVD Listener Check"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/465058"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AVD Listener Check (SxSStack Health Check)

## Determine if WVD listener and RDP listener is working on local computer
- Open command prompt as administrator and enter command: `qwinsta`
   - If you see rdp-sxs the WVD listener is working
   - If you see rdp-tcp the RDP listener is working

## Determine if WVD listener and RDP listener is working on remote computer
- Open PowerShell as administrator and enter commands
   ```
   Enter-PSSession -ComputerName <computer name>
   ```
   ```   
   qwinsta
   ```
   - If you see rdp-sxs listened the RDP listener is working
   - If you see rdp-tcp the RDP listener is working

## Solutions

### Windows 10 1809, 1903, or 1909
Go to Program and Features and verify following are installed. You may see multiple instances.
- Remote Desktop Agent Boot Loader
- Remote Desktop Services Infrastructure Agent
- Remote Desktop Services Infrastructure Geneva Agent
- Remote Desktop Services SxS Network stack

### Windows 10 2004+
- Verify fReverseConnectMode is set to 1
   - Login to VM -> open registry and navigate to `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\rdp-sxs`
   - Verify fReverseConnectMode is set to 1
   - If set to 0 change to 1 and reboot VM

- Go to Program and Features and verify following are installed. You may see multiple instances.
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Note: Starting in Windows 10 2004 WVD stack is built into OS so don't need to install SxS network stack.

- If WVD applications are missing see: Reinstalling WVD Agent Applications
