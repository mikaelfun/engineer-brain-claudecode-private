---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Cloud Kerberos Trust/Scoping, Tracing & Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20Cloud%20Kerberos%20Trust/Scoping%2C%20Tracing%20%26%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/585900&Instance=585900&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/585900&Instance=585900&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed guidelines for scoping, tracing, known issues, and troubleshooting the Windows Hello for Business Cloud Kerbeors Trust feature in Azure AD joined and Hybrid Azure AD joined environments.

[[_TOC_]]

# About the WHFB-Cloud Trust feature

**Scoping, Tracing, Known Issues & Troubleshooting**  
This document focuses on scoping and troubleshooting a new deployment model of Windows Hello for Business for Azure AD joined and Hybrid Azure AD joined environments known as Cloud Kerberos Trust or Cloud Trust.

---

## WHFB-Cloud Trust  
This document focuses on scoping and troubleshooting a new deployment model of Windows Hello for Business for Azure AD joined and Hybrid Azure AD joined environments known as Cloud Kerberos Trust or Cloud Trust.

---

## Previous deployment scenarios

![Previous deployment scenarios](/.attachments/image-5accb930-47da-40db-9529-647db9fc3195.png)

![Previous deployment scenarios](/.attachments/image-40369bad-6c15-41b0-bcb2-0994bfa76fee.png)

---

## Collaboration

| Issues  | CSS Team |
|:--:|:--:|
| Issues experienced during provisioning of cloud trust | **MSaaS AAD - Auth Providers Premier** | 
| Issues experienced during PIN change/reset | **MSaaS AAD - Auth Providers Premier** |  
| Issues experienced not getting Cloud TGT/Partial TGT in the PRT | **MSaaS AAD - Auth Providers Premier** |  
| Issues experienced during configuring Kerberos Object On-Premises using PowerShell Script AzureAdKerberos.ps1 | **Directory Services Support Team** |
| Issues experienced during configuring Azure Object using PowerShell Script AzureAdKerberos.ps1 | **MSaaS AAD - Auth Providers Premier** |
| Issues experienced during accessing on-premises resources | **Directory Services Support Team** |
| On-premises Kerberos applications experiencing SSO related issues | **Directory Services Support Team** |
| Azure AD Cloud applications experiencing SSO related issues | **MSaaS AAD - Auth Providers Premier** |  

**Product:**   
Azure\Microsoft Entra Sign-in and Multifactor Authentication  
**Category:**   
Windows Hello for Business\Deploy Cloud Trust

Windows Hello for Business\Troubleshoot Cloud Trust

### What is the issue that the customer is facing?  
- Deployment of Cloud trust? Azure Identity Strong Auth Team: Collaborate with Directory Services if required  
- WHFB provisioning not working during logon or manually triggering the provisioning? Azure Identity Strong Auth Team: Collaborate with Directory Services if required  
- Issues related to reset PIN? Azure Identity Strong Auth Team: Collaborate with Directory Services if required  
- Issues concerning supportability or migration from Key Trust/Certificate Trust to Cloud Trust? Azure Identity Strong Auth Team: Collaborate with Directory Services if required  
- Issues related to accessing Cloud resources using WHFB credentials? Azure Identity Strong Auth Team: Collaborate with Directory Services if required  

### Scenarios that Directory Services would handle:  
- Issues related to accessing on-premises resources from Azure AD joined machines only while using WHFB credentials  
- Unable to set/reset/rotate Kerberos Object in Active Directory  
- Issues related to logging on for the first time without Line of Sight Domain Controller  

---

## Unable to access on-premises resources workflow

![Unable to access on-premises resources workflow](/.attachments/WHFB-87966bd6-3a33-493e-9011-458c1c560882.gif)

---

## Scoping

### Troubleshooting questions:  

- What is the operating system and build of the client machine?  
- What is the type of user? (Synced, Managed, Federated)  
- What is the type of WHFB deployment type configured?  
- Is the machine joined to Azure AD or Hybrid?  
- Can we reproduce the issue even by logging on using username/password instead of WHFB? (If this works, then you can consider it a working scenario to collect data.)  
- What are we not able to access?  
- Are we not able to access all on-premises resources or only some resources?  
  - For example, are we able to access \\Contosodc1.contoso.com\Sysvol?

