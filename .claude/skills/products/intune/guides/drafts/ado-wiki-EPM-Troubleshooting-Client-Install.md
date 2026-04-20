---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Endpoint Privilege Management/Troubleshooting Client Install"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Endpoint%20Security/Endpoint%20Privilege%20Management/Troubleshooting%20Client%20Install"
importDate: "2026-04-20"
type: guide-draft
---

[[_TOC_]]

The purpose of this article is to provide a comprehensive guide for understanding the EPM (Endpoint Privilege Management) Agent installation process on Windows devices managed through Microsoft Intune. This document explains the technical flow from policy assignment to agent deployment, details each phase of the installation process, and provides troubleshooting steps to diagnose common deployment issues. 

# EPM Agent Installation Flow

The EPM Agent installation flow consists of the following steps:

1. Device Check-in and SyncML Response
2. Document Download
3. MSI Download
4. MSI Installation

## 1) Device Check-in and SyncML Response
When an Elevation Setting Policy is assigned to a target device and synchronized with MMPC, the following command is sent to the DeclaredConfiguration CSP to prompt the installation of EPMAgent.msi.

```xml
<Replace>
  <CmdID>8</CmdID>
  <Item>
    <Target>
      <LocURI>./Device/Vendor/MSFT/DeclaredConfiguration/Host/Complete/Documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/Document</LocURI>
    </Target>
    <Data><![CDATA[
      <DeclaredConfigurationUrl 
        context="Device" 
        schema="1.0" 
        id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
        checksum="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" 
        osdefinedscenario="MSFTPolicies" 
        url="https://checkin.dm.microsoft.com/WinDCFE/documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
        <ReflectedProperties>
          <Property name="MeId;MeType;MeVersion;IntentId" type="chr">
            yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy;12;18;yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
          </Property>
          <Property name="NamespaceName" type="chr">Windows:Device:EnterpriseDesktopAppManagement</Property>
          <Property name="IntentPriority" type="chr">10</Property>
          <Property name="ConfigDocumentType" type="chr">1</Property>
        </ReflectedProperties>
      </DeclaredConfigurationUrl>
    ]]></Data>
  </Item>
</Replace>

```

## 2) Document Download
The device downloads the XML file (the document body) from the URL specified in DeclaredConfigurationUrl using BITS:
- URL: `https://checkin.dm.microsoft.com/WinDCFE/documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

The downloaded XML file is saved in the following folder:
- Folder: C:\ProgramData\Microsoft\DC\HostOS

```xml
<DeclaredConfiguration context="Device" schema="1.0" id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" osdefinedscenario="MSFTPolicies" checksum="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
  <CSP name="./Vendor/MSFT/EnterpriseDesktopAppManagement">
    <URI path="MSI/%7b01A1A484-A75B-456A-BE98-D98D0609CDAA%7d/DownloadInstall" type="xml">&lt;MsiInstallJob id="zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz"&gt;&lt;Product Version="6.2511.21.2000"&gt;&lt;Download&gt;&lt;ContentURLList&gt;&lt;ContentURL&gt;https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi&lt;/ContentURL&gt;&lt;/ContentURLList&gt;&lt;/Download&gt;&lt;Validation&gt;&lt;FileHash&gt;F9D2FB5952CFFF9836569315CA6A3604A621BC8592622602CF25E0E453850176&lt;/FileHash&gt;&lt;/Validation&gt;&lt;Enforcement&gt;&lt;CommandLine /&gt;&lt;RetryCount&gt;5&lt;/RetryCount&gt;&lt;RetryInterval&gt;3&lt;/RetryInterval&gt;&lt;/Enforcement&gt;&lt;/Product&gt;&lt;/MsiInstallJob&gt;</URI>
  </CSP>
