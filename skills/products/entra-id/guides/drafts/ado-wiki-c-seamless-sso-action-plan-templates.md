---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Seamless Single Sign On (SSO)/Seamless SSO - Action Plan Templates for Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Seamless%20Single%20Sign%20On%20%28SSO%29%2FSeamless%20SSO%20-%20Action%20Plan%20Templates%20for%20Data%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]


# **Entra Seamless SSO Collector Script**

=========================== Internal information ===============================

We have separate action plans for all the data that will be collected by the data collector script,
however, we recommend using the script, if possible.

=========================== Internal information ===============================

The purpose of the Data Collector Script is to collect all the data that might be required to troubleshoot the issue you reported to the Microsoft Customer Support Services (CSS) on an efficient way. This Data Collector Script collects the following information:

[[_TOC_]]

|Name of the File  |Description  |Troubleshooting tip  |
|--|--|--|
|GPReport.html |Collect the Group Policy applied on the Client machine  |Ensure that the Entra URL (https://autologon.microsoftazuread-sso.com) is part of the user's Intranet zone settings. more information: https://learn.microsoft.com/azure/active-directory/hybrid/connect/how-to-connect-sso-quick-start#group-policy-detailed-steps.
  |network_trace.etl|Collect Network trace while repro the issue|You can open it in [Network Monitor 3.4](https://www.microsoft.com/download/4865) or Message Analyzer or you can convert it with [InsightClient](https://cesdiagtools.blob.core.windows.net/crossproduct/insightclient64/insider/InsightClient.application)|
|http_autologon_microsoftazuread_sso_com.txt And AZUREADSSOACC.txt  |This will help to check if their issue to retrieve Kerberos ticket for the SSSO SPN|List the existing Kerberos tickets on the device by using the klist command from a command prompt. Ensure that the tickets issued for the AZUREADSSOACC computer account are present. Users' Kerberos tickets are typically valid for 10 hours. You might have different settings in Entra.|
|edge-net-export-log.json ( if you use default Name)|Collect browser trace|This will help to collect Browser trace which can be analyzed by import the Json file to Fiddler.|
|AZUREADSSOACC.txt|Collect AZUREADSSOACC attributes from Active Directory|This will help to identify the Computer object for SSSSO not deleted or disabled. Will help to check configured SPN for AZUREADSSOACC. will help to check the Encryption configuration used by AZUREADSSOACC|
|OS_version.txt|Test Client Operating System version |
|dsregcmd_status.txt|Collect Hybrid Joined Status for the test machine.|Collect Hybrid Joined Status for the test machine.|
|SecurityEvents.evtx|Security Events|Standard Security Log during the repro and the last 4 hours.validate the success and failed logged On.|
|Whoami.txt|Current Logged On User UPN and SID|Current Logged On User UPN and SID|
|ProxyConfiguration.txt|Outbound Proxy|Check if the Outbound proxy configured under user context or winhttp|







The collected data may contain Personally Identifiable Information (PII) and/or sensitive data, such as (but not limited to) IP addresses, Device names, and User Names.

Once the tracing and data collection has completed, the script will create a compressed file called **_COMPUTERNAME__DATEANDTIME_.zip**. This file is not automatically sent to Microsoft. You can send it to Microsoft CSS using a secure workspace. The link is provided by your Support Engineer.

If you have any concerns or would like to know more details about the data the script collects, please don't hesitate to contact us and don't start the data collection (or don't send the data to us).

Microsoft Privacy Statement: https://privacy.microsoft.com/privacy

================== NOT FOR CUSTOMER ====================

At the moment the script can be downloaded from this csswiki.
we are working to upload the Script to CaseBuddy as common File.

[SeamlessSSO-DataCollectorV1.3.ps1](/.attachments/SeamlessSSO-DataCollectorV1.3-def7d8c3-c4a3-4652-a596-00882d8cf867.ps1)

**Action Plan**
1. Create a folder on the Test machine. Example: C:\tracing. Download the SeamlessSSO-DataCollectorV1.ps1 file from the workspace and copy it into the folder.
2. In File Explorer go over the file. Check the properties of the file and unblock the file, if it's blocked.
3. Open a PowerShell window  with elevated privileges in the Test Machine, navigate to the C:\tracing folder, and execute SeamlessSSO-DataCollectorV1.ps1. Important: Provide an absolute Path to the script (like "C:\tracing" and not just "tracing" or ".\tracing")
4. The script will prepare itself to start capturing.

5. Please follow the steps below to collect the browser trace:

   Step 1: Open a new tab in Microsoft Edge or Google Chrome".

   Step 2: Type 'edge://net-export' or 'chrome://net-export' in the address bar and press Enter".

   Step 3: Select third Option: Include raw bytes (will include cookies and credentials).

      ![image.png](/.attachments/image-984e89e3-316a-4afc-a5e1-db8696fe7cd5.png)

    
     
   Step 4: Click the 'Start Logging' button to start capturing the Browser trace.

   Step 5: Open a new tab and go to https://portal.office.com.

   Step 6: Reproduce the Issue by Enter your username and password to sign into the portal.

   Step 7: once the Sign-In finished Go back to the first Tab and stop the trace, Save the File with Default 
           Name to the Same Location.

   Step 8: Press Continue to Stop the Trace.

6. Upload the Compress File to the Workspace.


If you have any feedback on this article or you need assistance, please contact us over the PTA and Seamless SSO, Staged Rollout Teams channel  or send a request / feedback  to the Hybrid Authentication Experiences Community.
