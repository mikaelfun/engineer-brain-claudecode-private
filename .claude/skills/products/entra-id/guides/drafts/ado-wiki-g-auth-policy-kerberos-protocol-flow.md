---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/How the Kerberos protocol is used"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/How%20the%20Kerberos%20protocol%20is%20used"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924666&Instance=1924666&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924666&Instance=1924666&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article explains the purpose and function of authentication policy silos and authentication policies within Active Directory Domain Services (AD DS). It provides insights into how the Kerberos protocol is used.

[[_TOC_]]
  
#Restricting user sign-in to specific hosts requires the domain controller to validate the host's identity.  
  
When using Kerberos authentication with Kerberos armoring KDC is provided with the TGT of the host from which the user is authenticating.  
The content of this armored TGT is used to complete an access check to determine if the host is allowed.  

When a user signs in to Windows or enters their domain credentials in a credential prompt for an application, by default, Windows sends an unarmored AS-REQ to the domain controller.  
If the user is sending the request from a computer that does not support armoring, the request fails.
  
The following list describes the process:
*   DC queries for the user account and determines if it is configured with an authentication policy that restricts initial authentication that requires armored requests.
*   DC will fail the request.
*   Because armoring is required, the user can attempt to sign in by using a computer enabled to support Kerberos armoring to retry the sign-in process.
*   Windows detects that the domain supports Kerberos armoring and sends an armored AS-REQ to retry the sign-in request.
*   DC performs an access check by using the configured access control conditions and the client operating system's identity information in the TGT that was used to armor the request.
*   If the access check fails, the DC rejects the request.  
    

Even when operating systems support Kerberos armoring, access control requirements can be applied and must be met before access is granted.  
Users sign in to Windows or enter their domain credentials in a credential prompt for an application. By default, Windows sends an unarmored AS-REQ to the domain controller. If the user is sending the request from a computer that supports armoring, authentication policies are evaluated as follows:  

1.  DC queries for the user account and determines if it is configured with an authentication policy that restricts initial authentication that requires armored requests.
2.  The domain controller performs an access check by using the configured access control conditions and the system's identity information in the TGT that is used to armor the request. The access check succeeds.
3.  DC replies with an armored reply (AS-REP), and the authentication continues.