</DeclaredConfiguration>
```

## 3) MSI Download
The downloaded document is parsed and settings are applied to the EnterpriseDesktopAppManagement CSP. As a result, the MSI is downloaded via BITS from the following URL specified in the document.
The download URL may differ from the one shown below. Please refer to the [registry](#verify-epmagent%2emsi-download-and-installation-status) for the actual value.
- URL: `https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi`


## 4) MSI Installation
The downloaded EPMAgent.msi is installed. Upon successful installation, the "Microsoft EPM Agent Service" (MEMEPMSvc) starts automatically.

---

# Troubleshooting
If EPMAgent is not installed, verify the following points:

## Prerequisites Verification
Confirm that the prerequisites for using Endpoint Privilege Management are met:
[Plan and Prepare for Endpoint Privilege Management Deployment](https://learn.microsoft.com/en-us/intune/intune-service/protect/epm-plan)


## Dual Enrollment Status Check
Since EPM Agent distribution is performed through sync with MMPC, first verify that registration with MMPC has been completed correctly.

MMPC Registration Status:
```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA]
...
"DiscoveryServiceFullURL"="https://discovery.dm.microsoft.com/EnrollmentConfiguration?api-version=1.0"
...
"AADResourceID"="https://checkin.dm.microsoft.com"
...

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA\DMClient\Microsoft Device Management]
"EntDeviceName"="Device_Windows_11/15/2025_2:01 PM"
"EntDMID"="aaaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
"SignedEntDMID"="0"
"CertRenewTimeStamp"="0"
```

Reference resource for enrollment troubleshooting:
[Endpoint Privilege Management](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1321032/Endpoint-Privilege-Management)


## Verify Synchronization Status with MMPC
The following event logs allow you to confirm whether the device has successfully synchronized with MMPC:
```
Log Name:      Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Sync
Source:        Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider
Date:          12/11/2025 2:35:25 AM
Event ID:      208
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      TEST-PC2
Description:
MDM Session: OMA-DM session started for EnrollmentID (AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA) with server: (Microsoft Device Management), Server version: (NULL), Client Version: (1.2), PushRouterOrigin: (0x25), UserAgentOrigin: (0x1), Initiator: (0x0), Mode: (0x2), SessionID: (0x2D), Authentication Type: (0x3).

