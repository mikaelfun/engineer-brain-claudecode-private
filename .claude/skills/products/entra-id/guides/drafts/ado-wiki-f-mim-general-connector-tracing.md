---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Sync Service/Troubleshooting Guides/MIM General Connector Tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FSync%20Service%2FTroubleshooting%20Guides%2FMIM%20General%20Connector%20Tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.IdentityManager2016
- cw.comm-sync
- cw.IDMgmt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


# General Connector Tracing


We have two type of connector:
1)  Builtin Management Agent (ADMA, ADLDS, SQL, Oracle, Extensible
    Connectivity etc)
2)  Connectors (downloadable from the internet, like GSQL, GLDQP, WS
    etc)

<br><br>
-  **Built-in Management Agents**
<br>
Built-in MAs don't have tracing we can enable, everything is logged by default into Application Event.log

<br><br>
-  **Extensible Management Agents / modern Management Agents**
<br>
Connectors are based on Extensible Connectivity 2.0 MA, as this is just some Gernric Connector, using a published API, where customer can create and develop their own Connector. Those ECMA Connectors (== Extensible Connectivity 2.0 MA) are custom code from customer. By the way, all our modern Connectors (GLDAP, GSQL etc.) are based on that builtin ECMA Connector

<br><br>
-  **ECMA Connector (== Extensible Connectivity 2.0/2.2 MA)**
<br>
Be aware of ECMA Connector (not to misunderstand ECMAHost, that is totally different) For most modern Connectors (GLDAP, GSQL, Graph...) this is easy, simple way to enable tracing In `c:\Program Files\\Microsoft Forefront Identity Manager\2010\Synchronization Service\BIN\miiserver.exe.config`

