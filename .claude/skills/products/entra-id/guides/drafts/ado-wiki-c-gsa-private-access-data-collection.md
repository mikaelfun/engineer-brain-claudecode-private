---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/GSA Private Access - Data Collection guide for accessing application issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FInternal%20Docs%2FGSA%20Private%20Access%20-%20Data%20Collection%20guide%20for%20accessing%20application%20issues"
importDate: "2026-04-07"
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


#**Introduction**   

This Troubleshooting Guide (TSG) provides a comprehensive action plan to collect data related to accessing applications through Entra Private Access. Follow the steps outlined to ensure thorough data collection and effective troubleshooting.

This TSG will cover the action plan for the data required to troubleshoot the scenarios below, but is not limited to:

When using Private Access...

- Unable to access resources (web apps, file share etc.)

- Slow or degraded access to resources 

- Frequent or sporadic application timeouts 

- Client application crashes or fails working

- Intermittent connectivity drops or reconnections during sessions 

- Inconsistent user authentication experiences (e.g., repeated prompts, failures during login) 

- Network-related issues, such as DNS resolution failures or routing misconfigurations 

# **General Troubleshooting Questions for Application Access Issues**

This document offers a set of general questions and answers that engineers should be able to ask and provide when escalating cases related to application access issues. The questions are designed to be applicable to any application and protocol.

  Q: What is the current version of the connector and client software being used? Please be sure customer uses the latest version before starting with deeper troubleshooting.

  Q: Is the issue affecting all users? Or just specific users? Do the affected users share any common characteristics?

  Q: What does the user exactly do? (accessing a file share, accessing a web app etc.) More details about the involved component? (i.e. file share: is this a normal or DFS share or Azure File Share? What is the client (Outlook, browser), Name of the client and Server components? (Edge, Chrome, Outlook, IIS etc.) Any public documentation that describes the network and authentication requirements of the scenario?

  Q: Does the same behavior occur when the same computer, signed in with the same user account, is connected to the internal network with the Global Secure Access client disabled? (if not, this is not an issue caused by Global Secure Access)

  Q: Can a network connectivity be established from the Private Connector to the resource? (if not, this must be troubleshooted first)

  Q: Are users unable to access the application at all or just intermittently? 

  Q: Is the application access slow or experiencing timeouts? 

  Q: Is there specific action when the performance issues are more noticeable? 

  Q: Are users experiencing inconsistent authentication when accessing the application? 

  Q: Is there any error messages displayed or logged when the issue happens? 

  Q: How can the issue be replicated? (step by step) What URL, destination FQDN / IP address, Port is used?

  Q: What Network Access Application has the configured app segment to the access for the targeted application? (Find the Application ID and configuration in the ASC portal)

  Q: how many Servers the backend application is running on, and if there is any network device between the 
     connector servers and backend as an example Load Balancer? 

  Q: Is there any additional information that could be relevant to the case? 

  A: [additional information which you may think it is helpful as an example the backend application authentication 
    use Kerberos, Private DNS enabled, issue in Quick Access or Enterprise App]

## **Action Plan**

_**Note**_: Both the GSA client and connector action plans must run simultaneously. Furthermore, please create information about what the user exactly did during the repro. (Screenshots or PSR or video clip).

### **Private network connector server** 

1. Run the MEPNC Data collector script with **-GSA** switch on the connector. Note: if you have more than one connector in the connector group please be sure to run the script in all of them.

[MEPNC Data Collector Script and Action Plan](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Azure-AD-Application-Proxy-Action-Plan-Templates-for-Data-Collection?anchor=**microsoft-entra-application-proxy-connector-data-collector-script-(former%3A-azure-ad-application-proxy-connector-data-collector-script)**)

### **GSA Client**
1. Ensure you have the latest GSA client installed.  [latest version](https://learn.microsoft.com/en-us/entra/global-secure-access/reference-windows-client-release-history)

2. Collect data using Advanced log collection:

   - Right-click the Global Secure Access client icon in the system tray. 

   - Select Advanced Diagnostics. If enabled, User Account Control (UAC) prompts for elevation of privileges. 

   - Select Advanced Log Collection tab

   - Press **Start recording**

      [more Information] (https://learn.microsoft.com/en-us/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics)

3. Reproduce the issue by accessing the Application configured with GSA from the GSA Client device.

  I. 

   **Note**: If the application is a browser-based web application, collect the browser trace by  	          following 
         these steps:

   a. Navigate to edge://net-export/ (chrome://net-export/)

   b. Ensure the "Include raw bytes" option (highlighted) is selected, so we capture useful authentication 
       information.

![browsertrace.jpg](/.attachments/browsertrace-d56b2ffb-486d-4a07-bd05-ab6eb850cf48.jpg)


   c. Then click 'Start Logging to Disk' button to start the trace. This tab should remain open while reproducing the issue.

   d. Open a different tab and reproduce the issue

   e. Go back to the net-export page and click on the 'Stop Logging to Disk' button 

   f. Save the generated json file and upload it to the workspace

 II.

**Note**: if this is a file share access issue, please always ask the customer to try to access the file share directly using the UNC path (\\servername\share). Don't map or try to access a mapped drive.

5. Once you finish, stop the Data collector on the Connector server, stop the Advanced log collection.
6. Ask the customer to upload the data collected from the connector and client.

=

### **Collecting a Dataset for the Working Scenario**

Gathering data from a working scenario can significantly accelerate the investigation process. To do this, ensure the�**same computer is connected to the internal network**.
1.  **Disable the GSA client**.
2.  Follow the previously outlined action plan, but�**skip the MEPNC Data Collector Script**.
3.  Make sure that the�**working and non-working traces are clearly distinguishable**.
    *   To help with this, append labels like�`"working"`�or�`"nonworking"`�to the filenames.

===========================

Training video: [CSSWIKI-GSA-Private Access Data Collection Demo.mp4](https://microsofteur.sharepoint.com/:v:/t/Community-HybridAuthExperiences/ESFqfUOiXO1BvdLHSl87qQUBKTsTeLerMukSDN7DKvJL1g?e=OuLiD3)

============================ 

##**Data Analysis prerequisites**

In most of the time, we need tenant diagnostic information to be able to do the analysis:

+ Always ensure that the correct tenant is loaded in Tenant Explorer within ASC. 
+ If Lockbox is enabled, make sure the customer has approved the access request.
+ If the customer does not want to consent access, please set his expectation about the possible impact and document this in the support case / share with engaged SMEs.


If you have any feedback on this article or you need assistance, please contact us over [the Global Secure Access channel](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7APian178VKrnYMDXzTO2NUQzdTN1Q1NzNTSFQxRUcyUlAzQ0NCRjVETy4u) to the Hybrid Authentication Experiences Community.