Log Name:      Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Sync
Source:        Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider
Date:          12/11/2025 2:35:28 AM
Event ID:      209
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      TEST-PC2
Description:
MDM Session: OMA-DM session ended with status: (The operation completed successfully.).
```

You can check the MMPC-side logs for the synchronization by using the following Kusto query:

```kusto
let MMPCDeviceId = "<MMPC Device ID>";
let StartDate = datetime(2025-12-11 02:35);
let EndDate = datetime(2025-12-11 02:36);
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time between (StartDate .. EndDate)
| where DeviceId == MMPCDeviceId
| where EventUniqueName startswith "MDMCheckin"
| project env_time, EventUniqueName, Col1, UserId
```


## Verify Document for EPMAgent.msi Distribution
You can generally verify whether the document for EPMAgent distribution is being attempted to be delivered to the device using the following query. The MMPC Device ID can be verified from the above “Microsoft Device Management” registry key.

```kusto
let MMPCDeviceId = "<MMPC Device ID>";
let StartDate = datetime(2025-11-15 15:00);
let EndDate = datetime(2025-11-15 15:30);
let MeIds = cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time between (StartDate .. EndDate)
| where ServiceName == "DeviceCheckinMTService"
| where ComponentName == "Microsoft.DeviceManagement.Services.DeviceCheckinMT.Repository.DeviceCheckinMTRepository"
| where DeviceId == MMPCDeviceId
| where Col1 startswith "Hydrating doc:"
| parse Col1 with "Hydrating doc:" DocId ", MeId:" MeId ", MeVersion:" MeVersion ", namespaceName:" NamespaceName ", scenario:" Scenario ", ExternalIdentifier:" ExternalIdentifier
| where NamespaceName == "Windows:Device:EnterpriseDesktopAppManagement"
| distinct MeId;
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time between (StartDate .. EndDate )
| where DeviceId == MMPCDeviceId
| where ServiceName == "DeviceCheckinMTService"
| parse EventUniqueName with  Class "::" Function "::" Line "::" EmmId "_" DeviceId  "_" TenantId "_" SessionId "_" UserId
| where Function  contains "FetchAssignedConfigurationsAsync" or Function contains "MergeApplicableDocs"
| where Col1 startswith "Adding doc " and Col1 contains "to AssignedConfigurations"
| parse Col1 with "Adding doc {DocId" "}:" DocId ", to AssignedConfigurations, checksum:" checksum ", MeId:" MeId ", " MeType ", IntentOperation:" IntentOperation", Context:"Context", DeviceActionId:"DeviceActionId
| where MeId in (MeIds)
| where IntentOperation == "ApplyOrInstall"
| project env_time, DocId, MeId, MeType
```

If the above query does not return any results, the following causes are possible:

- The device has not checked in with MMPC within the specified time period.
- The Elevation Setting Policy is not assigned to the target device.


## Verify Document Delivery Status
You can verify whether the device has received the document delivered from MMPC from the following Event log. The Document ID in the log can be confirmed from the Kusto query results.

```
Log Name: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Operational
Source: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider
Date: 2025/11/16 0:15:34
Event ID: 2404
Task Category: None
Level: Information
Keywords:
User: S-1-5-18
Computer: TEST-PC2
Description:
MDM Declared Configuration: End document parsing from CSP: Document Id: (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), Scenario: (MSFTPolicies), Version: (aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa), Enrollment Id: (AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA), Current User: (Device), Schema: (1.0), Download URL: (https://checkin.dm.microsoft.com/WinDCFE/documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), Scope: (0x0), Enroll Type: (0x1A), File size: (0x5BA), CSP Count: (0x0), URI Count: (0x0), Action Requested: (0x0), Model: (0x1).
```

You can also verify by checking whether the following registry key has been created:

```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\DeclaredConfiguration\HostOS\Config\enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA\Device\state\xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\raw]
"osdefinedscenario"="MSFTPolicies"
"osconfigscenario"=""
"schema"="1.0"
"context"="Device"
"behavior"=dword:00000000
"downloadRequest"=dword:00000000
"requestTimeStamp"="2025-11-15T15:15:50Z"
"model"=dword:00000001
"originalDocStorageGuid"=""
"downloadGUID"="DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD"
"downloadDestination"="C:\\ProgramData\\Microsoft\\DC\\HostOS\\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA_Device_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa_DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD.xml"
"downloadUrl"="https://checkin.dm.microsoft.com/WinDCFE/documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
"state"=dword:00000023
"CspCount"=dword:00000001
"ScenarioId"="CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC"
"LastRunTimeStamp"="2025-11-15T15:15:50Z"
"LatestRunTickCount"=hex(b):1c,30,ea,08,00,00,00,00
```

The above registry key records the received configuration details. The results of applying the settings according to those details are recorded in the following registry:

```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\DeclaredConfiguration\HostOS\Results\Config\enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA\Device\state\xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa]
"state"=dword:0000003c
"CspCount"=dword:00000001
"schema"="1.0"
"context"="Device"
"osdefinedscenario"="MSFTPolicies"
"osconfigscenario"=""
"operation"=dword:00000001
"behavior"=dword:00000000
"downloadRequest"=dword:00000000
"DCWin32AppInstallUniqueId"="%7b01A1A484-A75B-456A-BE98-D98D0609CDAA%7d"
"resultTimeStamp"="2025-12-01T08:59:45Z"
...
```


The meaning of the "state" in the registry key that includes "Results" is as shown in the table below. In the example above, it indicates ConfigCompletedSuccess, which means that the EPM Agent was successfully installed.
[Windows Declared Configuration Protocol](https://www.osgwiki.com/wiki/Windows_Declared_Configuration_Protocol)

| state                                      | decimal  | hexadecimal  | note                                                                 |
|-------------------------------------------|--------|--------|----------------------------------------------------------------------|
| NotDefined                                | 0      | 0x00   | transient                                                           |
| ConfigRequest                             | 1      | 0x01   | transient                                                           |
| ConfigInprogress                          | 2      | 0x02   | transient                                                           |
| ConfigInProgressAsyncPending             | 3      | 0x03   | transient: Async operation is performed but pending results        |
| DeleteRequest                             | 10     | 0x0A   | transient                                                           |
| DeleteInprogress                          | 11     | 0x0B   | transient                                                           |
| GetRequest                                | 20     | 0x14   | transient                                                           |
| GetInprogress                             | 21     | 0x15   | transient                                                           |
| CDNDownload                               | 30     | 0x1E   | transient                                                           |
| CDNDownloading                            | 31     | 0x1F   | transient                                                           |
| CDNDownloaded                             | 32     | 0x20   | transient                                                           |
| CDNDownloadPendingRetry                   | 34     | 0x22   | transient                                                           |
| CDNDownloadedCookConfigurationSuccess     | 35     | 0x23   | transient                                                           |
| CDNDownloadedParseDocumentSuccess         | 36     | 0x24   | transient                                                           |
| ConstructURIStorageSuccess                | 40     | 0x28   | transient                                                           |
| ConfigCompletedSuccess                    | 60     | 0x3C   | permanent                                                           |
| ConfigCompletedError                      | 61     | 0x3D   | permanent                                                           |
| ConfigInfraError                          | 62     | 0x3E   | permanent                                                           |
| ConfigCompletedSuccessNoRefresh           | 63     | 0x3F   | permanent                                                           |
| DeleteCompletedSuccess                    | 70     | 0x46   | permanent                                                           |
| DeleteCompletedError                      | 71     | 0x47   | permanent                                                           |
| DeleteInfraError                          | 72     | 0x48   | permanent                                                           |
| GetCompletedSuccess                       | 80     | 0x50   | permanent                                                           |
| GetCompletedError                         | 81     | 0x51   | permanent                                                           |
| GetInfraError                             | 82     | 0x52   | permanent                                                           |
| CDNDownloadedParseDocumentError           | 90     | 0x5A   | permanent                                                           |
| CDNDownloadFailedBitsGenericError         | 91     | 0x5B   | permanent: BITS failed with unknown error and not recoverable      |
| CDNDownloadFailedBitsCancelled            | 92     | 0x5C   | permanent: BITs job got cancelled somehow                          |
| CDNDownloadFailedBitsCompleteError        | 93     | 0x5D   | permanent: BITS job finished downloading but cant complete         |
| CDNDownloadFailedAfterRetry               | 94     | 0x5E   | permanent: max retry achieved                                      |
| CDNDownloadFailedCreateBitsJob            | 95     | 0x5F   | permanent: BITS failed to create a job                             |
| CDNDownloadFailedWininetTimeout           | 96     | 0x60   | permanent: WININET timeout, mostly due to network issue            |
| CDNDownloadFailedWininetNameNotResolved   | 97     | 0x61   | permanent: WININET host name not resolved, mostly network issue    |
| CDNDownloadedConfigurationError           | 98     | 0x62   | permanent                                                           |
| CDNDownloadedCookConfigurationError       | 99     | 0x63   | permanent                                                           |
| ConstructURIStorageError                  | 102    | 0x66   | permanent                                                           |




## Verify Document Download Status
You can verify the download status of the document body from the following event log:

```
Log Name: Microsoft-Windows-Bits-Client/Operational
Source: Microsoft-Windows-Bits-Client
Date: 2025/11/16 0:15:49
Event ID: 60
Task Category: None
Level: Information
Keywords:
User: S-1-5-18
Computer: TEST-PC2
Description:
BITS stopped transferring the CDNDownloadJob transfer job that is associated with the https://checkin.dm.microsoft.com/WinDCFE/documents/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx URL. The status code is 0x0.
```

The downloaded file is saved in the following location:

```
C:\ProgramData\Microsoft\DC\HostOS\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA_Device_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa_DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD.xml
```

```xml
<DeclaredConfiguration context="Device" schema="1.0" id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" osdefinedscenario="MSFTPolicies" checksum="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
  <CSP name="./Vendor/MSFT/EnterpriseDesktopAppManagement">
    <URI path="MSI/%7b01A1A484-A75B-456A-BE98-D98D0609CDAA%7d/DownloadInstall" type="xml">&lt;MsiInstallJob id="zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz"&gt;&lt;Product Version="6.2511.21.2000"&gt;&lt;Download&gt;&lt;ContentURLList&gt;&lt;ContentURL&gt;https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi&lt;/ContentURL&gt;&lt;/ContentURLList&gt;&lt;/Download&gt;&lt;Validation&gt;&lt;FileHash&gt;F9D2FB5952CFFF9836569315CA6A3604A621BC8592622602CF25E0E453850176&lt;/FileHash&gt;&lt;/Validation&gt;&lt;Enforcement&gt;&lt;CommandLine /&gt;&lt;RetryCount&gt;5&lt;/RetryCount&gt;&lt;RetryInterval&gt;3&lt;/RetryInterval&gt;&lt;/Enforcement&gt;&lt;/Product&gt;&lt;/MsiInstallJob&gt;</URI>
  </CSP>