<br><br>
-  **Domino Connector**
<br>
Please be aware, **if this process is x86**, we might need updating in different config file:
to enable Notes MA tracing (the new one, v8) diagnostics section must be **in either dllhost.exe.config or mmsscript.exe.config as Notes MA is
x86 process** and settings in miiserver.exe.config doesn\'t have any effect on Notes MA tracing.
<br>
�
From: [Technet Wiki FIM 2010 Troubleshooting: how to enable ETW Tracing for connectors](https://social.technet.microsoft.com/wiki/contents/articles/21086.fim-2010-r2-troubleshooting-how-to-enable-etw-tracing-for-connectors.aspx)

<br><br>
- **Sharepoint Connector**
�<br>�
Note:<br>
*Seems with newer releases the INITIALIZEDATA attribute behavior has changed, it now must be \"ConnectorsLog\"\ and not different. Pls update here if you encounter different behavior*
�<br>
�
**Add this section in `<system.diagnostics\>` and restart the service :**

```
<source name="ConnectorsLog" switchValue="Verbose" switchType="System.Diagnostics.SourceSwitch">
<listeners>
<!-- the following section will create logging in the Event.log If you've a huge environment, the event.log might get flooded and we might not see all details as the event.log is not huge enough therefore always pls add the TextWriterTraceListener as well
-->
<add name="MIMConnectorsEventLogListener" type="System.Diagnostics.EventLogTraceListener" initializeData="ConnectorsLog" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp,ThreadId, Callstack">
<filter type="" />
</add>
<!-- the following section will write the connector tracing into a textfile If you've a huge environment, that file might get 100 GB in size in that situation, maybe modify the traceOutputOptions to just traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ThreadId, Callstack" Or traceOutputOptions="LogicalOperationStack, DateTime, ThreadId"
to get a smaller file
-->
<add name="MIMConnectorsTextListener" type="System.Diagnostics.TextWriterTraceListener" traceOutputOptions="LogicalOperationStack, DateTime, ThreadId"
initializeData="c:\temp\logs\MIMConnectorsTrace.txt" />
</listeners>
</source>
```
�
<br>�
Be sure to adjust the logfile path and name and to have permissions for
service account creating that file. Don\'t write into Program Files
Folder, only TrustedInstaller account has permissions to write there.

Copy and Paste from Outlook etc. Often changes quotes, dbl quotes etc.,
that will cause the service to fail on start or when executing the
connector. Therefore have a backup of your miiserver.exe.config file
that you can copy that again and launch your service successfully. If
some character is invalid, you mostly will see an error in the Apps
Event.log, pointing to the line containing the invalid character. But it
could be an invalid chr just before or behind the noted line number,
even a not visible char, so be aware of that-
�
Sometimes you can see those errors in Apps Event.log, when the config is incorrect:

```
Log Name: Application
Source: FIMSynchronizationService
Date: 8/26/2020 12:21:52 PM
Event ID: 6300
Task Category: Server
Level: Error
Keywords: Classic
User: N/A
Computer: SYNC.contoso.com
Description:
The server encountered an unexpected error:
�
"Configuration system failed to initialize
�
at System.Configuration.ClientConfigurationSystem.EnsureInit(String configKey)
at System.Configuration.ClientConfigurationSystem.PrepareClientConfigSystem(String sectionName)
at System.Configuration.ClientConfigurationSystem.System.Configuration.Internal.IInternalConfigSystem.GetSection(String sectionName)
at System.Configuration.ConfigurationManager.GetSection(String sectionName)
at System.Configuration.PrivilegedConfigurationManager.GetSection(String sectionName)
at System.Diagnostics.DiagnosticsConfiguration.GetConfigSection()
at System.Diagnostics.DiagnosticsConfiguration.Initialize()
at System.Diagnostics.DiagnosticsConfiguration.get_Sources()
at System.Diagnostics.TraceSource.Initialize()
at Microsoft.IdentityManagement.Connector.Commons.Logger.Log..ctor()
at Microsoft.IdentityManagement.Connector.Commons.Logger.Log.get_Instance()
at Microsoft.IdentityManagement.Connector.GenericLdap.GenericLdapConnector..ctor()
�
�
InnerException=\>
An XML comment cannot contain \'\--\', and \'-\' cannot be the last
character. Line 86, position 7. (C:\\Program Files\\Microsoft Forefront
Identity Manager\\2010\\Synchronization
Service\\Bin\\miiserver.exe.Config line 86)
�
at System.Configuration.ConfigurationSchemaErrors.ThrowIfErrors(Boolean ignoreLocal)
at System.Configuration.BaseConfigurationRecord.ThrowIfParseErrors(ConfigurationSchemaErrors schemaErrors)
at System.Configuration.ClientConfigurationSystem.EnsureInit(String configKey)
�
�
InnerException=\>
An XML comment cannot contain \'\--\', and \'-\' cannot be the last
character. Line 86, position 7.
�
at System.Xml.XmlTextReaderImpl.Throw(Exception e)
at System.Xml.XmlTextReaderImpl.ParseCDataOrComment(XmlNodeType type,
Int32& outStartPos, Int32& outEndPos)
at System.Xml.XmlTextReaderImpl.ParseCDataOrComment(XmlNodeType type)
at System.Xml.XmlTextReaderImpl.ParseComment()
at System.Xml.XmlTextReaderImpl.ParseElementContent()
at System.Configuration.XmlUtil.StrictSkipToNextElement(ExceptionAction action)
at System.Configuration.BaseConfigurationRecord.ScanSectionsRecursive(XmlUtil xmlUtil, String parentConfigKey, Boolean inLocation, String locationSubPath, OverrideModeSetting overrideMode, Boolean skipInChildApps)
at System.Configuration.BaseConfigurationRecord.ScanSections(XmlUtil xmlUtil)
at System.Configuration.BaseConfigurationRecord.InitConfigFromFile()
�
�
InnerException=\>
none
\"
```
<br><br>
That already gives some hint where to search.  Verify those files in Visual Studio (VS) to get more help to find the error.
�
