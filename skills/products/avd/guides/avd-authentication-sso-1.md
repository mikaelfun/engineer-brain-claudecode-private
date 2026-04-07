# AVD AVD 认证与 SSO (Part 1) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: aad-auth, aadj, auth-loop, authentication, authentication-loop, browser, client-certificate, cloudap
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Azure AD authentication window loop: blank AAD login window appears and disappea... | The krbtgt_AzureAD account (and linked AzureADKerberos account) was deleted from... | Restore the krbtgt_AzureAD account and associated AzureADKerberos account from t... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Connecting to Cloud PC from browser fails with error: The connection to the remo... | Browser pop-ups are blocked, preventing the SSO authentication prompt from appea... | Check browser address bar for pop-up blocked icon. Allow pop-ups for W365 portal... | 🔵 7.5 | ADO Wiki |
| 3 📋 | SSO fails when subscribing from Remote Desktop macOS client - after entering UPN... | OneAuth library issue affecting macOS Remote Desktop client SSO authentication f... | Issue was under investigation by OneAuth team (circa May 2024). Check for latest... | 🔵 7.0 | ADO Wiki |
| 4 📋 | AAD Auth RDP connection fails due to P2P certificate issues on the destination R... | The MS-Organization-P2P-Access certificate on the target/destination machine is ... | Verify the target is AAD-Joined or Hybrid-AAD-Joined. Check Personal certificate... | 🔵 7.0 | ADO Wiki |
| 5 📋 | AAD authentication for RDP fails due to P2P (Peer-to-Peer) certificate issues on... | The MS-Organization-P2P-Access certificate is missing, expired, or invalid on th... | Check Personal certificate store on both client and host for MS-Organization-P2P... | 🔵 7.0 | ADO Wiki |
| 6 📋 | AAD Auth RDP connection fails due to P2P certificate issues on the source/client... | The client machine has P2P certificate issues preventing it from validating the ... | Verify AAD P2P root certificate on client. Re-register the client device with AA... | 🔵 7.0 | ADO Wiki |
| 7 📋 | AAD Auth RDP connection fails due to WAM (Web Accounts Manager) service issues o... | The WAM service on the target RDS machine is malfunctioning or not running, prev... | Restart the WAM/Token Broker service on the destination machine. Check Windows E... | 🔵 7.0 | ADO Wiki |
| 8 📋 | AAD authentication for RDP fails due to WAM (Web Accounts Manager) service issue... | The WAM service (TokenBroker) on the destination RDS host is not running or malf... | On the destination machine: 1) Check TokenBroker service status (services.msc > ... | 🔵 7.0 | ADO Wiki |
| 9 📋 | RDP AAD authentication fails when using FQDN instead of hostname to connect to r... | AAD auth for RDP requires the target hostname (short name), not the FQDN. Using ... | Use the target machine hostname (short name) instead of FQDN when connecting via... | 🔵 7.0 | ADO Wiki |
| 10 📋 | Continuous prompt for authentication after securing connection - RDP with AAD au... | SSL/TLS issues between the RDS host and Azure AD prevent successful AAD token va... | Verify TLS connectivity from the RDS host to Azure AD endpoints (login.microsoft... | 🔵 7.0 | ADO Wiki |
| 11 📋 | AADJ Cloud PC with VPN to on-prem: user is prompted for user/pass instead of SSO... | VPN profile with Azure AD Conditional Access uses a user cert from Azure AD cach... | Set UseRasCredentials to 0 to prevent the Azure AD certificate from being cached... | 🔵 6.5 | ADO Wiki |
| 12 📋 | &nbsp;Microsoft Entra ID user assignment list is not getting populated intermitt... | Cx has a normal and an admin account. Due to SSO enable, user browser session lo... | For Google Chrome: &nbsp;Have used the Windows Account extension and allow for i... | 🔵 6.5 | KB |
| 13 📋 | You have an Windows AVD setup following these steps:&nbsp;https://dev.azure.com/... | Administrative accounts are part of the&nbsp;protected groups (Administrators, D... | Workaround 1: Do not set the enablerdsaadauth:i:1 setting in the rdp properties ... | 🔵 6.5 | KB |
| 14 📋 | Large Cloud PC provisioning batch fails with 'We encountered a service error'; u... | Default route sends all Cloud PC traffic through VPN Gateway, overwhelming it; p... | Options: 1) Upgrade VPN Gateway to higher SKU; 2) Change encryption algorithm to... | 🔵 6.0 | ADO Wiki |
| 15 📋 | SharePoint site auto-sync configured via Intune policy takes 8+ hours to appear ... | OneDrive sync timing behavior (not a Windows 365 issue) - the Timerautomount reg... | Set registry key HKCU\Software\Microsoft\OneDrive\Accounts\Business1\Timerautomo... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: The krbtgt_AzureAD account (and linked AzureADKerb `[Source: ADO Wiki]`
2. Check: Browser pop-ups are blocked, preventing the SSO au `[Source: ADO Wiki]`
3. Check: OneAuth library issue affecting macOS Remote Deskt `[Source: ADO Wiki]`
4. Check: The MS-Organization-P2P-Access certificate on the `[Source: ADO Wiki]`
5. Check: The MS-Organization-P2P-Access certificate is miss `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-authentication-sso-1.md#troubleshooting-flow)
