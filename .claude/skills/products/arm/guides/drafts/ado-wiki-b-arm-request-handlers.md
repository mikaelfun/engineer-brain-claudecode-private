---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Platform Core Concepts/Request handlers"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Platform%20Core%20Concepts%2FRequest%20handlers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Although ARM offers proxy functionality between clients and resource providers, it does way more than that.

Processing on the incoming calls are done through handlers, where each call is evaluated through several steps if they are applicable to determine the call should move forward to the next step.

Some of the handlers a call may go through are:
- Authentication handler
- Authorization handler
- Private link handler
- Policy handler
- Throttling handler
- Data boundary enforcement handler

Reference: [[ADO] HttpConfigurationInitializer.cs](https://msazure.visualstudio.com/One/_git/AzureUX-ARM?path=%2Fsrc%2Ffrontdoor%2FRoles%2FFrontdoor.Web%2Finitialization%2FHttpConfigurationInitializer.cs&version=GBmaster&_a=contents)