</DeclaredConfiguration>
```

Furthermore, the following registry entries are created:

```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\DeclaredConfiguration\HostOS\Config\enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA\Device\state\xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\raw\CSP1]
"ProviderType"=dword:00000001
"csp"="./Vendor/MSFT/EnterpriseDesktopAppManagement"
"UriCount"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\DeclaredConfiguration\HostOS\Config\enrollments\AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA\Device\state\xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\raw\CSP1\URI1]
"uri"="MSI/%7b01A1A484-A75B-456A-BE98-D98D0609CDAA%7d/DownloadInstall"
"alias"=""
"state"=dword:00000000
"typeStored"=dword:00000001
"value"="<MsiInstallJob id=\"zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz\"><Product Version=\"6.2511.21.2000\"><Download><ContentURLList><ContentURL>https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi</ContentURL></ContentURLList></Download><Validation><FileHash>F9D2FB5952CFFF9836569315CA6A3604A621BC8592622602CF25E0E453850176</FileHash></Validation><Enforcement><CommandLine /><RetryCount>5</RetryCount><RetryInterval>3</RetryInterval></Enforcement></Product></MsiInstallJob>"
"typeConfig"=dword:0000000d
```




## Verify EPMAgent.msi Download and Installation Status

Verify that the MSI file is correctly downloaded using Delivery Optimization. The download status of the MSI can be checked using Get-DeliveryOptimizationLog.  It is collected by Intune One Data Collector.  If the download is successful, you will see logs like the following.

```
TimeCreated : 12/2/2025 5:35:07 AM
ProcessId   : 3000
ThreadId    : 3616
Level       : 4
LevelName   : Info
Message     : jobId: jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj, fileId: 
              F9D2FB5952CFFF9836569315CA6A3604A621BC8592622602CF25E0E453850176, sessionId: 
              ssssssss-ssss-ssss-ssss-ssssssssssss, updateId: , caller: MDMSW Job, cdnUrl = 
              https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi, cdnIp = 
              [13.107.226.46]:443;, cacheHost = Services:130.33.125.142, bytes: [File: 11993088, CDN: 11993088, DOINC: 
              0, rledbat: 0, LAN: 0, LinkLocal: 0, Group: 0, inet: 0, lcache: 0, req: 0, total: 2:11993088;], peers: 0 
              (local 0), conns: [CDN: 2, DOINC: 1, LAN: 0, LinkLocal: 0, Group: 0, inet: 0], downBps: 191909, upBps: 
              8510, downUsageBps: 11993088, upUsageBps: 0, timeMs: 3504, sessionTimeMs: 2943, groupId = , background? 
              0, uploadRestr: 0, downloadMode: 99, downloadModeSrc: 99, downloadModeReason: 80d0401b, isVpn: 0, 
              encrypted? 0, expire at: 2025-12-02T05:36:07.8333550Z, isThrottled = 0
