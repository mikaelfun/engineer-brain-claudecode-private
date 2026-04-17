---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Protection/WIP"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Protection%2FWIP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows Information Protection (WIP) — Troubleshooting Guide

## About WIP

Windows Information Protection (WIP) helps protect enterprise apps and data against accidental data leak on enterprise-owned and personal devices. WIP is embedded in Windows and uses EnterpriseDataProtection, Policy-NetworkIsolation and AppLocker CSPs.

**Key concepts:**
- WIP is NOT DLP or IRM — it prevents accidental leakage, not deliberate exfiltration
- Two flavors: WIP with MDM (device enrolled) and WIP with MAM (without enrollment)
- Four modes: Block, Allow Overrides, Silent, Off
- Apps: Enlightened (can differentiate corporate/personal) vs Unenlightened (treats everything as corporate)

## Support Boundaries

Intune supports policy configuration and delivery to devices.

**If configuration settings are successfully written to the device, it is NOT an Intune problem!**

Transfer targets:
- EFS service issues → Windows UEX team
- DRA certificate issues → Windows Directory Services team
- Azure RMS issues → Azure Identity team
- Network configuration → Windows Networking team

## Scoping Questions

1. WIP mode: MDM or MAM?
2. Windows 10 version
3. Number of impacted users/devices
4. When did the issue start?
5. Has this worked before?
6. User licenses assigned
7. All apps or specific app impacted?
8. Behavior description or error message (with screenshots)
9. Reproducible or intermittent?
10. Any workarounds available?

## Troubleshooting Flow

### 1. Verify Policy Configuration
- Review policy type (with/without enrollment) in MEM portal
- Generate App protection report: Apps → Monitor → App protection status
- Check RAVE for WIP with enrollment policies

### 2. Verify Device Prerequisites
- Windows 10 version compatibility
- MDM: device synced with Intune; MAM: device Azure AD registered
- WIP WE uses port 444/TCP — verify firewall allows it
- Licenses: Intune license required; MAM also needs Azure AD Premium

### 3. Verify Policy Delivery to Device
- Generate MDM diagnostic report
- Check registry keys:
  - `HKLM\Software\Microsoft\Provisioning\Evaluator\PostProcess\EDP`
  - `HKLM\Software\Microsoft\EnterpriseResourceManager\Tracked\<id>\device\default`
  - `HKEY_LOCAL_MACHINE\software\microsoft\enterprisedataprotection\policies`
  - `HKLM\Software\Microsoft\PolicyManager\providers\<id>\default\device\DataProtection`
  - `HKLM\Software\Microsoft\PolicyManager\providers\<id>\default\device\NetworkIsolation`
- Verify AppLocker XML at: `C:\Windows\System32\AppLocker\MDM\GUID\8E20DDE6-26B0-4432-8566-77AACA2AEBC4\AppLocker\EnterpriseDataProtection`

### 4. Verify App and File Context
- Task Manager → Details tab → "Enterprise Context" column
- Contexts: Personal, Exempt, Unenlightened, Enlightened, Enlightened (permissive)
- If context is wrong → verify app identity and version in WIP policy

### 5. Device Logs
- **EDP-AppLearning**: Event ID 401 — non-protected apps accessing corporate data
- **DeviceManagement-Enterprise-Diagnostics-Provider/Admin**: Event ID 404 — policy apply failures
- **Kusto**: DeviceManagementProvider table for CSP delivery status

### 6. Common Issues

#### Direct Access conflicts with WIP
- Error: 0x807C0003 on EDPEnforcementLevel CSP
- Cause: Direct Access enabled on device
- Fix: Disable Direct Access or check EDP CSP pre-check errors

#### File encryption fails
- Check EFS service is running
- Check `HKLM\Software\Policies\Microsoft\Windows NT\CurrentVersion\EFS\EfsConfiguration` — value 1 means GPO disabled EFS
- Check DRA certificate expiration

#### DFS namespace not corporate
- DFS namespace (\\domain.name) fails but FQDN (\\fileserver.domain.name) works
- Fix: Add IP address range for DFS namespace servers in addition to domain name

#### Non-standard network stack apps blocked
- Firefox, Chrome, WhatsApp use IP instead of FQDN
- Fix: Add `/*AppCompat*/` string to WIP cloud resources setting

## Data Collection
- Use Feedback Hub to collect WIP traces during repro
- TSS tool: https://aka.ms/getTSS
- IME logs and MDM diagnostic report

## Kusto Query
```kql
DeviceManagementProvider
| where message has "EnterpriseDataProtection"
| project env_time, ActivityId, deviceId, userId, message, errorCode
```

## Configuration Notes

### MDM vs MAM differences
- MAM requires Azure AD Premium license
- MAM supports only one user per device
- MAM can only manage enlightened apps
- MDM takes priority on Azure AD joined devices; MAM on workplace-joined devices

### WIP Removal behavior
- Unenroll + Revoke ON: files remain encrypted, cannot be opened
- Unenroll + Revoke OFF: files decrypted, can be opened
- Policy unassigned: encryption removed from files
- Always perform selective wipe before removing device

### Non-enlightened Office apps (Access, Project, Visio)
- Not included in default AppLocker XML files
- Custom XML files available for including these apps
- Warning: allowing unenlightened apps causes auto-encryption of everything they touch
