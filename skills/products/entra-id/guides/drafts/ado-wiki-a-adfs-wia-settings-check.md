---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS workflow - Check WIA settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20workflow%20-%20Check%20WIA%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ADFS Workflow - Check WIA (Windows Integrated Authentication) Settings

There are multiple places to check for WIA configuration: **Client Browser**, **ADFS**, and **Request Parameters**.

### 1. Check Client Browser Setup

#### Internet Explorer
1. **IE Options > Advanced** > Enable Integrated Windows Authentication → must be **checked**
2. **IE Options > Security > Local Intranet** > Sites > Advanced → verify ADFS URL is listed
3. **Custom Level** > User Authentication > "Automatic logon only in Intranet Zone" → must be **selected**

#### Edge, Chrome, Firefox, Safari
- See "Check ADFS Setup" below — these browsers rely on ADFS WIASupportedUserAgents configuration.

### 2. Check ADFS Setup

```powershell
# Import ADFS module (run as Administrator)
Import-Module ADFS
```

#### 2a. Validate WindowsIntegratedFallback
```powershell
Get-ADFSGlobalAuthenticationPolicy
```
- Check `WindowsIntegratedFallbackEnabled`:
  - **TRUE** → FBA (Forms-Based Auth) can be expected if the browser UserAgent is NOT in WIASupportedUserAgents. You need to update the configuration.

#### 2b. Validate WIASupportedUserAgents
```powershell
Get-ADFSProperties | Select -ExpandProperty WIASupportedUserAgents
```
- Check if the browser's UserAgent string is included in the list.
- If missing, you need to add it.

#### 2c. Add New UserAgent String
```powershell
# Get current strings
$wiaStrings = Get-ADFSProperties | Select -ExpandProperty WIASupportedUserAgents

# Add new string
$wiaStrings = $wiaStrings + "NewString"
# Example: $wiaStrings = $wiaStrings + " =~Windows\s*NT.*Edge"

Set-ADFSProperties -WIASupportedUserAgents $wiaStrings
```

**To support WIA on Chromium Edge:**

- **AD FS on Windows Server 2012 R2 or earlier:**
  ```powershell
  Set-AdfsProperties -WIASupportedUserAgents @("MSIE 6.0", "MSIE 7.0; Windows NT", "MSIE 8.0", "MSIE 9.0", "MSIE 10.0; Windows NT 6", "Windows NT 6.3; Trident/7.0", "Windows NT 6.3; Win64; x64; Trident/7.0", "Windows NT 6.3; WOW64; Trident/7.0", "Windows NT 6.2; Trident/7.0", "Windows NT 6.2; Win64; x64; Trident/7.0", "Windows NT 6.2; WOW64; Trident/7.0", "Windows NT 6.1; Trident/7.0", "Windows NT 6.1; Win64; x64; Trident/7.0", "Windows NT 6.1; WOW64; Trident/7.0", "Windows NT 10.0; WOW64; Trident/7.0", "MSIPC", "Windows Rights Management Client", "Edg/", "Edge/")
  ```

- **AD FS on Windows Server 2016 or later:**
  ```powershell
  Set-AdfsProperties -WIASupportedUserAgents @("MSIE 6.0", "MSIE 7.0; Windows NT", "MSIE 8.0", "MSIE 9.0", "MSIE 10.0; Windows NT 6", "Windows NT 6.3; Trident/7.0", "Windows NT 6.3; Win64; x64; Trident/7.0", "Windows NT 6.3; WOW64; Trident/7.0", "Windows NT 6.2; Trident/7.0", "Windows NT 6.2; Win64; x64; Trident/7.0", "Windows NT 6.2; WOW64; Trident/7.0", "Windows NT 6.1; Trident/7.0", "Windows NT 6.1; Win64; x64; Trident/7.0", "Windows NT 6.1; WOW64; Trident/7.0", "Windows NT 10.0; WOW64; Trident/7.0", "MSIPC", "Windows Rights Management Client", "=~Windows\s*NT.*Edg.*")
  ```

### 3. Check Request Parameters

#### 3a. Forms Based Authentication in SAML Message
Check if the incoming request has query string parameters controlling auth method:

- **WS-Federation**: Check WSIGNIN request for WAUTH parameter:
  `wauth=urn:oasis:names:tc:SAML:1.0:am:password`

- **SAML 2.0**: Check for `samlp:AuthnContextClassRef` with value:
  `urn:oasis:names:tc:SAML:2.0:ac:classes:Password`

#### 3b. Determine the RP type
- **Non-Microsoft RP**: FBA behavior is controlled by the incoming SAML message — expected behavior. Customer must work with the app vendor/developer to change.
- **Microsoft Online Services RP (O365)**: May be controlled by **PromptLoginBehavior** settings from Trusted Realm Object.

#### 3c. Validate and Configure PromptLoginBehavior

PromptLoginBehavior values:
| Value | Behavior |
|-------|----------|
| `0` - TranslateToFreshPasswordAuth | Default Azure AD behavior: sends wauth and wfresh to ADFS instead of prompt=login |
| `1` - NativeSupport | prompt=login parameter sent as-is to ADFS |
| `2` - Disabled | Nothing sent to ADFS |

**Configure via Microsoft Graph PowerShell:**
```powershell
# Install and connect
Install-Module Microsoft.Graph
Import-Module Microsoft.Graph.Authentication
Connect-MgGraph -Scopes Domain.Read.All, Domain.ReadWrite.All, Directory.Read.All

# Get current settings
Get-MgDomainFederationConfiguration -DomainId <domain_name>

# Update settings
Update-MgDomainFederationConfiguration -DomainId <domain_name> `
    -PromptLoginBehavior <value> `
    -FederatedIdpMfaBehavior <value> `
    -PreferredAuthenticationProtocol <value>
```

**Parameter details:**
- **PromptLoginBehavior**: `translateToFreshPasswordAuthentication` | `nativeSupport` | `disabled`
- **FederatedIdpMfaBehavior**: `acceptIfMfaDoneByFederatedIdp` | `enforceMfaByFederatedIdp` | `rejectMfaByFederatedIdp`
- **PreferredAuthenticationProtocol**: `wsFed` | `saml`
