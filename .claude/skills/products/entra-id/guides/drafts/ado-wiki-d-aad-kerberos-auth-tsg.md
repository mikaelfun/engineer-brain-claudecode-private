---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Kerberos/Azure AD Kerberos Authentication TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Kerberos%2FAzure%20AD%20Kerberos%20Authentication%20TSG"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Authentication-Kerberos
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 
[[_TOC_]]


# Compliance note
This wiki contains test and/or lab data only.

# Overview

## Kerberos Protocol
[![items.png](/.attachments/AAD-Authentication/541065/items.png)](/.attachments/AAD-Authentication/541065/items.png)

Reference: [Kerberos Explained in a Little Too Much Detail](https://syfuhs.net/a-bit-about-kerberos)

## AAD Kerberos

[![items1.png](/.attachments/AAD-Authentication/541065/items1.png)](/.attachments/AAD-Authentication/541065/items1.png)

## Requirements
- Requires device to be Hybrid Azure AD joined or Azure AD joined
- Requires the user to be a hybrid user
- Windows Client version >= 20H1 (2004)
- Does not require line of sight to the on-prem domain controller

# Symptom - How do we verify ESTS is issuing an "OnPremTGT" for hybrid authentication
**Description**
- Output of "dsregcmd /status" also indicates "OnpremTGT : NO"
- Output of "klist cloud_debug" indicates "Cloud Primary (Hybrid logon) TGT available: 0"

**Solution**

1. In ASC check sign-in events for that user to the "Windows Sign In" application.  (This application is indicative of PRT acquisition)
1. Click on "Troubleshoot this sign-in" to launch the authentication troubleshooter.
1. In the authentication troubleshooter, go to "Expert" view and filter the "PerRequestLogs" by the value KerberosOps.  There will be a line without output similar to this
![image.png](/.attachments/image-758b2b58-ebac-4ae3-b4b0-cf2ab59564bf.png)
Looking at the "Value" section we can decode the status codes returned by AAD Kerberos (last 3 numbers).

        /// <summary>
        /// Successfully issued an On-Prem TGT.
        /// </summary>
        SuccessGeneratedRodcTgt = 1,
        /// <summary>
        /// Successfully issued a Cloud TGT.
        /// </summary>
        SuccessGeneratedCloudTgt = 2,
        /// <summary>
        /// The Kerberos domain does not have a primary key.
        /// </summary>
        KerberosDomainPrimaryKeyNull = 112,
In the above screenshot we can tell that AAD Kerberos **did** issue an "OnPremTGT" (value of 1), it did issue a "CloudTGT" (value of 2), and that the customer has not rotated their Krb_TGT key yet (value of 112).

An example of a failure may look like this 
- "OT:'OAAR' ERR:'' SC:'27,28,2'" -- *Note the value of 1 is missing.*

In this output we see that AAD Kerberos did issue a "CloudTGT" (value of 2) but the other values (27 and 28) indicate the "OnPremTGT" was not issued due to the following errors

        /// <summary>
        /// Requested TGT for a user that does not have a OnPremisesSamAccountName.
        /// This will cause us to not issue an OnPrem TGT. (Non-fatal)
        /// </summary>
        TgtUserOnPremisesSamAccountNameMissing = 26,
        /// <summary>
        /// Requested TGT for a user that does not have a DnsDomainName.
        /// This will cause us to not issue an OnPrem TGT. (Non-fatal)
        /// </summary>
        TgtUserDnsDomainNameMissing = 27,
        /// <summary>
        /// User's Kerberos domain is missing keys.
        /// This will cause us to not issue an OnPrem TGT. (Non-fatal)
        /// </summary>
        TgtRodcKrbtgtNotFound = 28,

In this case the customer was missing the transform rules in AAD Connect to synchronize the DnsDomainName attribute which is exposed as the "onPremisesDomainName" in Graph (use graph explorer in ASC to validate this information).

The above status code list is not exhaustive, please contact jjstreic if you need further return codes documented.

# Symptom - Cannot Access Azure File based File Share on AVD
---
**Description**
Customer is experiencing issues when attempting to access an Azure File Share from Azure Virtual Desktop.
[Customer Deployment Guide](https://review.docs.microsoft.com/en-us/azure/active-directory/authentication/how-to-kerberos-authentication-azure-files?branch=pr-en-us-176458)

**Solution**
1. [Check prerequisites](#check-prerequisites)
1. [Check TGT issuance Uplevel](#check-tgt-issuance-uplevel)
1. [Check Service Ticket issuance](#check-service-ticket-issuance)

# Appendix


## Check prerequisites
---

1. Are they signed in with a hybrid user?

The user needs to be managed in Active Directory and synced up to Azure AD.
- Navigate to Azure Portal > Azure Active Directory > Users.
- Find the user in question, and confirm that Directory Synced is Yes.

[![items2.png](/.attachments/AAD-Authentication/541065/items2.png)](/.attachments/AAD-Authentication/541065/items2.png)

2. Do they have a PRT?
   
This can be confirmed via `dsregcmd /status`.

[![item3.png](/.attachments/AAD-Authentication/541065/items3.png)](/.attachments/AAD-Authentication/541065/items3.png)

If AzureAdPrt == YES, then jump out of this section.

If it is not present, the continue this section as there might be AADJ errors.

3. Is the client machine Hybrid Azure AD joined, or Azure AD joined?

> This is not required for scenarios that support the downlevel flow.

This can be verified by checking `dsregcmd /status` and verifying that AzureAdJoined is YES.

[![items4.png](/.attachments/AAD-Authentication/541065/items4.png)](/.attachments/AAD-Authentication/541065/items4.png)

4. Are there any AADJ errors?

This can prevent the client from getting a PRT. This can be confirmed via `dsregcmd /status`. If there are errors here, resolve the errors before proceeding. If you resolved AADJ errors, you might need to refresh the PRT. Do this by running `dsregcmd /refreshprt` and locking and unlocking the device.

[![items5.png](/.attachments/AAD-Authentication/541065/items5.png)](/.attachments/AAD-Authentication/541065/items5.png)

## Check TGT issuance Uplevel
1. Check the Windows Client version is >= 20H1 (2004).

2. Check if they are able to get a TGT. Run `klist get krbtgt`. You should be able to see a Kerberos ticket in the tray for krbtgt/KERBEROS.MICROSOFTONLINE.COM issued by KERBEROS.MICROSOFTONLINE.COM.
    
[![items6.png](/.attachments/AAD-Authentication/541065/items6.png)](/.attachments/AAD-Authentication/541065/items6.png)

If you are able to see the TGT, jump out of this section.

If you are not able to and you have confirmed that the client does have a PRT. Proceed.

3. Note that users with existing logon sessions may need to refresh their PRT if they attempt to use this feature immediately after it�s enabled. It can take up to a few hours for the PRT to refresh on its own. Administrators should consider scheduling this outside of normal working hours for the cache to expire. Otherwise, run the following command to refresh it manually:

    - dsregcmd /RefreshPrt
    - lock/unlock
    - klist purge
    - klist get krbtgt




4. Do they have the Kerberos group policy configured?

The path for the policy is: Administrative Templates > System > Kerberos > Allow retrieving the cloud kerberos ticket during the logon.

[![items7.png](/.attachments/AAD-Authentication/541065/items7.png)](/.attachments/AAD-Authentication/541065/items7.png)

The customer may have configured the policy via registry key, check the registry entries to ensure that it is enabled. 

There are two locations this can be configured:
- Group Policy Location
Path: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters`
Word: `CloudKerberosTicketRetrievalEnabled dword=1`
- Non-Group Policy Location
Path: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters`
Word: `CloudKerberosTicketRetrievalEnabled dword=1`

## Check Service Ticket Issuance
Attempt to get a service ticket using `klist get cifs/<myfileshare>.core.windows.net`

If successful, but customer still cannot access file share escalate to Azure Files.

[![items8.png](/.attachments/AAD-Authentication/541065/items8.png)](/.attachments/AAD-Authentication/541065/items8.png)

If unsuccessful

[![items9.png](/.attachments/AAD-Authentication/541065/items9.png)](/.attachments/AAD-Authentication/541065/items9.png)

1. Rerun the command with Fiddler + Kerberos fiddler extension
[Kerberos Fiddler Extension Reference](https://syfuhs.net/a-fiddler-extension-for-kerberos-messages)
[Kerberos Fiddler Extension Download](https://github.com/dotnet/Kerberos.NET/releases)

    1. With fiddler running, rerun the klist command.
    2. You should be able to see a request made out to the login.microsoftonline.com endpoint with the path `/<tenantid>/kerberos`
Here is an example of a successful case:

[![items10.png](/.attachments/AAD-Authentication/541065/items10.png)](/.attachments/AAD-Authentication/541065/items10.png)

Here is an example of an unsuccessful case:

[![items11.png](/.attachments/AAD-Authentication/541065/items11.png)](/.attachments/AAD-Authentication/541065/items11.png)

2. The response should be of type KRB_ERROR if the request failed. Check the ErrorCode and EText to see if there is meaningful information present.

Common Failure Conditions
1. Application is not configured properly
    - Service principal name is not correctly registered in the tenant. AAD won't be able to find the application for which they are trying to request a service ticket.
    - Consent is not granted for the application in the tenant. Users cannot consent to the application because Kerberos is non-interactive.
    - KerberosKey is not correctly provisioned on the service principal. AAD won't be able to issue a meaningful Kerberos service ticket.
2. Conditional access policies not satisfied
    - Multi-factor authentication (supported). User needs to be signed onto the device with an authentication method that Azure AD considers as MFA (e.g. Windows Hello for Business)
    - Sign-in frequency (limited support). There can be failures if the customer has configured a policy that is < than the lifetime of the token.
    - Device compliance conditional access policy. Not supported yet, common soon in the next month. (Statement as of (10/20/2021)

If there is not enough information availabile via Fiddler proceed.

3. Investigate ASC Sign-In logs using request id

    - Using the RequestId from fiddler (x-ms-request-id: <guid>) from the response headers, navigate to ASC and find the corresponding Sign-In log entry.
