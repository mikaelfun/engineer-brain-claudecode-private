---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Pass-Through Authentication/Azure AD Pass-Through Authentication (PTA) - High CPU Guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%20(PTA)%20-%20High%20CPU%20Guidance"
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
   

The support case should only be owned by a Hybrid Authentication Experiences (Azure AD Auth Vertical) support engineer, if the following process: _AzureADConnectAuthenticationAgentService.exe_ is responsible for the high CPU utilization.

**Basic questions**

+ When did the issue start?
+ Any known change that was done around this time? (i.e new software was installed on the server, more users were added to use the feature and all the details etc...)
+ How frequently does the issue happen and how long does it take?
+ Does it have any impact on the production? What, if any? How many users are affected?
+ How can the issue be resolved? Self-resolve or intervention is required.

**Hardware**

+ Is this a physical or virtual server? If virtual, please collect all the details (like Hypervisor type, Memory, CPU).

**PTA agents**

+ How many PTA agents are installed in the deployment?
+ Are all showing the issue? At the same time?
+ What is(are) the agent version(s)?

**How to check, what process causes the high CPU usage?**

+ If the issue can be caught easily: use the **Task Manager -> Details** tab and order by CPU to identify the "culprit".
+ If the issue cannot be caught easily (issue happens randomly):

1. Start a **Command Prompt** as administrator
2. Run the command `Logman.exe create counter PTAPerf -o "C:\temp\%COMPUTERNAME%_PTAPerf.blg" -f bincirc -max 512 -v mmddhhmm -c "\Azure AD Connect Authentication Agent Errors\*" "\Azure AD Connect Authentication Agent Global\*" "\Netlogon\*" "\LogicalDisk(*)\*" "\Memory\*" "\Process(*)\*" "\Processor(*)\*" "\TCPv4\*" "\Network Adapter\*" "\IPv4\*" -si 0:10:00`
(-si -> choose the right interval based on the information you received earlier)
3. Start the log collection with `Logman.exe start PTAPerf`
4. After the issue happened, please stop the log collection with using `Logman.exe stop PTAPerf`
5. Request to upload the file **C:\temp\%COMPUTERNAME%_PTAPerf.blg** to the workspace

Please reach out to SMEs or to the AVA channel, if you require any assistance with the data analysis. 

If you have any feedback on this article or you need assistance, please contact us over [the PTA and Seamless SSO, Staged Rollout Teams channel](https://teams.microsoft.com/l/channel/19%3a33d2ca295e334b869b43ad3fc8c6eb04%40thread.skype/PTA%2520and%2520Seamless%2520SSO%252C%2520Staged%2520Rollout?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.
