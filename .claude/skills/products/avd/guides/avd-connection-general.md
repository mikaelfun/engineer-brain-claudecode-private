# AVD AVD 连接通用 - Quick Reference

**Entries**: 11 | **21V**: all applicable
**Keywords**: aad-join, aad-joined, ad-connect, authentication, backend-error, by-design, connectivity, connector
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Could not connect to remote PC because of a security error | Allow log on through Remote Desktop Services policy misconfigured | Fix the security policy to include appropriate user groups | 🟢 8.0 | MS Learn |
| 2 📋 | AVD RemoteApp keeps asking for credentials when launching second RemoteApp after... | Expected behavior. When all RemoteApps close, shared session enters Disconnected... | By design. Workaround: Keep at least one RemoteApp open to maintain Active sessi... | 🟢 8.0 | OneNote |
| 3 📋 | HTTP 5xx server error when using Windows 365 Power Platform connector actions or... | Backend service issues, service deployment/configuration problems, or transient ... | 1) Retry operation after a few minutes for transient issues. 2) If persists, cre... | 🔵 7.5 | ADO Wiki |
| 4 📋 | CTRL+ALT+DEL and CTRL+ALT+END keyboard shortcuts trigger on Cloud PC instead of ... | By design, keyboard shortcuts like CTRL+ALT+DEL do not propagate through nested ... | On the destination remote server, create a shortcut: C:\Windows\explorer.exe she... | 🔵 7.5 | ADO Wiki |
| 5 📋 | VPN disconnect on Cloud PC; manual reconnect works | VPN IKEV2 changes default route or End Existing Traffic setting | Use split tunneling; exempt core RD traffic | 🔵 7.5 | ADO Wiki |
| 6 📋 | VPN disconnect; reconnect fails until CPC reboot | VPN tunnel blocks all traffic preventing AVD endpoint access | Allow required W365 endpoints through VPN; use split tunneling | 🔵 7.5 | ADO Wiki |
| 7 📋 | WVD gateway error. Kusto shows Failed to add user to Remote Desktop Users group:... | UPN translation fails in cross-domain trust scenarios. | Use actual domain UPN instead of email account. | 🔵 6.5 | KB |
| 8 📋 | Few users unable to login to AAD joined AVD VMs. Error: 'Sign in failed. Please ... | Duplicate UPN entries for affected user accounts in on-prem AD synced via Azure ... | Remove duplicate UPN entries in on-prem AD and reset passwords for affected user... | 🔵 6.5 | KB |
| 9 📋 | Few users unable to login to AAD joined AVD VMs. Error: Sign in failed. Please c... | Duplicate UPN entries for the affected user accounts in on-prem AD synced to Azu... | Remove the duplicate UPN entries in on-prem AD and reset the password for the af... | 🔵 6.5 | KB |
| 10 📋 | Customer has Azure monitor for AVD set up and has LA queries configured to send ... | Expected behavior. | Resolution : &nbsp;   It is      expected for AVD agent to disconnect &amp; re-c... | 🔵 6.5 | KB |
| 11 📋 | User Unable to connect to AVD with Below Error.  &quot;A user account restrictio... | User was part of too many security groups. &nbsp; When same user tried connectin... | Customer removed the user from few unnecessary security group that fixed the iss... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: Allow log on through Remote Desktop Services polic `[Source: MS Learn]`
2. Check: Expected behavior. When all RemoteApps close, shar `[Source: OneNote]`
3. Check: Backend service issues, service deployment/configu `[Source: ADO Wiki]`
4. Check: By design, keyboard shortcuts like CTRL+ALT+DEL do `[Source: ADO Wiki]`
5. Check: VPN IKEV2 changes default route or End Existing Tr `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-connection-general.md#troubleshooting-flow)
