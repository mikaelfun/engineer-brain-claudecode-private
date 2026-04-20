# AVD AVD 连接通用 - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: aad-join, aad-joined, ad-connect, authentication, backend-error, break/fix, certificate, cipher-mismatch, connection-error, connectivity, connector, contentidea-kb, disconnect, disconnected-session, duplicate-upn
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD RemoteApp keeps asking for credentials when launching second RemoteApp after... | Expected behavior. When all RemoteApps close, shared session enters Disconnected... | By design. Workaround: Keep at least one RemoteApp open to maintain Active sessi... | 🟢 8.5 | OneNote |
| 2 📋 | HTTP 5xx server error when using Windows 365 Power Platform connector actions or... | Backend service issues, service deployment/configuration problems, or transient ... | 1) Retry operation after a few minutes for transient issues. 2) If persists, cre... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Server or remote session hang, slow system/application performance, slow logons,... | Firewall rules accumulate in the AppIso and IfIso registry keys over time as dif... | Phase 1: Enable Group Policy 'Delete cached copies of roaming profiles' (Compute... | 🟢 8.0 | ADO Wiki |
| 4 📋 | VPN disconnect on Cloud PC; manual reconnect works | VPN IKEV2 changes default route or End Existing Traffic setting | Use split tunneling; exempt core RD traffic | 🟢 8.0 | ADO Wiki |
| 5 📋 | VPN disconnect; reconnect fails until CPC reboot | VPN tunnel blocks all traffic preventing AVD endpoint access | Allow required W365 endpoints through VPN; use split tunneling | 🟢 8.0 | ADO Wiki |
| 6 📋 | ReverseConnectInvalidCertificate error when connecting to AVD session host. Prox... | A third-party network appliance (e.g. Palo Alto firewall/proxy) intercepts the r... | Diagnostic steps: 1) Query DiagActivity for error details (SessionHostIP). 2) Qu... | 🟢 8.0 | ADO Wiki |
| 7 📋 | X224SecFilterFailedActivate error during AVD connection. Users cannot connect. E... | The RDP listener certificate is missing - the SelfSignedCertStore registry key a... | Add 'Remote Desktop' as the value for the SelfSignedCertStore registry key at HK... | 🟢 8.0 | ADO Wiki |
| 8 📋 | Could not connect to remote PC because of a security error | Allow log on through Remote Desktop Services policy misconfigured | Fix the security policy to include appropriate user groups | 🔵 7.0 | MS Learn |
| 9 📋 | Cannot connect to remote computer - 'a security package error occurred at the tr... | TLS or Cipher Mismatch between the RDP client and the session host | Check for TLS or Cipher Mismatch. Reference: https://dev.azure.com/Supportabilit... | 🔵 7.0 | ADO Wiki |
| 10 📋 | WVD gateway error. Kusto shows Failed to add user to Remote Desktop Users group:... | UPN translation fails in cross-domain trust scenarios. | Use actual domain UPN instead of email account. | 🔵 6.5 | ContentIdea |
| 11 📋 | Few users unable to login to AAD joined AVD VMs. Error: 'Sign in failed. Please ... | Duplicate UPN entries for affected user accounts in on-prem AD synced via Azure ... | Remove duplicate UPN entries in on-prem AD and reset passwords for affected user... | 🔵 6.5 | ContentIdea |
| 12 📋 | Few users unable to login to AAD joined AVD VMs. Error: Sign in failed. Please c... | Duplicate UPN entries for the affected user accounts in on-prem AD synced to Azu... | Remove the duplicate UPN entries in on-prem AD and reset the password for the af... | 🔵 6.5 | ContentIdea |
| 13 📋 | Customer has Azure monitor for AVD set up and has LA queries configured to send ... | Expected behavior. | Resolution : &nbsp;   It is      expected for AVD agent to disconnect &amp; re-c... | 🔵 6.5 | ContentIdea |
| 14 📋 | User Unable to connect to AVD with Below Error.  &quot;A user account restrictio... | User was part of too many security groups. &nbsp; When same user tried connectin... | Customer removed the user from few unnecessary security group that fixed the iss... | 🔵 6.5 | ContentIdea |
| 15 📋 | After creating a new WVD Host Pool, users see a Gateway error when they try to c... | The AAD account used as an RDS Owner for the tenant is not associated with a Win... | Redeploy the Host Pool using an "RDS Owner" account sourced from the Windows Ser... | 🔵 6.5 | ContentIdea |

## Quick Triage Path

1. Check: Expected behavior. When all RemoteApps close, shared session... `[Source: OneNote]`
2. Check: Backend service issues, service deployment/configuration pro... `[Source: ADO Wiki]`
3. Check: Firewall rules accumulate in the AppIso and IfIso registry k... `[Source: ADO Wiki]`
4. Check: VPN IKEV2 changes default route or End Existing Traffic sett... `[Source: ADO Wiki]`
5. Check: VPN tunnel blocks all traffic preventing AVD endpoint access `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-connection-general.md#troubleshooting-flow)