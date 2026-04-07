# AVD AVD 条件访问与 MFA - conditional-access - Issue Details

**Entries**: 7 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Legacy per-user MFA enabled on Azure AD cloud user causes login failure on AADJ AVD session host des...
- **ID**: `avd-onenote-026`
- **Source**: OneNote | **Score**: 🟢 8.0
- **Root Cause**: Legacy per-user MFA is not supported for AADJ session host desktop logon. Both RD client logon and desktop logon interact with AAD, but desktop logon cannot complete MFA challenge interactively on AADJ VMs
- **Solution**: Replace legacy per-user MFA with Conditional Access policy-based MFA. CA MFA only triggers on AVD client sign-in (not desktop logon), allowing successful desktop authentication. For local admin logon on AADJ host, use format: localhost\<account name>
- **Tags**: mfa, aadj, legacy-mfa, conditional-access, desktop-logon, per-user-mfa

### 2. Unable to sign in to Azure AD-joined VMs from non-Windows clients when multifactor authentication (M...
- **ID**: `avd-ado-wiki-0857`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: MFA not configured correctly for AADJ VM connections from non-Windows clients; MFA blocks sign-in from non-Windows clients by default
- **Solution**: Disable MFA for AADJ VM access or configure MFA properly per: https://docs.microsoft.com/azure/virtual-desktop/deploy-azure-ad-joined-vm#enabling-mfa-for-azure-ad-joined-vms
- **Tags**: aadj, mfa, authentication, non-windows, conditional-access

### 3. Admin needs to block users from connecting to Cloud PCs via browser while still allowing access to W...
- **ID**: `avd-ado-wiki-a-r16-006`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: None
- **Solution**: Create Conditional Access policy: (1) Target needed users (2) Select AVD app (3) Set condition to Browser only (4) Set grant action to Block access. Users can access W365 portal but connection will be blocked.
- **Tags**: w365, conditional-access, browser, block, avd

### 4. CloudPC sign-in blocked by Conditional Access policy due to unexpected private IPv6 address appearin...
- **ID**: `avd-ado-wiki-a-r16-009`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: VNet with Microsoft.AzureActiveDirectory service endpoint enabled converts VM source IP to private IPv6 via VFP. AAD gateway uses X-Forwarded-For header (IPv6) as client IP. IPv6 is unpredictable and cannot be whitelisted.
- **Solution**: Disable Microsoft.AzureActiveDirectory service endpoint on the VNET/Subnet where CloudPC is located. Use IPv6-to-IPv4 converter tool to verify. Ref: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq
- **Tags**: w365, ipv6, conditional-access, service-endpoint, authentication, vnet

### 5. AVD sign-in fails when Conditional Access sign-in frequency policy is configured. User selects auto-...
- **ID**: `avd-onenote-056`
- **Source**: OneNote | **Score**: 🔵 6.0
- **Root Cause**: With sign-in frequency CA policy active, the Primary Refresh Token (PRT) is rejected by AAD. Client falls back to Seamless SSO mechanism, but the required endpoint autologon.microsoftazuread-sso.com is blocked by corporate network/firewall.
- **Solution**: 1) Ensure autologon.microsoftazuread-sso.com is accessible from client devices. 2) Test by visiting https://autologon.microsoftazuread-sso.com/ in browser. 3) If still failing, collect Fiddler trace + Network Monitor for further analysis.
- **Tags**: Conditional-Access, sign-in-frequency, PRT, Seamless-SSO, error-70044, autologon, firewall

### 6. Entra joined VM: 'The user name or password is incorrect' despite correct credentials
- **ID**: `avd-mslearn-025`
- **Source**: MS Learn | **Score**: 🔵 5.0
- **Root Cause**: Per-user MFA enabled/enforced (not supported for Entra joined VMs), or VM User Login role not assigned, or Conditional Access requiring MFA for Azure Windows VM Sign-In app
- **Solution**: Disable per-user MFA; use Conditional Access instead with exclusion for Azure Windows VM Sign-In. Assign VM User Login role. Check AADNonInteractiveUserSignInLogs with AppId 372140e0-b3b7-4226-8ef9-d57986796201
- **Tags**: Entra-join, MFA, conditional-access, authentication, credentials

### 7. Cannot add user assignments to application group - Azure portal shows 'Session Ending' or 'Experienc...
- **ID**: `avd-mslearn-002`
- **Source**: MS Learn | **Score**: 🟡 4.5
- **Root Cause**: Conditional Access policy 'Microsoft Office 365 Data Storage Terms of Use' blocks token acquisition for Microsoft Graph; user hasn't accepted Terms of Use via SharePoint
- **Solution**: Admin must first sign in to SharePoint and accept Terms of Use before accessing Azure portal
- **Tags**: conditional-access, application-group, sharepoint, terms-of-use
