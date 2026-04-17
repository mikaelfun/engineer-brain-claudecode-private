---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/Common scenarios/S4 Error message 0x00000bb sign in with PIN"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FCommon%20scenarios%2FS4%20Error%20message%200x00000bb%20sign%20in%20with%20PIN"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# WHfB Hybrid Key Trust - Error 0x00000bb Sign-in with PIN

## Scenario
Customer has followed "Hybrid Azure AD joined Key Trust Deployment". User provisioned PIN successfully but cannot login with PIN - Error "Something went wrong, 0x00000bb".

## Prerequisites Check
- Customer has met prerequisites per [Hybrid Key Trust article](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-key-trust)
- Server 2016 domain controllers with certificates for Kerberos Authentication and Smart card logon
- Client machine can reach the Server 2016 Domain controller

## Decision Tree

### Step 1: Check the on-screen error
- **Incorrect PIN** → User entered wrong PIN
- **"The request is not supported"** → See [S3 The request is not supported error](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1774610/S3-The-request-is-not-supported-error)

### Step 2: Check time since PIN setup
- User needs to wait **minimum 30 minutes** (AAD Connect minimum sync cycle time)
- Trigger a delta sync on the AAD Connect server to sync keys from Azure AD to on-prem AD
- The key syncs to attribute `msDS-KeyCredentialLink` on the user object

### Step 3: Verify key sync
```powershell
# Check if msDS-KeyCredentialLink is populated after delta sync
# If NOT populated, verify AAD Connect schema:
$ADConnector = Get-ADSyncConnector | Where-Object {$_.name -notmatch ".onmicrosoft.com"} | Select -expand AttributeInclusionList
If ($ADConnector -match 'msDS-KeyCredentialLink') { "Found" } else { "Not Found - refresh schema" }
```
- If schema not updated: [Refresh schema in AAD Connect](https://docs.microsoft.com/en-us/azure/active-directory/connect/active-directory-aadconnectsync-installation-wizard)

### Step 4: Verify Metaverse sync
- Search the Metaverse in AAD Connect to check if values synced from Azure to Connector space
- If attribute is populated, verify machine can locate and communicate with Server 2016 DCs
- Only 2016+ DCs can authenticate using `msDS-KeyCredentialLink`

### Step 5: Collect AAD event logs
```
Event Viewer > Application and Service Logs > Microsoft > Windows > AAD
Select Analytic > Right click > Enable
```
Sign out and sign back in to reproduce, then check Operational and Analytic logs.

### Step 6: Certificate trust chain
- Ensure client machine trusts DC certificate (root cert in "Trusted Root Certificate Authority" store)
- Verify DC issuing cert in **NTAuth** store: `certutil -viewstore -enterprise NTAuth`
- Validate DC certificate from client: `certutil -verify -urlfetch <.cer file>`
- Validate DC certificate from DC itself: `certutil -verify -urlfetch <.cer file>`
- Check for revocation or root trust failures

### Step 7: Verify DC is presenting correct certificate
- Collect network trace while connecting to DC using LDAPS (use `ldp.exe`)

### Step 8: CAPI2 logs
```
Event Viewer > Application and Service Logs > Microsoft > Windows > CAPI2 > Operational
Right click > Enable > Reproduce issue > Analyze
```
Collect on both DC and client machine.

### Step 9: NGC tracing
If all above fails, collect NGC tracing within the Auth trace per [Collecting an Auth trace](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/776637/Collecting-an-Auth-trace).