Function    : CTelemetryLogger::TraceDownloadCompletedImpl
LineNumber  : 565
ErrorCode   : 
```

You can investigate from the following registry:

```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\EnterpriseDesktopAppManagement\S-0-0-00-0000000000-0000000000-000000000-000\MSI\{01A1A484-A75B-456A-BE98-D98D0609CDAA}]
"DownloadInstall"="InProgress"
"ProductCode"="{01A1A484-A75B-456A-BE98-D98D0609CDAA}"
"ProductVersion"="6.2511.21.2000"
"CreationTime"=hex(b):59,8b,41,ba,42,56,dc,01
"ActionType"=dword:00000001
"Status"=dword:00000046
"JobStatusReport"=dword:00000001
"LastError"=dword:00000000
"BITSJobId"="vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv"
"DownloadLocation"=""
"DownloadUrlList"=hex(7):68,00,74,00,74,00,70,00,73,00,3a,00,2f,00,2f,00,65,00,\
  70,00,6d,00,61,00,67,00,65,00,6e,00,74,00,2e,00,6d,00,61,00,6e,00,61,00,67,\
  00,65,00,2e,00,6d,00,69,00,63,00,72,00,6f,00,73,00,6f,00,66,00,74,00,2e,00,\
  63,00,6f,00,6d,00,2f,00,65,00,70,00,6d,00,61,00,67,00,65,00,6e,00,74,00,70,\
  00,65,00,65,00,75,00,73,00,2f,00,65,00,70,00,6d,00,61,00,67,00,65,00,6e,00,\
  74,00,6d,00,73,00,69,00,2f,00,36,00,2e,00,32,00,35,00,31,00,31,00,2e,00,32,\
  00,31,00,2e,00,32,00,30,00,30,00,30,00,2f,00,45,00,50,00,4d,00,41,00,67,00,\
  65,00,6e,00,74,00,2e,00,6d,00,73,00,69,00,00,00,00,00,00,00
