---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Glossary"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Glossary"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924649&Instance=1924649&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924649&Instance=1924649&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]


#Authentication Policy and Silos

## Support for claims, compound authentication, and Kerberos armoring
It offers access control based on claims and compound authentication.

### What works differently?
The new**KDC support for claims, compound authentication, and Kerberos armoring**KDC administrative template policy setting allows you to configure a domain controller to support claims and compound authentication for Kerberos armoring by using Kerberos authentication. This policy setting is configured on the domain controller OU.  

When the supported (or higher) setting is configured, domain controllers will advertise domain support for claims and compound authentication for Kerberos armoring.   

Additionally, the**Kerberos client support for claims, compound authentication and Kerberos armoring**administrative template policy setting enables you to configure devices running Windows to support claims and compound authentication for DKerberos armoring by using Kerberos authentication.   

Devices running Windows will fail authentication if they cannot find a domain controller. It is important to ensure that there are sufficient domain controllers for any account, referral, and resource domains that are supported.

The following table lists the four configurations that are available in**KDC support for claims, compound authentication, and Kerberos armoring**.

Expand table

| Configuration | Results | Domain controller behavior|
| :---: | :---: | :---: |
| Not supported (default) | No minimum requirement for domain controllers running Windows Server 2012 | Claims not provided<br>Compound authentication not supported<br>Kerberos armoring not supported |
| Supported| All domain controllers advertise support for claims and compound authentication for Kerberos armoring<br>Requires sufficient domain controllers to handle the authentication requests for devices in the domain | Claims provided on request<br>Compound authentication provided on request when resource supports it<br>Kerberos armoring supported|
| Always provide claims | All domain controllers advertise support for claims and compound authentication for  Kerberos armoring<br>Requires _at least_ Windows Server 2012 domain functional level | Claims always provided<br>Compound authentication provided on request when resource supports it<br>Kerberos armoring supported and Flexible Authentication via Secure Tunneling ([RFC FAST]([A Generalized Framework for Kerberos Pre-Authentication](https://www.rfc-editor.org/rfc/rfc6113.html))) behavior supported |
| Fail unarmored authentication requests | All domain controllers advertise support for claims and compound authentication for  Kerberos armoring<br>requires Windows Server 2012 domain functional level<br>Requires that all FAST-aware devices request authentication | Claims always provided<br>Compound authentication provided on request when resource supports it<br>Rejects unarmored Kerberos messages and supports the Flexible Authentication via Secure Tunneling (RFC FAST) behavior |

**Always provide claims**and**Fail unarmored authentication requests**options cause intermittent authentication or access control failures if the domain is NOT set at the Windows Server 2012 functional level at minimum. Until then, domain controllers running Windows Server 2012 and + will behave as if the**Supported**option is configured.

Supporting claims and compound authentication for Kerberos armoring will impact the domain controller because:
1.  Secure Kerberos domain capability discovery is required, which results in additional message exchanges. Resource servers running  supported Windows Server OS send protocol transition requests for non-Windows devices, which results in additional messages exchanges to account domains and referral domains. These requests will go outside the site when no domain controller is available in the site.
    
1.  Claims and compound authentication increases the size and complexity of the data in the message, which results in more processing time and greater Kerberos service ticket size.
    
1.  Kerberos armoring fully encrypts Kerberos messages and signs Kerberos errors. This results in increased processing time, but it does not change the Kerberos service ticket size.
    
Supporting claims and compound authentication for Kerberos armoring (when the Supported option or higher is selected), could impact connectivity and file access because:
1.  The setting configures a domain for the new access control model, which new services can choose to support.
    
1.  Any device that supports claims, compound authentication, and Kerberos armoring cannot authenticate unless it can find a domain controller that supports claims, compound authentication and Kerberos armoring. This ensures that the client device receives complete domain authorization information during authentication for all access control checks (local and remote).
    
1.  Devices running Windows that do not support claims, compound authentication, and Kerberos armoring should not be configured with claims-based access controls for startup or sign-on services or with claims-based access controls for local files. Access will be denied, and claims will not be available until the domain is configured to the Windows Server 2012 domain functional level (at minimum) and configured to always provide claims.
    
The**KDC support for claims, compound authentication, and Kerberos armoring**administrative template policy setting also impacts network load and traffic patterns as follows:
1.  Secure Kerberos domain capability discovery is required, which results in additional message exchanges.
    
2.  Requests will go outside of the site when no domain controllers running Windows Server 2012 and + are available on the site for devices running Windows that send authentication requests, and resource servers running Windows Servers that send protocol transition requests.

---
### Glossary of Components

**Flexible Authentication Secure Tunneling** (FAST)provides a protected channel between the client and theKey Distribution Center (KDC). FAST is only available forAuthentication Service (AS)andticket-granting service (TGS) exchanges.  

**FAST armor**uses aticket-granting ticket (TGT) for the computer to protect Authentication Service (AS) exchanges with the KDC, so the computers AS exchange is not armored. The users TGT is used to protect its TGS exchanges with the KDC.

### Kerberos FAST (Flexible Authentication Secure Tunneling) 

Kerberos FAST provides a protected channel between the Kerberos client and the KDC. It is implemented as Kerberos armoring starting Windows Server 2012 and is only available for authentication service (AS) and ticket-granting service (TGS) exchanges. FAST helps protect the users pre-authentication data, which is vulnerable to offline dictionary attacks[[3]](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831747%28v=ws.11%29)[[4]](https://www.trustedsec.com/blog/i-wanna-go-fast-really-fast-like-kerberos-fast).


###Armoring

Armoring in the context of Kerberos refers to the process of adding an additional layer of security to the Kerberos authentication messages. This is achieved by encrypting the messages to ensure that no one can tamper with the clients ticket or other data. Armoring helps protect against various types of attacks, including replay and relay attacks [[6]](https://syfuhs.net/kerberos-fast-armoring).

###Compound Authentication 

Compound authentication is an extension to FAST, which allows Kerberos clients to provide the devices TGT. 
Compound authentication allows a Kerberos TGS request to include two identities: the identity of the user and the identity of the users device.  
Windows accomplishes compound authentication by extending Kerberos FAST.  
The protected tunnel used by the Kerberos client and the KDC is secured using the computer's TGT to armor the TGS request.
This allows Windows Server KDCs to create service tickets with device authorization data for services that are hosted on Windows client and configured to support device authorization data.   
The KDC verifies the target service is compound authentication capable, and includes the authorization data from the primary TGT (user account) and the armoring TGT (computer account) in the PAC of the service ticket.  
Access tokens that are created from these service tickets include the devices groups and claims, which can be used for access control.


### Claims:

Claims are new authorization data that are provided by Active Directory.   
In its simplest form, claims are simply_statements_(for example, name, identity, group), made about users, that are used primarily for authorizing access to claims-based applications located anywhere on the Internet. Each statement corresponds to a_value_that is stored in the claim.    
Claims are assertions made about a user or device that are used to make authorization decisions. These can include information such as the users role, group memberships, or other attributes.   
When claims are provisioned, Windows Server KDCs can create service tickets with a principals claims. Access tokens that are created from these service tickets include claims that can be used for access control.  
Claims are used in ADFS too:[The Role of Claims | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/technical-reference/the-role-of-claims)

[Identity and Claims - Overview](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1875230/Identity-and-Claims)

### Relationships Among Components

1.  **Kerberos FAST and Armoring:** Kerberos FAST uses armoring to protect the authentication messages exchanged between the client and the KDC. This ensures that the messages are encrypted and secure.
    
2.  **Compound Authentication and Claims:** Compound authentication can generate multiple claims about a user or device, which are then used to make authorization decisions. 
    
3.  **Authentication Policy Silos and Claims:** Authentication policy silos use claims to enforce access control policies. By defining which claims are required for access to specific resources, silos can ensure that only authorized users and devices are granted access.
    


[Authentication Policies and Authentication Policy Silos | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/authentication-policies-and-authentication-policy-silos)

[What's New in Kerberos Authentication | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831747%28v=ws.11%29)

[I Wanna Go Fast, Really Fast, like (Kerberos) FAST - TrustedSec](https://www.trustedsec.com/blog/i-wanna-go-fast-really-fast-like-kerberos-fast)

[Module 4 - Kerberos-new (1)](https://microsoft.sharepoint.com/teams/iam-cass-pm/_layouts/15/Doc.aspx?sourcedoc=%7B68043553-6FFC-41FC-8D9E-3E6DA390F872%7D&file=Module%204%20-%20Kerberos-new%20(1).pptx&action=edit&mobileredirect=true&DefaultItemOpen=1)

[Kerberos FAST Armoring - syfuhs.net](https://syfuhs.net/kerberos-fast-armoring)