---

## Log collection

Use the same as described [here](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586125/Workflow-FIDO2-Data-Collection)  
or  
Authentication scripts or TSSV2 collected on the client machines for the following scenarios:   
Choose one of the scenarios below to match your customer needs:  
 - [Lesson6-Task1-LogCollection-SwitchUser](https://microsofteur.sharepoint.com/teams/LearningDevelopment/_layouts/15/stream.aspx?id=%2Fteams%2FLearningDevelopment%2FCloud%20Academy%20Stream%20Transition%2FStream%20Migrated%20Videos%2FLesson6%2DTask1%2DLogCollection%2DSwitchUser%2D20210815%5F031341%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E4b1e9341%2D625a%2D4f00%2D9a3f%2Df6da84751c5c)
 - [Lesson6-Task2-LogCollection-RunAs](https://microsofteur.sharepoint.com/teams/LearningDevelopment/_layouts/15/stream.aspx?id=%2Fteams%2FLearningDevelopment%2FCloud%20Academy%20Stream%20Transition%2FStream%20Migrated%20Videos%2FLesson6%2DTask2%2DLogCollection%2DRunAs%2D20210815%5F031342%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E237f38be%2D1a0a%2D4a19%2Db393%2D1878563c629a)
 - [Lesson6-Task3-LogCollection-RemotePowershell](https://microsofteur.sharepoint.com/teams/LearningDevelopment/_layouts/15/stream.aspx?id=%2Fteams%2FLearningDevelopment%2FCloud%20Academy%20Stream%20Transition%2FStream%20Migrated%20Videos%2FLesson6%2DTask3%2DLogCollection%2DRemotePowershell%2D20210815%5F031619%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E404cefd0%2D8e32%2D4d28%2D9245%2Df8344d04bca0)

---

## Interpreting: Dsregcmd /status

Your troubleshooting starts with AzureAdPRT=YES. If this is not set to YES, then you have to engage the Azure Identity team.   
This is a good output of dsregcmd /status as you can observe below: OnPremTGT=YES and CloudTGT=YES, which means that the AzurePRT contains the OnPremTGT and CloudTGT. If you observe NO, then you have to engage the Azure Identity team.  
  
**NOTE:** The output only suggests that Azure has provided the OnPremTGT and CloudTGT to the client machine, but this is not proof that the client machine has utilized the PRT.

![Interpreting dsregcmd /status](/.attachments/image-7668de74-5c1c-449d-9f86-102710b2b623.png)

---

## Interpreting: Klist cloud_debug 

Open a normal command prompt after you sign in as a user and run the klist cloud_debug command. Find the explanation of each of the flags. This can be used to capture information about how the user signed in. 

### klist.exe cloud_debug explained

| Field                                      | Explanation                                                  | Value                |
| ------------------------------------------ | ------------------------------------------------------------ | -------------------- |
| Cloud Kerberos enabled by policy           | Pretty self-explanatory - will only be 1 if Cloud Kerberos is enabled via GP/MDM | 1 = yes<br />0 = no  |
| AS_REP callback received                   | Did Kerberos ever see a callback to retrieve data from AAD (via CloudAP) for this logon, which would include Cloud Primary TGT, Cloud Referral TGT, SPN Oracle config, and Cloud KDC Proxy config | 1 = yes<br />0 = no  |
| Cloud Referral TGT present in cache        | Do we have a referral to the Cloud Realm in the user's ticket cache? | 1 = yes<br />0 = no  |
| SPN oracle configured                      | Do we have the SPN oracle that tells us whether a given SPN is on-premises or cloud configured? | 1 = yes<br />0 = no  |
| KDC proxy present in cache                 | Do we have the config present that tells us how to contact the Cloud KDC? | 1 = yes<br />0 = no  |
| Public Key Credential Present              | Do the user's credentials include keypair-based credentials (includes smartcard, Windows Hello)? | 1 = yes<br />0 = no  |
| Password-derived Keys Present              | Do the user's credentials include keys derived from a password? | 1 = yes<br />0 = no  |
| Plaintext Password Present                 | Do the user's credentials include a password string (which will eventually be hashed into password-derived keys and wiped from memory)? | 1 = yes<br />0 = no  |
| Cloud Primary (Hybrid logon) TGT available | Is a Cloud Primary TGT (AKA McTicket) available (used for FIDO logon and Windows Hello Cloud Kerberos Trust)? | 1 = yes<br />0 = no  |
| AS_Rep Credential Type                     | McTicket-based credentials (FIDO, Windows Hello Cloud Kerberos Trust) will set this to a nonzero value<br/>- Note that the way the backports worked out, this field is only present on more recent OSes | >0 = yes<br />0 = no |

![Interpreting klist cloud_debug](/.attachments/image-48e0c4df-cd82-4822-b4cb-d46b1fc743df.png)

_Cloud Kerberos enabled by policy_ is for Azure files and is turned off for everyone.

_AS_Rep callback_ is how CloudAP tells Kerberos that we have a partial TGT or Cloud TGT available for your use. If this is 0, this means CloudAP got nothing, which means something went wrong and didnt get anything. This should always be 1. Contents of the PRT had no Kerberos-related information. 

_Callback used_  Kerberos knows what to do with the callback from CloudAP. This callback informs Kerberos of the partial TGT. It will only be executed if Cloud Kerberos enabled by policy is set to 1 (which isnt today). The other option is the partial TGT is used to retrieve a normal TGT. You can see this used if you use klist get krbtgt to retrieve a TGT using the callback. 

_Cloud referral TGT present in cache_ is for the Azure files scenario and should be 0 unless the policy is enabled. SPN and KDC proxy are also just for Cloud Kerberos/Azure files scenario.

---

## Frequently Asked Questions

https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/584659/Windows-Hello-for-Business-Cloud-Trust 

1. **What are the deployment models of WHFB-Cloud Trust scenario?**  
**Answer:**   
![Deployment models of WHFB-Cloud Trust](/.attachments/image-ef7389ac-7309-4825-9261-7bf959d3765f.png)  
All Microsoft Entra joined devices authenticate with Windows Hello for Business to Microsoft Entra ID the same way. The Windows Hello for Business trust type only impacts how the device authenticates to on-premises Active Directory.  
A deployment's trust type defines how Windows Hello for Business clients authenticate to Active Directory.   
The trust type doesn't affect authentication to Microsoft Entra ID. For this reason, the trust type isn't applicable to a cloud-only deployment model.    
Windows Hello for Business authentication to Microsoft Entra ID always uses the key, not a certificate (excluding smart card authentication in a federated environment).

1. **When a user signs in using the WHFB Cloud Trust model, will there be a difference in the PRT (Primary Refresh Token)?**  
**Answer:** When a user signs in to Azure AD, Azure AD detects Kerberos Server keys and issues a PRT which also includes a Partial TGT. When the user tries to access an on-premises resource, this Partial TGT is presented as a pre-auth data to get a Full TGT from an on-premises domain controller. 

1. **What is the validity of a Partial TGT?**  
**Answer:** The validity of a Partial TGT is 8 hours.

1. **Caching of Partial TGT on the client machine?**  
**Answer:** The Partial TGT does get cached on the client. This Partial TGT is presented when a request is made to the domain controller for a Full TGT (on-demand) when a user tries to connect to on-premises resources.

1. **Is there a need to go to a writable domain controller only for getting a Full TGT using the Partial TGT? (Scenario: When a client machine only has access to a Read-Only Domain Controller)?**  
**Answer:** Yes, you need to go to a writable domain controller to get a Full TGT. Cloud trust for FIDO and WHFB essentially follows the Read-Only Domain Controller model where the Read-Only Domain Controller is in the cloud. When you deploy the Cloud Kerberos pieces, you can see in Active Directory an Read-Only Domain Controller object is actually generated.

1. **Provisioning architecture! Are there any changes?**  
**Answer:** The actual provisioning process and requirements for successful provisioning have not changed. With all trust models, a prerequisite check is done to determine whether to launch the WHFB provisioning CXH. The logic that determines whether to launch this has changed for Hybrid Azure AD Joined devices, but the provisioning CXH logic remains the same. Azure AD Joined logic for launching provisioning has not changed.  
On Hybrid Azure AD Joined, if cloud trust policy is present and cert trust policy is not present, we will enforce cloud trust. For cloud trust, in addition to the normal key trust keys that we would do (is device domain joined, is hardware policy requirement met, etc.), we add the CloudTGT check (which you mentioned in a previous question on DSREG). This checks for whether a Partial TGT was retrieved from Azure AD and is present. We want to make sure a client can get Partial TGTs and use Cloud Kerberos before we allow for provisioning. We do this because if the client cannot get Partial TGTs, they may end up in a broken state and will not be able to log on.

1. **Any changes to Azure AD Joined devices sign-in and accessing on-premises resources?**  
**Answer:** Cloud trust follows the same process as FIDO security keys for this since we are reusing the same infrastructure. The changes that were made to support WHFB authentication with the Partial TGT were all in Kerberos.dll so that we could use the authentication patterns that were implemented for FIDO on-premises SSO.   
Logon for Azure AD Joined devices has not really changed, except that when the client requests a PRT, it will also request the Partial TGT. The Partial TGT will then be cached until the user needs to access an on-premises resource.  
For Hybrid Azure AD Joined, there is a new flag that is consumed by our Kerberos stack during logon that is set if cloud trust policy is enabled. If the flag is set, Kerberos will go down the path of FIDO and do an Azure AD pre-login to retrieve the Partial TGT from Azure. Once it has the Partial TGT, it will attempt to exchange this for a Full TGT as a part of network logon. If this fails, Kerberos will then attempt to do a legacy key-based authentication to the domain controller.   
Hybrid Azure AD Joined cloud trust supports cached login, so in most cases the cache will be used for login/unlock and the network login will be done behind the scenes to refresh tickets. Cloud trust required creation of a new cache type (existing WHFB deployments basically use the smart card cache). To hydrate the cache, a user must do a network login when cloud trust is enabled. This includes users migrating from existing trust types.

1. **Any changes to PIN reset behavior in WHFB Cloud Trust?**  
**Answer:** For PIN reset, we previously blocked destructive reset from the lock screen for Hybrid Azure AD Joined key trust devices. This was because after the reset, the user's PIN will not work because the public key needs to be synced down from the cloud. If cloud trust is enabled by policy, we made a change to expose PIN reset on the lock screen since it doesn't have the sync requirement for authentication to start working. The actual logic behind PIN reset has not been changed.

1. **Any changes to how to leave/reconfigure PIN?**  
**Answer:** There is no change or difference in this mechanism. The supported mechanism is to run `certutil -deletehellocontainer`. The user can also use the existing PIN reset flows to reset the PIN.

1. **Does the Cloud Trust now support applications which perform supplied credentials like RDP or WVD?**  
**Answer:** With cloud trust, the user will have a self-signed certificate for their WHFB keys similar to key trust. This means it has limitations like key trust when a valid certificate must be provided for authentication. Cloud trust does not address the limitations with WHFB key-based authentication and supplied credentials for RDP. There is separate work looking at enabling that, but it will not be available with cloud trust GA.

1. **Is it possible to enroll a certificate into a cloud trust container to enable certificate-based scenarios? Setting certificate GP at the user level.**  
- During logon, we check for the certificate and cloud trust policy. If the certificate trust device policy is set, we will use the certificate for legacy-based logon. Certificate policy will be enforced if both certificate trust and cloud trust policies are set. If you want to use cloud trust logon, the certificate policy must not be set at the device level.
- Certificate trust policy set at the user level in Group Policy cannot be queried from the logon screen. This means that if cloud trust is enabled at the device level and certificate trust is set at the user level, we will enforce cloud trust on the lock screen for logon, but then after logon, the certificate trust Group Policy will be enforced which will allow for enrollment of certificates through AD FS.

1. **Why are we issuing out Partial TGT and then the client is getting a Full TGT because we don't have the RSA key pair as compared to Key Trust and Certificate Trust: To build a trust model?**  
**Answer:** Azure has the key pair, but the domain controller may not. One of the reasons we built cloud trust was to address the delay that occurs when registering a key to Azure and it being available to the domain controller, which results in key trust users being blocked from authenticating and logging in. Azure can issue the Partial TGT so that we do not need to do any validation of the WHFB key against the domain controller. This makes it so the delay in syncing keys doesn't matter.

1. **Recommendations if mistakenly delete the krbtgt_AzureAD object which was created by the PowerShell script?**  
**Answer:** If someone deletes the object, they could use the scripts to create a new object and register a new key with Azure.  

1. **Do we need to add the users to the Group: WHFBCloudTrustUsers? (Like an authorization group)?**  
**Answer:** You do not need to add users to a specific group to get Partial TGTs from Azure. The only group you may need to set up is a group for managing policy to enable WHFB cloud trust.

1. **Create a Kerberos object privileges**  
A customer will need domain admin credentials for each domain where they want to create an object.   
By design, we do not allow credentials for another domain to be used to create an object in a separate domain.   
This is a pain point for setup, but it is also a security issue.

1. **Authentication Mechanism Assurance and Partial TGT**   
_the process breaks when client comes with a partial TGT from Entra Id Kerberos service.  
it appears that during KERB_AS_REQ process Active Directory identifies which certificate was used for Pre-Auth and assigns user to the group associated with the certificate type as specified in the policy.  
If this is accurate then, in the scenario where Partial TGT is used such as Entra Id Joined devices with Windows Hello For Business or Windows Client signin with FIDO2\passkey, the Pre-Auth process is bypassed completely thus Authentication Mechanism Assurance cannot make determinations which security group to place user based on what certificate they used since no certificate is used at all.  
does the Microsoft Entra Id still issue Partial TGT and if would it contain certificate information?_  
**Answer:** from PRINCIPAL SOFTWARE ENG MGR:      
They need to decide whether they want FIDO2 with passkeys or auth-assurance. You cant have it all.
Along the same lines, Kerberos FAST is not compatible as well. Machine must be a domain member, primary TGT has to come from on-prem DC.  
AMA inherently relies on a certificate being the presented credential during an AS-REQ because we map the OIDs in the certificate to a policy to issue a SID/group membership. If the AS-REQ doesnt have a certificate in it, you arent getting AMA. Partial TGTs bypass the AS flow entirely so its impossible to shove a certificate in and get AMA. If youre using WHFB key or cert trust then you _can_ use AMA since the call to on-prem does do the AS leg regardless of hybrid join or Entra join.  
Inside baseball trivia: the only thing we currently trust from the partial TGT is the username. Group membership and other metadata that can be used for authorization is ignored so even if the certificate was presented to Entra and Entra shoved mechanism data into the TGT, we still dont care about it. It would be a useful feature to support it, but we arent there yet.

---

## Resources  

**WHFB-Cloud Trust: Identity troubleshooting guide**  
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/584659/Windows-Hello-for-Business-Cloud-Trust 

**WHFB - Cloud Trust - Deep Dive Training**  
**Cloud Academy:** https://cloudacademy.com/learning-paths/windows-hello-for-business-whfb-cloud-trust-1854-5050/  
[Auth Microlearning: Strong Auth - Why WHFB Cloud Trust | QA Platform](https://platform.qa.com/resource/auth-microlearning-strong-auth-why-whfb-cloud-trust-1854/?context_id=15327&context_resource=lp)

**Streams:** https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x0120003BB1D7A30BC0B94A984670514F93D5C4&id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FLearningAssets%2FDS%2FWHFB%2DCloudTrust