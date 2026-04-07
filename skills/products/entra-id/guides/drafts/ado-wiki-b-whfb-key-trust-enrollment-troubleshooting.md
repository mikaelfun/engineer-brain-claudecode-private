---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/Common scenarios/P1 WHfB Key Trust enrollment does not happen"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/Hello%20for%20Business/Common%20scenarios/P1%20WHfB%20Key%20Trust%20enrollment%20does%20not%20happen"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Workflow
- cw.Passwordless
- cw.Windows-Hello-for-Business
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Workflow](/Tags/AAD%2DPasswordless) [AAD-Workflow](/Tags/AAD%2DWindows-Hello-for-Business)
 

[[_TOC_]]


## Scenario: WHfB enrollment does not happen (Key trust)

**NOTE:** The steps below can be used for live troubleshooting scenarios where the engineer is in a call with the customer and teh affected user/device. The same logs can be checked if you have collected the logs for analysis.

  - Ensure the customer has met the pre-requisites as per requirements, depending on the trust and deployment scenario.
  - If Active Directory GPO is used, you can use the below command to view the applied group policy settings:

**GPRESULT /h \> gp.html**

  - On the client machine execute the command “DSREGCMD /STATUS” look for the section “Ngc Prerequisite Check” as shown below.
  - If PreReqResult says WillNotProvision then move to the next step.

<!-- end list -->

```
    +----------------------------------------------------------------------+
    | Ngc Prerequisite Check                                               |
    +----------------------------------------------------------------------+
              IsUserAzureAD : NO
              PolicyEnabled : NO
             DeviceEligible : YES
         SessionIsNotRemote : YES
             CertEnrollment : none
          AadRecoveryNeeded : NO
               PreReqResult : WillNotProvision
```

  - Enable Analytic and Debug logs in event viewer.

<!-- end list -->

``` 
   launch Event viewer
   Click on View in the tool bar and select “Show Analytic and Debug logs”
```

  - Enable Debug logging for **“User device registration”**

<!-- end list -->

``` 
   In the event viewer 
   Browse to “Application and Service logs > Microsoft > Windows > User device registration”
   Select Debug, right click Debug and select Enable
```

  - Sign out as the user and sign in back (repro the issue)
  - In the event viewer browse to **“Application and Service logs \> Microsoft \> Windows \> User device registration”** and look at **Admin** logs.

<!-- end list -->

``` 
 Look for warning event ID 360.
 These events provide details on checks it performed before Windows Hello for Business is launched. Sample from the event below
```

```
    Windows Hello for Business provisioning will not be launched. 
    Device is AAD joined ( AADJ or DJ++ ): Yes 
    User has logged on with AAD credentials: No 
    Windows Hello for Business policy is enabled: No 
    Local computer meets Windows hello for business hardware requirements: Yes 
    User is not connected to the machine via Remote Desktop: Yes 
    User certificate for on premise auth policy is enabled: No 
    Machine is governed by none policy.
```

Based on the Precheck failure need to proceed with the troubleshooting.
for example,
**Device is AAD joined ( AADJ or DJ++ ): NO**
This means the device is not Hybrid Joined. Need to first complete the Hybrid Join process.
**User has logged on with AAD credentials: No**
This means the user has not logged in to the machine with a account that is present in Azure AD.
or user Authentication has failed for some reason.
**User is not connected to the machine via Remote Desktop: NO**
This means the user is logged in to the machine using RDP session and not console login session.

  - If the events in the **Admin** logs do not help, then look at **Debug event logs**.

If you find the failure is due to Authentication
**OR**
You see **“AzureAdPrt : NO“** in the **DSREGCMD / STATUS** command (sample below) Need to analyze AAD Event logs.

```
    +----------------------------------------------------------------------+
    | User State                                                           |
    +----------------------------------------------------------------------+
                     NgcSet : NO
            WorkplaceJoined : NO
              WamDefaultSet : NO
                 AzureAdPrt : NO
        AzureAdPrtAuthority : 
              EnterprisePrt : NO
     EnterprisePrtAuthority :
```

  - Launch event viewer and browse to **“Application and Service logs \> Microsoft \> Windows \> AAD”**

<!-- end list -->

``` 
 Select Analytic, Right click Analytic and select enable.
```

  - Sign out as the user and sign in back (repro the issue)
  - In the event viewer browse to **“Application and Service logs \> Microsoft \> Windows \> AAD”** and look at **Operational** and **Analytic** logs.
  - Look for warnings and errors. Sample error below

<!-- end list -->

```
    * Enterprise STS Logon failure. Status: 0xC000006D Correlation ID:
    * MSIS9683: Received invalid OAuth JWT Bearer request. Transport key for the device is invalid. It must be a RSA public key blob or TPM storage key blob. CorrelationID:
    * MSIS9682: Received invalid OAuth JWT Bearer request. The certificate used to sign JWT Bearer request is not from a registered device with a Transport key. CorrelationID:
```

  - Based on the authentication error and the environment need to proceed with further troubleshooting.
  - If it’s a federated environment, then start looking at AD FS event logs (Admin and Debug).
  - If it’s managed environment, then need to look at the Azure AD Logs (Jarvis or Kusto queries).



### Hybrid Azure AD joined Key Trust Deployment - Windows hello for Business provisioning does not trigger

Ensure the customer has followed the instructions and met all the prerequisites as specified in the article <https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-key-trust>

To troubleshoot this issue collect the below logs for analysis.

Event logs - Application and Service logs / Microsoft / Windows / User device registration / Admin

Group Policy result - gpresult /H

In the event logs look for below event

``` 
 Log Name:      Microsoft-Windows-User Device Registration/Admin
 Source:        Microsoft-Windows-User Device Registration
 Date:          <Date and Time>
 Event ID:      362
 Task Category: None
 Level:         Warning
 Keywords:      
 User:          <User SID>
 Computer:      <Computer Name>
 Description:
 Windows Hello for Business provisioning will not be launched. 
 Device is AAD joined ( AADJ or DJ++ ): Yes 
 User has logged on with AAD credentials: No 
 Windows Hello for Business policy is enabled: Yes 
 Local computer meets Windows hello for business hardware requirements: Yes 
 User is not connected to the machine via Remote Desktop: Yes 
 User certificate for on premise auth policy is enabled: Yes 
 Enterprise user logon certificate enrollment endpoint is ready: No 
 Enterprise user logon certificate template is : Not Tested 
 User has successfully authenticated to the enterprise STS: No 
 Certificate enrollment method: enrollment authority 
 See https://go.microsoft.com/fwlink/?linkid=832647 for more details.
```

If the above event is seen and the statements **"Enterprise user logon certificate enrollment endpoint is ready: No"** and **"Enterprise user logon certificate template is : Not Tested"** are also present then look at the Group Policy Result.

See if the below Group Policy setting is enabled under user configuration or computer configuration
"Use certificate for on-premises authentication" located under Administrative Templates / Windows Component / Windows Hello for Business
If enabled, need to set this to "Not Configured"

The Group Policy Setting "Use certificate for on-premises authentication" is used in Hybrid Azure AD joined Certificate Trust Deployment.

----

[[_TOSP_]]