"CurrentDownloadUrlIndex"=dword:00000001
"CurrentDownloadUrl"="https://epmagent.manage.microsoft.com/epmagentpeeus/epmagentmsi/6.2511.21.2000/EPMAgent.msi"
"FileHash"="F9D2FB5952CFFF9836569315CA6A3604A621BC8592622602CF25E0E453850176"
"CommandLine"=""
"AssignmentType"=dword:00000001
"EnforcementStartTime"=hex(b):58,19,63,c0,42,56,dc,01
"EnforcementTimeout"=dword:0000001e
"EnforcementRetryIndex"=dword:00000001
"EnforcementRetryCount"=dword:00000005
"EnforcementRetryInterval"=dword:00000003
"LocURI"="./Device/Vendor/MSFT/EnterpriseDesktopAppManagement/MSI/{01A1A484-A75B-456A-BE98-D98D0609CDAA}/DownloadInstall"
"ServerAccountID"="AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"
```

Additionally, the following registry entries are created:

EPMAgent Registry:
```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\EPMAgent]
"ProductVersion"="6.2511.21.2000"
```

You can also verify from the following event logs:

```
Log Name: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Admin
Source: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider
Date: 2025/11/16 0:15:59
Event ID: 1906
Task Category: None
Level: Information
Keywords:
User: S-1-5-18
Computer: TEST-PC2
Description:
EnterpriseDesktopAppManagement CSP: Application content download completed. MSI ProductCode: {01A1A484-A75B-456A-BE98-D98D0609CDAA}, User SID: (S-0-0-00-0000000000-0000000000-000000000-000), BITS job: (vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv).

Log Name: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Admin
Source: Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider
Date: 2025/11/16 0:17:37
Event ID: 1922
Task Category: None
Level: Information
Keywords:
User: S-1-5-18
Computer: TEST-PC2
Description:
EnterpriseDesktopAppManagement CSP: An application install has succeeded. MSI ProductCode: {01A1A484-A75B-456A-BE98-D98D0609CDAA}, User SID: (S-0-0-00-0000000000-0000000000-000000000-000), Result: (0x0).

Log Name: Application
Source: MsiInstaller
Date: 2025/11/16 0:17:37
Event ID: 1033
Task Category: None
Level: Information
Keywords: Classic
User: S-1-5-18
Computer: TEST-PC2
Description:
Windows Installer installed the product. Product Name: Microsoft EPM Agent. Product Version: 6.2511.21.2000. Product Language: 1033. Manufacturer: Microsoft Corporation. Installation success or error status: 0.
```


# Reference Resources

- [DeclaredConfiguration CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/declaredconfiguration-csp)
- [EnterpriseDesktopAppManagement CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/enterprisedesktopappmanagement-csp)
- [BITS (Background Intelligent Transfer Service)](https://learn.microsoft.com/en-us/windows/win32/bits/background-intelligent-transfer-service-portal) 
