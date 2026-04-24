---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/mfa/account-lockout-adfs-window-server
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Account Lockout in AD FS on Windows Server

## Summary

Multi-step diagnostic workflow for troubleshooting account lockout issues in AD FS on Windows Server 2012/2012 R2/2016/2019.

## Decision Tree

```
Start
  |
  +-- Connect Health configured? 
  |     YES -> Use Connect Health reports for bad password attempts
  |     NO  -> Collect AD FS event logs manually
  |
  +-- Analyze IP + username from bad password attempts
  |     |
  |     +-- External unknown IPs?
  |     |     YES -> Update AD FS with latest hotfixes -> Enable extranet lockout
  |     |     NO  -> Check service account credentials / cached credentials
  |
  +-- Extranet lockout enabled?
  |     YES -> Check lockout thresholds
  |     NO  -> Enable (Server 2012 R2+: Smart Lockout; older: upgrade)
  |
  +-- Enable modern authentication + certificate-based auth
  +-- Disable legacy endpoints (usernamemixed)
```

## Step 1: Collect Data

### With Connect Health
- Use Connect Health reports for top bad password attempts
- Analyze user accounts and IPs

### Without Connect Health
- **Server 2012 R2/2016**: Search Security event logs for Event ID 411 (Source: AD FS Auditing)
  - Use ADFSBadCredsSearch.ps1 script
  - Events contain UPN and IP of submitter
  - "token validation failed" message distinguishes bad password vs account lockout
- **Server 2008 R2/2012**: Correlate Security events 4625 + 501
  - Use ADFSSecAuditParse.ps1 script

## Step 2: Analyze Sources

- External unknown IPs -> likely brute force attack
- Internal/known IPs -> stale credentials in services/apps

## Step 3: Mitigations

### Extranet Lockout
- ExtranetLockoutThreshold should be < AD lockout threshold
- Prevents extranet lockout from triggering AD-wide lockout

### Modern Authentication
- Deploy modern auth for Office clients
- Benefits: MFA support, reduced attack surface

### Non-Password Methods
- **Certificate-based auth**: Eliminates password exposure over internet
- **Azure MFA**: As additional or primary authentication (AD FS 2016)
- **Windows Hello for Business**: Passwordless extranet access (Windows 10, AD FS 2016)

### Disable Legacy Endpoints
- Disable /adfs/services/trust/13/usernamemixed endpoint
- May disrupt EAS clients via Exchange Online

## Step 4: Check Stale Credentials
- Service accounts: verify credentials are current in all services/apps
- User accounts: clear cached credentials in applications

## PowerShell Scripts Referenced

1. **ADFSBadCredsSearch.ps1**: Searches Event 411 for bad credentials, outputs CSV with UPN, IP, timestamp
2. **ADFSSecAuditParse.ps1**: For older AD FS, correlates events 4625+501

## 21Vianet Notes

AD FS is on-premises infrastructure, generally applicable to all environments including Mooncake. However, Connect Health is not yet GA in 21Vianet (planning stage per 21v-gaps).
