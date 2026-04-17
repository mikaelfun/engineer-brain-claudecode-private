---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/Global Secure Access - GlobalSecureAccess-Trace.etl"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FInternal%20Docs%2FGlobal%20Secure%20Access%20-%20GlobalSecureAccess-Trace.etl"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

##Goal

This article provides details about the `GlobalSecureAccess-Trace.etl` file to support advanced troubleshooting for Global Secure Access Windows client. The content will grow based on changes in the product and the experience collected by us.

##Audience

This guidance is intended rather for support engineers with advanced expertise. Good skills in areas such as the Global Secure Access Windows Client, source code access and reading skills, networking (DNS, TCP/IP), WAM, device registration, the Windows operating system (Registry, File System, PowerShell, Windows Firewall etc.), Entra ID authentication, and more might be required.

##What's the purpose of the GlobalSecureAccess-Trace.etl file?

The services and components integrated into the Global Secure Access Windows Client write debug information to the ETL file. This enables advanced troubleshooting in scenarios where issues cannot be diagnosed using standard tools such as Advanced Diagnostics, Event Viewer, or other external utilities. The debug log provides insight into the internal working logic of the components, showing how they behave under specific conditions and where failures occur.

| Main components | Type  | Purpose | Path | Internal name |
|--|--|--|--|--|
| globalsecureaccessdriver.sys | Driver | Kernel mode driver for traffic manipulation | %Windows%\system32\drivers\globalsecureaccessdriver.sys |  |
| Global Secure Access Client Manager Service | Service | Client manager service of Global Secure Access client | %ProgramFiles%\Global Secure Access Client\GlobalSecureAccessClientManagerService.exe | GlobalSecureAccessClientManagerService |
| Global Secure Access Engine Service | Service | Determines which traffic should be tunneled to the Global Secure Access cloud service based on the forwarding profile. | %ProgramFiles%\Global Secure Access Client\GlobalSecureAccessEngineService.exe | GlobalSecureAccessEngineService |
| Global Secure Access Forwarding Profile Service | Service | Retrieves an updated forwarding profile from the Global Secure Access cloud service. | %ProgramFiles%\Global Secure Access Client\GlobalSecureAccessForwardingProfileService.exe | GlobalSecureAccessForwardingProfileService |
| Global Secure Access Tunneling Service | Service | Tunnels applicable network traffic to the Global Secure Access cloud service. | %ProgramFiles%\Global Secure Access Client\GlobalSecureAccessTunnelingService.exe | GlobalSecureAccessTunnelingService |
| GlobalSecureAccessClientAdvancedDiagnostics.exe | Executable | Advanced Diagnostics feature |%Program Files%\Global Secure Access Client\AdvancedDiagnostics |  |
| GlobalSecureAccessClient.exe |Executable| App (icon) on the tray | C:\Program Files\Global Secure Access Client\TrayApp | |
##Important notes

+ Start the troubleshooting with using standard tools.
+ Spend a reasonable amount of time analyzing the GlobalSecureAccess-Trace.etl file, consult with other SMEs as needed, or escalate the issue via ICM.
+ Some errors in the log may be false positives.
+ Even with verbose logging enabled, not all components record full diagnostic details in the debug log. Engineering can generate a checked build that provides more granular information for specific scenarios.
+  The debug log should be treated as an additional resource for troubleshooting a specific scenario. It must be correlated with other logs, or the scenario needs to be reproduced and debugged further.

##How it gets created?

During startup, the Task Scheduler launches`GlobalSecureAccessETLController.exe start`, which enables tracing and creates GlobalSecureAccess-Trace.etl as well.

##How to convert it?

_GlobalSecureAccess-Trace.etl_ is not stored in clear text. Before reviewing it, the file must be converted using the InsightClient tool. Direct corpnet access or a VPN connection is required for the conversion.

You can download the tool over https://aka.ms/InsightWeb portal or directly from [here](https://cesdiagtools.z16.web.core.windows.net/insightclient64/production/InsightClient.application).

More information about the tool: https://internal.evergreen.microsoft.com/en-us/topic/insight-client-an-event-tracing-helper-tool-8084a2bb-0bf2-5c63-e927-fed88318f18b

##Tools

The converted text file typically contains a large number of wellstructured lines, including the date and time, component, function, and debug message. Using the appropriate tools greatly improves efficiency when reviewing and analyzing the file.

![image.png](/.attachments/image-3d774862-bb8a-41bf-93d7-bf6fdc7262eb.png)

- _TextAnalysisTool .NET_ - [TextAnalysisTool.NET](https://textanalysistool.github.io/) (older version of it is included in InsightClient)

##Components in the converted file

Filtering on the components below can help focus on what each component does. However, because many components work together, more sophisticated filtering is often required to fully understand the endtoend flow for operations.

| Component string | Service Owner | Purpose | 
|--|--|--|
| [Microsoft.GlobalSecureAccessClient.Tunneling]|--|--|
| [Microsoft.GlobalSecureAccessClient.Driver]|--|--|
| [Microsoft.GlobalSecureAccessClient.Engine]|--|--|
| [Microsoft.GlobalSecureAccessClient.ManagerTray] |--| Tray application|
| [Microsoft.GlobalSecureAccessClient.Auth]|--| Entra authentication / Token Acquisition|
| [Microsoft.GlobalSecureAccessClient.PolicyDaemon]|--|--|
| [Microsoft.GlobalSecureAccessClient.ForwardingProfile]|--|--|
| [Microsoft.GlobalSecureAccessClient.Generic]|--|--|
| [Microsoft.GlobalSecureAccessClient.Generic]|--|--|
| [Microsoft.GlobalSecureAccessClient.ClientManager]|--|--|

##Helpful filters / filtering technics

This section describes some technics you can use during troubleshooting.

| Issue | Action | 
|--|--|
| Health check fails / issue | First start with filtering on `[Microsoft.GlobalSecureAccessClient.Generic]` to locate the error. |

If you have any feedback on this article or you need assistance, please contact us over [the Global Secure Access channel](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7APian178VKrnYMDXzTO2NUQzdTN1Q1NzNTSFQxRUcyUlAzQ0NCRjVETy4u) to the Hybrid Authentication Experiences Community.
 