From [How restricting a user sign-in works](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/authentication-policies-and-authentication-policy-silos#BKMK_HowRestrictingSignOn)>

---
## Flow illustration

| ![flow summary](/.attachments/==image_0==-ad15092e-8b08-4f17-a876-f7e0081f1457.png ) | ![flow summary1](/.attachments/==image_1==-9cc6bffb-87bc-4384-8121-984fbfe424e0.png ) |![flow workflow](/.attachments/==image_2==-c3c54414-4d1d-4bba-83b5-6d26fb3b8325.png ) |
|--|--|--|


| 1 | A computer or device running a Kerberos armoring enabled Kerberos client sends an send an AS-REQ to a KDC.|
|:--:|:--:|
| 2| KDC sends, either in a AS-REP pre-authentication exchange (AS-Ping) or in the AS-REP containing the computer's TGT information that informs the computer the domain supports Kerberos armoring.<br>Regardless of discovery method, the computer receives a TGT for the domain and caches the domain's capabilities, such as Kerberos armoring and claims. |
| 3 | The user authenticates the domain by sending a AS-REQ to the KDC. The Kerberos client has a domain capabilities cache that stores each domains capabilities as it discovers them. The computer AS exchange discovered the domain capabilities, which is how the user AS exchange knows it must armor.<br>The user authenticator portion of the request is armored using the computers TGT request; thereby protecting the authenticator dictionary attacks.<br>If the user and computer are from different domains, then the computer uses Kerberos referrals to receive an inter-realm TGT from the user's domain. The user's AS-REQ is then armored using the inter-realm TGT shared between the two domains. |
| 4| As usual, the KDC validates the user authenticator presented in the AS-REQ. Once the authenticator is validated, the KDC builds an AS-REP, armors the AS-REP with using a new key based on the computer's or inter-realm TGT's, and sends the AS-REP to the user. |
| 5 | The user receives it's TGT for the domain from the armored AS-REP. The user must authenticate to each resources it uses. To do so, the user sends a TGS-REQ to the KDC and armors this request using a key based on the user's TGT. |
| 6| The KDC receives the armored TGT for the user's request to authenticate for the targeted service principal name. The KDC validates the user's incoming TGT, and the service principal name. It creates a service ticket, a service session key in an TGS-REP. The TGS-REP is armored using a new key derived from the user's TGT, and sent to the user. |

_**This must not exist anymore**_, because all supported OS now support the feature, but here the flow with DC that does not support it:  
|![flow with DC that does not support Kerberos armoring](/.attachments/==image_9==-bbf32e41-936d-4914-ac1c-a0280c92da14.png ) |
|:-:|
---
# Compound Authentication
Compound authentication allows a Kerberos TGS request to include two identities: the identity of the user and the identity of the users device. 

Windows accomplishes compound authentication by extending Kerberos Flexible Authentication Secure Tunneling (FAST). The protected tunnel used by the Kerberos client and the KDC is secured using the computer's TGT to armor the TGS request. The KDC verifies the target service is compound authentication capable, and includes the authorization data from the primary TGT (user account) and the armoring TGT (computer account) in the PAC of the service ticket.

##How It Works

|![flow of coumpound](/.attachments/==image_10==-a05dc65d-094a-475e-8edf-7a67ece42508.png) |
|:-:|

###Figure 4 Kerberos message flow for compound authentication.

| 1 | Kerberos client performs a normal AS-REQ for pre-authentication, also known as the AS-PING |
|:-: |:-:|
| 2| The down-level KDC returns the normal KDC_ERR-PREAUTH-REQUIRED in an AS-REP. The AS-REP includes the PA-FX-FAST option.<br>Kerberos armoring is enabled in the AS-REP. Therefore, the Kerberos clients updates its realm capabilities cache to indicate the domain supports Kerberos armoring. Additionally, the Kerberos binding is updated to point to the KDC.<br>All future User AS exchanges are armored using a key derived from the computer's TGT. All future User TGS exchanges are armored using a key derived from the user's TGT. |
| 3 | The Kerberos client sends an AS-REQ to the KDC with the PA-PAC-OPTIONS: Kerberos armoring and Claims bits enabled |
| 4 | KDC validates the authenticator from the incoming AS-REQ, builds a session key, and a TGT. The KDC sends the session key and the TGT to the Kerberos client in an AS-REP that includes the Kerberos Armoring, and Claims bit enabled on in the encrypted portion of the PA-SUPPORTED_ENCTYPES field.<br>Kerberos client receives the AS-REP and extract the TGT from the request. The PA-SUPPORTED-ENCTYPES is evaluated to determine if the issuing KDC supports Kerberos armoring and claims.<br>The Kerberos armoring and claims bits were enabled in the AS-REP. Therefore, the Kerberos clients updates its realm capabilities cache to indicate the domain supports Kerberos armoring and claims. Additionally, the Kerberos binding is updated to point to the KDC.<br>All future User AS exchanges are armored using a key derived from the computer's TGT. All future User TGS exchanges are armored using a key derived from the user's TGT.|
| 5 | The user authenticates to the domain by sending an AS-REQ armored with a key derived from the computer's TGT. This armoring protects the user's authenticator from the possibility of a dictionary attack.<br>(AS-Ping and possible referral chasing performed by the computer are not shown).|
| 6| The Windows Server KDC validates the user's authenticator, creates a session key and a TGT. The KDC sends the session key and TGT to the Kerberos client in an AS-REP that is armored with a new key derived from the computer's TGT. |
| 7| The user has a TGT and requests authentication for a service. The Kerberos client sends a TGS-REQ to the KDC that includes the user's TGT and the targeted service principal name to which the user wants to authenticate. The TGS-REQ is armored with a key derived from the user's TGT.|
|8| The KDC locates the service principal name and reads the msDS-SupportedEncryptionTypes attribute to determine resource supports compound authentication (bit 0x20000 enabled). The resource supports compound authentication. The KDC creates a session key, and a service ticket. The KDC returns the session key and service ticket to the Kerberos client in a TGS-REP. The TGS-REP includes the compound authentication flag and is armored with a new key derived from the user's TGT.|
| 9 | The Kerberos client receives the TGS-REQ and determines the resource for which it just received a service tickets supports compound authentication. The Kerberos client then determines if it is capable of requesting compound authentication, which Windows 8 is capable.<br>The Kerberos client discards the recently acquired service ticket and requests a new compound authentication service ticket.<br>The Kerberos client sends a TGS-REQ to the KDC that includes the user's TGT, the targeted service principal name to which the user wants to authenticate, and the compound authentication flag. The TGS-REQ is armored with a key derived from the computer's TGT rather than the user's TGT.<br>(Computers will authenticate the resource domain if they do not possesses a TGT for the domain, including Kerberos referral chasing. Those requests are armored using the inter-realm TGT of the trust).|
| 10 | The KDC locates the service principal name, validates the compound authentication request armored with keys by the computer and the user, creates a session key, and a service ticket that includes authentication data for the user and the computer. The KDC returns the session key and the service ticket to the Kerberos client in a TGS-REP. The TGS-REP is armored with a new key derived from the computer's or inter-realm trust's TGT. |


###AS Request
The Kerberos SSP changes how it requests an authentication service request. When generating the AS-Request, the Kerberos client checks the account domains Kerberos capabilities. AS-Request behavior for non-claim domains remains the same as in previous version of Windows.  
For domains and Kerberos clients supporting claims, the Kerberos SSP relies on the KDC configuration.  


Once the Kerberos client locates a Windows Server KDC, it generates an AS-Request.   
While generating the request, the client enables the claim bit in the PA-PAC-OPTIONS.  
This indicates the Kerberos client is requesting claim data in the return TGT.  
KDCs supporting claims check incoming AS-Requests to see if the pending response should include claim information in the PAC.  
The KDC checks if the claims bit in the PA-PAC-OPTION flags is set to true. If the claim bit is true, then the claim enabled domain controller retrieves the claim information from Active Directory, maps the claim type source to the security principal, and includes the claim information, as well as the Claims-valid SID into the PAC.  

### TGS Request
Windows Kerberos SSP implements new functionality when generating a TGS-Request. The new functionality allows claims.    
The Kerberos SSP changes how it requests a ticket-granting-ticket service request.    

During referrals, the Kerberos client checks if the domain supports dynamic access control and if it does then generates an armored TGS request. For the service ticket, the Kerberos client checks if the domain supports claims and if it does then it generates a TGS request and optionally can request a compound authenticated ticket.    
The TGS request behavior for domains that do not support claims remains the same as in previous version of Windows.

### Service Ticket Handling
Windows uses information from the PAC to create an authentication token on the computer hosting the resource. Information within the PAC includes  
*   Security identifiers (SIDs) for the user and the SIDs of any groups in which the user is a member
*   User claims  
*   SIDs for the device and the SIDs of any groups of which the device is a member
*   Device claims (if compound authentication is configured)

The computer receives an AP-Request. Normal validation of the AP-Request occurs to ensure the service ticket is presented to the correct computer. After validation, the security provider discards claims data if the claims valid SID is missing and discards device data if the compounded authentication SID is missing. The Local Security Authority (LSA) creates an access token using the resulting SIDs and claims. This ensures that authentication that crosses a forest boundary to a down-level domain controller creates an access token that only contains authorization data that is properly SID filtered and claims transformed. 
Key Distribution Center (KDC)
All Windows Server 2012 and > domain controllers provides domain authentication to domain users and computers.  
KDC includes a Claims-valid, security identifier in the PAC. Domain controllers running earlier versions of Windows remove the Claims-valid SID from the PAC. The Claims-valid SID is a well-known security identifier with a SID string value of S-1-5-21-0-0-0-497.  

The Claims-valid SID indicates that claims are present in the PAC and/or the claims were successfully transformed, if needed.
A domain controller that supports claim issuance reads claim types published in Active Directory, performs compound authentication, and provides device authorization when requested. The claim types define the attribute or certificate source on which Windows authorization claims are based. The domain controller reads source attribute (or object identifier for certificate-based claim types) from the claim type and retrieves the attribute data for the authenticating principal. Then, the KDC inserts the retrieved attribute data into the PAC and the PAC is included in the TGT and returned to the requestor.

### Constrained Delegation and Protocol Transition TGS Request (S4U2Proxy)
The constrained delegation TGS request generation behaves similarly to AS-Request generation for domains and Kerberos clients supporting claims. During the request generation, the Kerberos SSP looks for a claim enabled KDC in the account domain. Again, the outcome of this action depends on the domain claim configuration. Otherwise, the Kerberos SSP enables the claim bit in the [PA-PAC-OPTIONS](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/99721a01-c859-48d1-8310-ec1bab9b2838) of the TGS request and sends the request to the discovered KDC.

TGS requests performed through protocol transition do not provide the ability to request claims. The Kerberos client must deliver a service ticket for the principal containing claims to the middle tier-- the middle tier does not attempt to extract claims about the principal.

### External trusts do not support TGS requests containing claim information. the KDC removes all claim information from the PAC.

### Incoming Request from a Different Domain within the Forest

KDCs do not change their behavior when they receive an incoming TGS from different domain within the same forest. The KDC copies claim information into the PAC.  

###Read-only Domain Controller (RODC)
Claims-aware KDCs running on read-only domain controllers must contact a claims-aware KDC running on a writable domain controller to process the TGS request when authentication is beyond the branch. Upon receiving the TGS request,RODC locates a RWDC and forwards the TGS request to the discovered claims-aware KDC in the hub site. RWDC process the TGS request and sends the TGS reply to the RODC. RODC returns the TGS reply to the requesting client.   
Windows performs this process to ensure contextual authentication information remains present in the authorization token for the hub resources. Context authentication information is authorization information relevant to the current context of the authentication-- information from one authentication can be different from another authentication, such as Authentication Mechanism Assurance. Forwarding the TGS-REQ for to the hub domain controller ensures the authentication information is accurate for context of the resource (which resides in the hub site; not the branch). Read-only domain controllers perform the same behavior as in earlier version of Windows Server with regard to TGS-REQs for branch resources.

|![flow with RODC](/.attachments/==image_21==-91434133-dd07-478c-aa3e-f9cb05cfca56.png ) |
|:-:|