---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Windows App/Unified Mobius Clients/Web Portal"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Windows%20App/Unified%20Mobius%20Clients/Web%20Portal"
importDate: "2026-04-21"
type: guide-draft
---

**Connection Flow when End User uses Web Portal/Web Client**

![image.png](/.attachments/image-f83012c4-3cbf-4c79-b221-54e2dc3d910a.png)

**Connection Flow**

1. End User launches browser and authenticates against AAD using OneAuth.
2. Once Auth is successful, we get the Graph token. Then we reach to Graph APi for getting information related to RDP file, CPC List, WorkspaceID, DirectLaunchUrl.
3. Customers click on "Connect", when customer click on connect, the rdp file(downloaded in step2) is used and reads the contents of the AVD resources and connects to CPC by orchestrating the connection within AVD Infra. 
AVD Infra : RD Gateway, RD Connection Broker, RD Web














**How the Web Portal client talks with workspace (Nighthawk) and get the end consumer the required resource when they select CloudPC or AVD?** 
We redirect users to Nighthawk by specified URL, which contains the ID of workspace will be launched. Nighthawk will use this ID to query required information.


**What kind of failures/error message a user will get when they select the workspace but are not shows the required W365 CPC’s?**
Nighthawk shows "We couldn't connect to the remote PC. This might be because of a network problem. If this keeps happening, ask your admin or tech support for help." to users if there are any issues on required information fetching.



**What kind of error message an end consumer will get when perform a remote action like “Restart” or” Restore” and it fails to perform those actions? What kind of logs can we collect in these scenarios? Is there a Kusto query we can refer too.**
Any Cloud PC failed actions would notify users with this:

 ![image.png](/.attachments/image-880a4b84-c3f6-47a9-96b6-36decd3c162d.png)



**How does pinned device works? Failure for pinning a Cloud PC results in what error? What logs can be collected?** 
In current version, pinning device will not trigger any requests to server but store the pinned information on browser local storage.


**Log collection for above scenarios: "Capture Logs"** inside "**Collect User Logs**" and get **activity Id** from "**Connection Details**." section.

https://learn.microsoft.com/en-us/windows-365/end-user-access-cloud-pc#collect-user-logs

Once we get the **activity Id** from the above logs, we can use the AVD Kusto Queries for further troubleshooting.
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/742513/AVD-Kusto-Queries