---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Authentication\Azure AD Conditional Access Policy\Azure AD Conditional Access for Windows 10 VPN Workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=C:/Program Files/Git/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20for%20Windows%2010%20VPN%20Workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- SCIM Identity
- Conditional Access
-  Windows 10 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 


[[_TOC_]]

# Deployment

# Connection

## Does the VPN client in Settings present the user with an error when the connection fails?

**Yes**

  - Check '[Known Issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183945#Known_Issues)' in CSSSupportWiki.
  - Determine if AAD issues a certificate to the user's personal certificate store.

**No**

  - Examine the Application event log on the client computer for Errors from RasClient or 'Application Error'.

## Does AAD issue a certificate to the user's personal certificate store when the connection is not successful?

**Yes**

  - Dump the VPNv2 Profile using Get-WmiObject and verify the correct VPN server is specified in \<Servers\>.
  - Verify the thumbprint for \<TrustedRootCA\> is for the Root certificate that issued the VPN server's SSL certificate.
  - Examine the Application event log on the client computer for Errors from RasClient.
  - Examine CAPI2 logs on the client and verify the cloud certificate is being pased to the VPN Server. Examine the "Remote Access" and/or "Network Policy and Access" event logs on the RRAS/NPS for errors
  - Verify the VPN server has the cloud root certificate in the 'Trusted Root Certification Authorities' store.
  - Examine CAPI2 logs on the client and verify the cloud certificate is being pased to the VPN Server.

**No**

  - Dump the VPNv2 Profile using Get-WmiObject. Verify "\<DeviceCompliance\> \<Enabled\>true\</Enabled\>" is set.
  - Verify the client computer can access <https://login.microsoftonline.com/>.
  - See "[Collect Azure AD/NGC Trace Logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183945#Collect_Azure_AD.2FNGC_Trace_Logs)" in CSSSupportWiki to collect logs from the client computer.

## Does the user receive an on-screen error stating "Oops\!" when they try to connect to the VPN server?

**Yes**

  - Have the user click **"More Info**" on the Oops\! page and provide the detailed information to perform Kusto tracing against ESTS if needed.
  - Determine why Conditional Access access controls are not being satisfied.

**No**

  - Examine the Application event log on the client computer for Errors from RasClient or 'Application Error'.

## Does the user receive?on-screen error stating "Oops\!" indicating Conditional Access failed, but they gain access after clicking "X" to close the error?

**Yes**

  - Verify the VPN server has the cloud root certificates in the Trusted Root certification Authority store.
  - Have the user click "**More Info**" on the Oops\! page and provide the detailed information to perform Kusto tracing against ESTS if needed.
  - Determine why Conditional Access access controls are not being satisfied.
  - No cloud certificate was issued to the client, but the user already has a certificate from a different issuing authority that chains to trusted root certs on the RADIUS server. Configure [Gateway enforcement](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184088#Gateway_Enforcement) to restrict client access to those that chain to a cloud root certificate only.
      - Alternatively, create the '**Vendor Specific**' option of '**Allowed-Certificate-OID**' on the [Settings tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184088#Remove_weak_authentication_methods_from_Network_Policy_and_Enforce_Protected_EAP_.28PEAP.29) of the Network Policy to filter out valid client authentication certificates that do not chain to the cloud root certificate in the Network Policy on the NPS server.
      - Use Get-WmiObject?to dump the user's VPNv2 Profile from the client. The VPN profile can be configured to filter out invalid client authentication certificates, those that do not have the AAD Conditional Access OID. By adding the \<TLSExtension\> section which contains \<EKUName\>AAD Conditional Access\</EKUName\> and \<EKUOID\>1.3.6.1.4.1.311.87\</EKUOID\>, the VPN client will only pass cloud certificates to the VPN Server for VPN authentication.

**No**

  - Does the user get an "Oops\!" error stating Conditional Access failed and they fail to gain access after clicking "**X**" to close the error?

**Yes**

  - Have the user click "**More Info**" on the Oops\! page and provide the detailed information to perform Kusto tracing against ESTS if needed.
  - Determine why Conditional Access access controls are not being satisfied.
