---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Device registration flowchart"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FDevice%20registration%20flowchart"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Registration Flowcharts

Registering a device to Azure AD enables you to manage a device's identity. When a device is registered, Azure AD device registration provides the device with an identity that is used to authenticate the device when a user signs-in to Azure AD.

## Public documentation
[How it works: Device registration](https://docs.microsoft.com/en-us/azure/active-directory/devices/device-registration-how-it-works)

## Azure AD Joined in Managed Environments

| Phase | Description |
|-------|-------------|
| **A** | OOBE loads Azure AD join web app in CXH. Sends GET to Azure OpenID config endpoint to discover authorization endpoints. Azure returns OpenID config with authorization endpoints as JSON. |
| **B** | App builds sign-in request for authorization endpoint and collects user credentials. |
| **C** | After UPN provided, app sends GET to discover realm info. Determines environment is managed (non-federated). Creates auth buffer, POSTs credentials to AAD. AAD validates and returns ID token with claims. |
| **D** | App checks for MDM terms of use (mdm_tou_url claim). If present, retrieves and presents to user. Optional step. |
| **E** | App sends device registration discovery request to ADRS. ADRS returns discovery data document with tenant-specific URIs. |
| **F** | App creates TPM-bound RSA 2048-bit device key pair (dkpub/dkpriv). Creates certificate request using dkpub, signs with dkpriv. Derives transport key pair (tkpub/tkpriv) from TPM storage root key. |
| **G** | App sends registration request to ADRS with ID token, cert request, tkpub, attestation data. ADRS validates ID token, creates device ID and certificate, writes device object in AAD, sends device ID and cert to client. |
| **H** | Registration completes. Device ID saved (viewable via `dsregcmd.exe /status`), device cert installed in Personal store. Process continues with MDM enrollment. |

## Azure AD Joined in Federated Environments

| Phase | Description |
|-------|-------------|
| **A** | Same as managed - OOBE loads CXH app, discovers OpenID config. |
| **B** | App builds sign-in request and collects credentials. |
| **C** | After UPN, app discovers realm info and determines environment is federated. Redirects to on-premises STS sign-in page (AuthURL). Collects credentials through STS web page. |
| **D** | App POSTs credential to on-premises STS (may require additional MFA). STS authenticates user and returns token. App POSTs token to AAD for validation. AAD returns ID token with claims. |
| **E** | MDM terms of use check (same as managed). |
| **F** | ADRS discovery request (same as managed). |
| **G** | TPM key pair generation (same as managed). |
| **H** | Device registration request to ADRS (same as managed). |
| **I** | Registration completes, MDM enrollment continues. |

## Hybrid Azure AD Joined in Managed Environments

| Phase | Description |
|-------|-------------|
| **A** | User signs in to domain-joined Windows 10 with domain credentials. Triggers Automatic Device Join task (also triggered on domain join + retried every hour). |
| **B** | Task queries AD via LDAP for keywords attribute on SCP (CN=62a0ff2e-97b9-4513-943f-0d221bd30080,CN=Device Registration Configuration). Determines if registration goes to ADRS or enterprise DRS. |
| **C** | For managed environment, task creates self-signed certificate. Writes cert to userCertificate attribute on computer object in AD via LDAP. |
| **D** | Azure AD Connect detects attribute change. On next sync cycle, sends userCertificate, object GUID, and computer SID to ADRS. ADRS creates device object in AAD. |
| **E** | Automatic Device Join task triggers on sign-in/hourly. Authenticates to AAD using private key from userCertificate. AAD authenticates and issues ID token. |
| **F** | TPM key pair generation (same as AADJ). |
| **G** | Device registration request to ADRS (same as AADJ). ADRS updates existing device object. |
| **H** | Registration completes. Device ID saved, device cert installed. |

## Hybrid Azure AD Joined in Federated Environments

| Phase | Description |
|-------|-------------|
| **A** | User signs in to domain-joined Windows 10 with domain credentials. Triggers Automatic Device Join task. |
| **B** | Task queries AD SCP for registration endpoint direction (same as managed). |
| **C** | For federated, computer authenticates to enterprise DRS using Windows integrated auth. DRS returns token with object GUID, computer SID, domain-joined state claims. Task submits token to AAD for validation. AAD returns ID token. |
| **D** | TPM key pair generation. |
| **E** | Task requests enterprise PRT from on-premises STS (ADFS on Windows Server 2016) for SSO to federated apps. |
| **F** | Device registration request to ADRS. Registration completes, device ID saved, cert installed. |
| **G** | If Azure AD Connect device write-back enabled, AAD Connect requests updates on next sync. AAD correlates device object with matching computer object. AAD Connect writes device object back to AD. |

## Troubleshooting
See [Device registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184217) for detailed troubleshooting.
