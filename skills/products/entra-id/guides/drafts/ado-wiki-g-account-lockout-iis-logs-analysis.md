---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Data Collection - Reactive/Workflow: Account Lockout: Data Analysis - IIS Logs"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Collection%20-%20Reactive%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Analysis%20-%20IIS%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414169&Instance=414169&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414169&Instance=414169&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides guidance on analyzing IIS logs for troubleshooting lockout scenarios in Exchange Server environments. It includes details on log locations, key log file fields, error codes, and examples of using LogParser and PowerShell for analysis.

[[_TOC_]]

# Data collection and analysis description - IIS logs

While troubleshooting a lockout scenario, if the source (client address) is found to be an Exchange Server (Outlook Web Access (OWA)), you should verify the caller process on the server by analyzing the event logs, mainly logon failure event 4625. Next, an Active Directory Domain Services (ADDS) engineer can collaborate with the Exchange on-premises support team to further analyze the Internet Information Services (IIS) logs.

Basically, you need to verify the **Caller Process ID** or **Caller Process Name** in the 4625 logon security event shown as **w3wp.exe** (IIS Worker Process) and if it belongs to **MSExchangeOWAAppPool**.

Run the following command to get the list of running application pools:

```
appcmd list wp
```

![A screenshot showing the output of the appcmd list wp command](/.attachments/image-b4a81bc7-07d4-4b7b-ba3b-16ce88eef0ad.png)

## Logs location

IIS logs are located under the following directories on Exchange 2013 Servers and beyond:
- inetpub\logs\logfiles\w3svc1
- inetpub\logs\logfiles\w3svc2

## About IIS log files

| Name | Description |
|:--:|:--:|
| **Date/Time** | Date and time field of request attempt from the client device by the user. |
| **CS-Username** | User (domain) information. |
| **DeviceType** | Device details about the authentication request. It can be an ActiveSync device, Outlook or Skype client, or web browser. |
| **Application** | IIS virtual directory path shows the URL for ActiveSync, RPC, or Auto-discover. |
| **S-ip** | IP address of the application server. |
| **C-ip** | IP address of the client. In most scenarios, this can be the gateway (load balancer) address for external users. |
| **HTTPStatus** | 401.1 means that the authentication is not successful or denied. |

## Sc-Win32-status error codes

| Code | Description |
|:--:|:--:|
| **1326** | The user name or password is incorrect. |
| **1330** | The password for this account has expired. |
| **1331** | This user cannot sign in because this account is currently disabled. |
| **1909** | The referenced account is currently locked out and may not be logged on to. |

## Analyzing with LogParser

```
Logparser "select cs-username,cs(User-Agent) AS DeviceType,sc-win32-status,TO_LOWERCASE(cs-uri-stem) AS application,STRCAT(STRCAT(TO_STRING(sc-status),'.'),TO_STRING(sc-substatus)) as HTTPstatus,Count(*) INTO 'd:\temp\logparser_output.csv' FROM 'C:\inetpub\logs\LogFiles\W3SVC1\IISLogfilename.log' WHERE TO_STRING(sc-status) LIKE '401' AND cs-username Like '%username%' Group BY cs-username, DeviceType, application, HTTPstatus, sc-win32-status Order BY cs-username, DeviceType"
```

## Analyzing with PowerShell

```
dir "C:\inetpub\logs\LogFiles\W3SVC1\IISLogfilename.log" | select-string "401" | select-string "Activesync" | select-string "username" | select-object -Last 3
```

Example:

| Date | Time | s-ip | cs-method | Cs-uri-stem | Cs-uri-query | s-port | cs-username | c-ip | cs(User-Agent) | cs(Cookie) | sc-status | sc-win32-status | OriginalIP |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 3/15/2018 | 3:10:06 | 10.101.1.116 | RPC_IN_DATA | /rpc/rpcproxy.dll | 80d0a577-b6a9-48a1-b2b6-0ba08e498a09@contoso.com:6001&CorrelationID=<empty>;&ClientId=SQOIMFKMODQZQFLAG&RequestId=b7fc8567-2c19-47d5-9e1a-b439aec6462b&cafeReqId=b7fc8567-2c19-47d5-9e1a-b439aec6462b; | 443 | Contoso\testuser | 10.101.1.240 | MSRPC | OutlookSession="{43A97101-DE1A-4A10-976F-A37413969BD3}+Outlook=15.0.4701.1000+OS=6.2.9200+CPUArchitecture=9" | 401 | 1326 | - |

**Rpcproxy.dll** is Outlook Anywhere.

If the source IP address belongs to a load balancer, it can be configured to send "X-FORWARDED-FOR" along with the client request. Advanced logging on IIS will log this header to IIS log files (OriginalIP).

## More information

- [Enhanced Logging for IIS 8.5](https://docs.microsoft.com/en-us/iis/get-started/whats-new-in-iis-85/enhanced-logging-for-iis85)

- [Account lockouts due to Active sync devices](https://internal.evergreen.microsoft.com/topic/2893466)