---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Processes/Troubleshooting Guidance, Best Practices and Data Collection scenario templates"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FProcesses%2FTroubleshooting%20Guidance%2C%20Best%20Practices%20and%20Data%20Collection%20scenario%20templates"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.comm-M365ID
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [comm-M365ID](/Tags/comm%2DM365ID) 


[[_TOC_]]
# Troubleshooting and Data Collection Guidance and Best Practices

This article is meant to assist engineers in quickly identifying the customer's issue and to ensure that the appropriate troubleshooting data is collected for each scenario. 

When bringing a case to the Case Triage, we expect you to have gone through the steps described in this article, and that you have obtained the relevant data for further troubleshooting. 

## Scoping the Case

Before we start investigating an issue, it is important to have a crystal-clear understanding of the issue. If this is not clear from the customer's verbatim, we must engage the customer to ensure that our understanding of the issue is aligned with theirs. 

-  When in doubt, ask the customer what is the end purpose of their requirement, what articles are being followed to achieve their results. 

- If you are facing difficulties, you can refer to our [Generic Scoping Template](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/448029/Generic-Scoping-Template) and check which questions are relevant to your scenario.

- Once you have a clear understanding of the customer's issue, collect the relevant data for their scenario.

  - You can refer to [Data Collection templates](#scenario-based-data-collection-templates) for specific instructions on this point.

## Troubleshooting and Investigation

Some of these points may not apply to the issue you are currently troubleshooting - use the ones that are applicable to your scenario: 

 - Use our internal tools (ASC and Assist 365) to collect server-side logs and correlate them with the information you have collected. 

- Search our public documentation using your favourite search engine/copilot - if using a search engine, adding _site:learn.microsoft.com_ at the end of your query will narrow down the results:

  ![SearchEngine](/.attachments/search-33f51875-b275-4b65-8361-f7925a23cd01.png) 

- **Search our internal Wiki** to identify known issues and potential troubleshooting workflows related to the issue at hand: [One Identity Wiki](/Welcome/Getting-Started)

- Search the [IcM Portal](https://portal.microsofticm.com/imp/v3/incidents/search/advanced) for previous escalations related to the same error/issue.

- Search AVA (on Teams) for previous cases around the same issue, based on vertical subcategory:

  - [Authentication](https://teams.microsoft.com/l/team/19%3Ab092d7136ef34f6ba7c4bb27040b740b%40thread.skype/conversations?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) - for Authorization (Conditional Access, MFA), ADFS, Pass-Through Authentication and general AADSTS errors;
  - [Account Management](https://teams.microsoft.com/l/team/19%3A8ee33d4f41b340cb9a2947fd4d431dcb%40thread.skype/conversations?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) - for Licensing, B2B and Tenant Management topics;
  - [Synchronization](https://teams.microsoft.com/l/team/19%3A90d5870ee46c4012bf38ba3943c8425e%40thread.skype/conversations?groupId=70b122d3-4d70-4357-b412-a8051556c3a4&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) - for User Sync, Password Writeback and other sync-related topics;
  - If you did not find any relevant information, you can start your own AVA thread by following the [AVA Posting Guidelines](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/412850/Azure-Identity-Teams-Posting-Guidelines).

 - Create a test scenario/environment and attempt to reproduce the issue.
 - Leverage the team and the community - if you have collected and reviewed the data and are still blocked, engage the technology SME's directly and discuss your case in the Case Triage.

## Scenario-Based Data Collection Templates


### Sign-in Issues

<details>
<summary>Click to expand this section</summary>

#### Desktop Apps (OneAuth / WAM)
<details>
<summary>Click for details...</summary>

 - Collect [MSOAID logs](https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/diagnostic-logs/use-msoaid-for-authentication-issues) while reproducing the issue
   - Unless specifically requested, collect these logs **without** Fiddler, as using Fiddler can be misleading and introduce networking issues in several scenarios.
   - Since the MSOAID logs are collected in the Admin context, ask the customer to provide the output of the **dsregcmd /status** and **whoami -upn** when executed in the user context (run the command prompt as a **regular user**. 
       - Tip: to output the command results to a txt file, you can use **dsregcmd /status > output.txt** (for instance) 
- Scope the issue to understand which applications are impacted
  - If a single app is impacted (ex. OneDrive), we need to collect the application logs from that app, and we should engage the respective app team via collaboration task.
  
`Relevant Wiki articles to be checked:`
  - [WAM Log Collection and Analysis](/M365-Identity/Authentication-and-Access/WAM-Log-Collection-and-Analysis)
  - [Troubleshooting WAM related SSO issues](/GeneralPages/AAD/AAD-Authentication/Device-Registration/Troubleshooting-WAM-related-SSO-issues)
  </details>
  

#### Web Apps (Admin Portal, etc)
<details>
<summary>Click for details...</summary>

1. Scope the issue by testing the Web App in several different browsers, as well as InPrivate/Incognito modes. This will allow you to exclude local cache/cookie issues.
2. [Collect a Network Trace](https://learn.microsoft.com/en-us/azure/azure-web-pubsub/howto-troubleshoot-network-trace) (use Fiddler or the Browser Trace) and a [Steps Recorder](https://support.microsoft.com/en-us/windows/record-steps-to-reproduce-a-problem-46582a9b-620f-2e36-00c9-04e25d784e47) simultaneously, while reproducing the issue.
</details>

#### Mobile Apps
<details>
<summary>Click for details...</summary>

- Collect the [Authenticator App](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/send-microsoft-authenticator-logs) logs, or [Company Portal](https://learn.microsoft.com/en-us/mem/intune/user-help/send-logs-to-your-it-admin-by-email-android) logs if the device is managed.
- If no Broker App is being used, we need to collect app-specific logs for each scenario, and we should engage the respective app team via collaboration task to obtain this information.
</details>
</details>

### Identity Protection Issues

<details>
<summary>Click to expand this section</summary>

#### Conditional Access

<details>
<summary>Click for details...</summary>

- We need a Correlation ID + Timestamp from the scenario we are investigating.
- In addition to this, we should obtain the Policy ID that the customer expected different results from, so that we can review the Policy details, its scope, and understand what differs from the customer's expectations.  

`Relevant Wiki section:`  
- [Azure AD Conditional Access Policy](/GeneralPages/AAD/AAD-Authentication/Azure-AD-Conditional-Access-Policy)
</details>

#### MFA
<details>
<summary>Click for details...  </summary>

- **Unexpected prompts:** We need a Correlation ID + Timestamp from the scenario we are investigating.
- **MFA Loop:** In addition to CID + Timestamp, collect a Fiddler/HAR trace if the issue is affecting Desktop/Web Apps.
- **Authenticator App issues:** Collect the Incident ID from the Authenticator App.

`Check the MFA Wiki section:`  
 - [Azure AD MFA](/GeneralPages/AAD/AAD-Authentication/Azure-AD-MFA)
</details>

#### Continuous Access Evaluation (CAE)

<details>
<summary>Click for details...</summary>

- [Collect a Fiddler or HAR trace](https://learn.microsoft.com/en-us/azure/azure-web-pubsub/howto-troubleshoot-network-trace) while reproducing the issue.   

`Relevant Wiki articles to be checked:`  
- [Azure AD Continuous Access Evaluation](/GeneralPages/AAD/AAD-Authentication/Azure-AD-Conditional-Access-Policy/Azure-AD-Continuous-Access-Evaluation)

</details>
</details>

### Identity Management & Sync

<details>
<summary>Click to expand this section</summary>

#### Licensing and Group-Based Licensing
> _Coming soon_
#### Synchronization

<details>
<summary>Click for details...</summary>

 - Issues affecting a single object (user, group, etc):
    - Collect the UPN / e-mail / ObjectID for the impacted object;
    - Check if the health agents are communicating, to review the configuration and synchronization flow logs:
       - On ASC, select AAD Connect Synchronization and select any tab other than "Sync Properties and Features". If the information resembles the screenshot below, we need to engage the customer for further investigation in a remote session:
![image (1).png](/.attachments/image%20(1)-128ad09e-c40f-4d24-bb0a-f3b2d8a17e3c.png)

</details>

#### Password Hash Synchronization 

<details>
<summary>Click for details...</summary>

 - Check if the feature is enabled in AAD Connect;
 - Check the Event Viewer logs on customer's Sync server to look for errors.

 </details>

 </details>

### ADFS

<details>
<summary>Click for details...</summary>

#### Sign-in Issues

Relevant questions:
 - What is the error message?
 - Is the issue happening for users in the corporate network, outside corporate network or both?
 - Is the issue happening for a single user or multiple users?
 - Is this affecting a specific location? Specific office, region?
 - Is the issue impacting only M365 apps? Is this happening in the browsers? Or rich applications?

Relevant logs to collect: 
 - Fiddler trace
 - ADFS logs (instructions to collect these below)

**Collecting ADFS logs:**

ADFS Tracing PS script - Download zip file - https://github.com/CSS-Identity/ADFS-Diag/

  ![DownloadTracingScript](/.attachments/adfstracingscript.png) 
 
```
1. Create a folder on the machine where the tracing is going to run (the ADFS servers). Example: C:\temp
2. Copy the file from the Github link to that folder, in all the servers (if the issue is happening for the users outside corporate network, include all WAP servers too). Extract it and Remove the .txt extension, leaving only .ps1
3. Before collecting traces, close all the applications that are not strictly needed to reproduce the problem. This will avoid capturing unneeded information.
4. Run the PowerShell script with elevated privileges in all the machines, use the "Browse" button to select the C:\Temp folder. Then choose the option “Runtime Tracing” and click OK.
5. The script will prepare itself to start capturing. When you have the script in this prompt in all the servers, just hit any key to start collecting data in all of them. 
   5.1 Reproduce the issue

It will then display another message to inform you that it's collecting data, and waiting for another key to be pressed to stop the capture.
6.Copy the .ZIP file generated by PowerShell trace script and upload it to the following secure location: <INSERT DTM LINK HERE>.
```

`Check the relevant Wiki section:`  
- [ADFS and WAP](/GeneralPages/AAD/AAD-Authentication/ADFS-and-WAP)
<<<<<<< HEAD

</details>
=======
>>>>>>> 89f02cd76bdcf36a1ef4000453743388cf138d8b
