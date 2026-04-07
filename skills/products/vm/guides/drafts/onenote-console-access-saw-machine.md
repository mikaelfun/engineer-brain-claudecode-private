# Console Access via SAW Machine in Mooncake

> Source: MCVKB 2.29.1 (new vmconnect) + 2.29.2 (old vmconnect)
> Applicability: Mooncake (21V) only - SAVM does not support Sovereign Clouds

## Prerequisites (usually ~1 week)

1. **SAW Silo Membership**: Visit https://sasweb.microsoft.com → Join Silo(s) → Organization: CloudEnterprise
2. **Physical Smart Card**: Apply via GSAM Self Service Portal (https://aka.ms/gsamssp) → New Request → Badge Management → Chip Only Smart Card
3. **CME Card**: Follow CME Permission and MSODS access steps 1-4

## Console Steps (New vmconnect - ~15-30 min)

1. Insert smartcard/badge into physical SAW machine, login with Corp account
2. Launch Teams on SAW with Corp account
3. File ICM if no existing one: Impacted Services: Azure Incident Management China - China/Gallatin, Owning team: WATS
4. Request JIT Access at https://jitaccess.security.core.chinacloudapi.cn/ with CME account (CME\alias)
   - Connect SAW VPN only (not PULSE) at this step
   - Complete MFA with smartcard
   - Wait for "Granted" status
5. Download RDP file (jumpbox) and RDG file (host node) from JIT portal
6. Find primary fabric controller IP in Azure Support Center
7. Connect PULSE VPN, then RDP to jumpbox using the .RDP file with CME password
8. Copy .RDG file into jumpbox (do NOT open on SAW)
9. Open .RDG with RDCM on jumpbox, login to node
10. Run on node (type manually, no paste support):
    ```
    D:\Data\HostOsDriTools\VMConnect.cmd -ci:<FC VIP> -vn:<ContainerId>
    ```
11. Copy generated RDP file content, save as .rdp on jumpbox
12. Get credentials from RDG file (note HTML entity decoding: `&amp;` → `&`, `&gt;` → `>`, etc.)
13. Open generated RDP file with credentials to access VM console

## Old vmconnect Method

Similar steps 1-9, then:
- Run `D:\vmconnect\vmconnect.cmd` (or check version dir `v4.0.30319`)
- Select VM container ID from dropdown, click OK

## Important Rules

- Customer must be in live Teams meeting monitoring all operations
- All operations recorded after customer joins
- Log off all guest servers before customer leaves
- Ensure you are logged into the correct guest OS
- Use Ctrl+Alt+End (via on-screen keyboard osk.exe) instead of Ctrl+Alt+Del

## Known Issues

- Random connection failures from jumpbox to host node (IcM 347323409) - try nested Hyper-V troubleshooting first, console as last resort
