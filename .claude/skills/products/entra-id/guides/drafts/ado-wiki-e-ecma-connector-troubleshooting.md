---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/On-premises provisioning/On premises app provisioning EMCA/ECMA Connector - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOn-premises%20provisioning%2FOn%20premises%20app%20provisioning%20EMCA%2FECMA%20Connector%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Verify Inbound Network Connectivity

Accessibility to TCP port 8585 (Inbound) can be verified a couple ways:

- From any Windows computer, run this PowerShell command against the Internet facing IP of the ECMA Connector host and verify **TcpTestSucceeded** responds with **True**.

```
Test-NetConnection -ComputerName "13.##.##.129" -Port 8585 -InformationLevel "Detailed"
```

- Use the **Test Connection** button on the Provisioning setup of the Microsoft Entra ID application.

If connectivity fails, verify an Inbound TCP Port rule for port 8585 is Enabled.

## Verify ECMA Connector Host Responds to SCIM Requests

Customers can run the `Test-ECMA2HostConnection.ps1` PowerShell script to validate SCIM `GET` requests against the ECMA Connector Host are operating and responding correctly.

**NOTE**: The `Test-ECMA2HostConnection.ps1` PowerShell script should be run on the same Windows server where the ECMA2Connector is installed and running. The admin must provide the ECMA Connector name and the secret token.

- **GET Operation**: The script's default behavior is to perform a GET operation. A successful result looks like this:

```powershell
PS C:\Program Files\Microsoft ECMA2Host\Troubleshooting> .\TestECMA2HostConnection.ps1

cmdlet TestECMA2HostConnection.ps1 at command pipeline position 1
Supply values for the following parameters:
ConnectorName: TestConnectorName
SecretToken: ******
HTTP/1.1 200 OK
Last-Successful-Import:
Last-Successful-Export:
Last-Successful-Cache-Change:
Content-Length: 167
Content-Type: application/scim+json; charset=utf-8

{
 "schemas": [
  "urn:ietf:params:scim:api:messages:2.0:ListResponse"
 ],
 "totalResults": 0,
 "startIndex": 1,
 "itemsPerPage": 1,
 "Resources": []
}
```

## ECMA2Host Event Viewer Logs

The **Microsoft ECMA2Host Logs** are written to the Windows Event logs under *Applications and Services Logs*.

Run these commands from an administrative command prompt to collect ECMA Connector data and place it into a zip file:

```
wevtutil epl "ECMA2Host" %computername%_ECMA2Host.evtx
copy "C:\Program Files\Microsoft ECMA2Host\Service\Configuration\Configuration.xml" %computername%_Configuration.xml
```

### Enable Debug Event Logging

Debug logging might be useful when troubleshooting Wizard or Service (Sync) failures. Debug logs are recorded to the event viewer under **Microsoft ECMA2Host Logs**.

#### Wizard Debug Logging

1. Right-click Notepad.exe and select Run as administrator.
2. Click **File** > **Open** and navigate to:
   `C:\Program Files\Microsoft ECMA2Host\Wizard`
3. Change the *File type* from **Text Documents (*.txt)** to **All Files**.
4. Select **Microsoft.ECMA2Host.ConfigWizard.exe.config** and click **Open**.
5. Search for **switchValue** and change both instances to **Verbose**. These values are case sensitive.

Valid **switchValue** settings: Information, Warning, Error, Verbose

```xml
<system.diagnostics>
  <sources>
   <source name="ConnectorsLog" switchValue="Error">
    <listeners>
     <add initializeData="ConnectorsLog" type="System.Diagnostics.EventLogTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" name="ConnectorsLog" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, Callstack">
      <filter type=""/>
     </add>
    </listeners>
   </source>
   <source name="ECMA2Host" switchValue="Information">
    <listeners>
     <add initializeData="Microsoft ECMA2Host" type="System.Diagnostics.EventLogTraceListener, System, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" name="ConnectorsLogListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, Callstack" />
     <remove name="Default" />
    </listeners>
   </source>
  </sources>
</system.diagnostics>
```

6. Save the file and restart **Microsoft ECMA2Host** service.
7. Right-click **Microsoft.ECMA2Host.ConfigWizard.exe** and choose **Run as administrator** and reproduce the issue.

**IMPORTANT**: Once resolved, change **switchValue** back to defaults and restart the service.

#### Service (Sync) Debug Logging

1. Right-click Notepad.exe and select Run as administrator.
2. Open: `C:\Program Files\Microsoft ECMA2Host\Service`
3. Select **Microsoft.ECMA2Host.Service.exe.config**.
4. Locate `<appSettings>` and change **Debug** and **WriteVerboseLog** to **true**.
5. Search for **switchValue** and change both instances to **Verbose**.

```xml
<appSettings>
  <add key="UrlHost" value="http://*:8585/ecma2host" />
  <add key="Debug" value="false" />
  <add key="WriteVerboseLog" value="false" />
</appSettings>
```

6. Save and restart **Microsoft ECMA2Host** service.
7. Reproduce the issue.
8. Collect data:

```
wevtutil epl "ECMA2Host" %computername%_ECMA2Host.evtx
copy "C:\Program Files\Microsoft ECMA2Host\Service\Configuration\Configuration.xml" %computername%_Configuration.xml
```

**IMPORTANT**: Once resolved, change settings back to defaults and restart the service.

#### Account Creation/Import Flow

When a single user is added to the Microsoft Entra ID Application, the following SCIM actions are performed:

1. **GET** query with matching attribute filter to check if user exists in target system
2. If user not found, **POST** request to create the user
3. Response returns the created user with anchor ID

Event logs show the full request/response chain in ECMA2Host event viewer.

#### Account Update/Disable Flow

When a user is removed from the Microsoft Entra ID Application, the account in the remote database will be disabled via SCIM PATCH operations.
