---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/TSG for Microsoft Entra private network connector crash"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FInternal%20Docs%2FTSG%20for%20Microsoft%20Entra%20private%20network%20connector%20crash"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG for Microsoft Entra Private Network Connector Crash

This troubleshooting guide provides all the necessary steps to drive support cases involving crashes of the Microsoft Entra private network connector service (`MicrosoftEntraPrivateNetworkConnectorService.exe`).

## Symptoms

In rare cases, the **Microsoft Entra private network connector service** (`MicrosoftEntraPrivateNetworkConnectorService.exe`) may encounter an unexpected condition that it cannot handle, resulting in a crash. When this occurs, the service will automatically restart, and any active user connections will be terminated. This can lead to errors on the user side.

An event with ID 1000 is recorded in the Application event log on the connector server. The message indicates a fault in the application: `MicrosoftEntraPrivateNetworkConnectorService.exe`, including details such as the version, call stack, and other diagnostic information.

The **impact on the customer** largely depends on the **frequency of the crashes**, but other factors such as the number of affected users, critical applications involved, or the timing of the incident can also play a significant role.

**Troubleshooting such crashes can be complex and time-consuming.** In many cases, collaboration between support and engineering teams is essential. Multiple rounds of data collection may be required, and in certain situations, code changes made by engineering team to the connector itself might be necessary to resolve the issue.

## Guide

### Step 1: Verify Connector Version

Verify that the connector service is operating with the latest binaries.

- [How to get the version of the connector](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/436400/Microsoft-Entra-application-proxy-How-to-get-the-version-of-the-connector)
- [Microsoft Entra private network connector version release notes](https://learn.microsoft.com/en-us/entra/global-secure-access/reference-version-history)

If the issue is not resolved by upgrading to the latest version, continue with the next steps.

### Step 2: Understand the Issue

To help narrow down the root cause, gather details:

- **When did the issue start?** Since initial setup or later?
- **If it started later**, were there any changes (configuration, updates, network)?
- **Scope of impact**: Single connector, multiple connectors, or all connectors in the same group? How often does the crash occur?
- **Connector usage**: Application Proxy, Global Secure Access Private Access, or both?
- **If used for both features**, can you isolate usage (test with only one feature enabled)?
- **Hardware specifications** of the affected system(s)
- **Operating System**: version, fully updated with latest patches? .NET Framework up to date?

### Step 3: Data Collection

**Important:** It is recommended to collect more than one dataset (2-3). Ensure that the affected computer has sufficient free space on the C: drive (at least 20 GB). If data collection fails, raise an AVA request.

**Preparation:**

a) Enable full user mode dump: [Collect a full user mode dump when the connector crashes](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Microsoft-Entra-application-proxy-Action-Plan-Templates-for-Data-Collection?anchor=**collect-a-full-user-mode-dump-when-the-connector-crashes**)

**Data collection:**

b) Start data collection with the Data Collector script using GSA and Perfmon options: [Microsoft Entra Application Proxy Connector Data Collector Script](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Microsoft-Entra-application-proxy-Action-Plan-Templates-for-Data-Collection?anchor=**microsoft-entra-application-proxy-connector-data-collector-script-(former%3A-azure-ad-application-proxy-connector-data-collector-script)**)

c) Configure to stop the data collector script when event ID 1000 is recorded in the Application log: [Stopping Data Collector Script on event occurrence](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/584971/Azure-AD-Application-Proxy-Stopping-Data-Collector-Script-on-event-occurrence-in-the-event-log)

Ask the customer to upload the dump file and the zip file to the workspace.

### Step 4: Escalate to Engineering

Once you have gathered all answers and datasets, inform the Hybrid Authentication Experiences SMEs and raise an [ICM](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/393136/Microsoft-Entra-application-proxy?anchor=icm-escalation-path), including all relevant information.

### Step 5: Collaborate

Collaborate with the engineering team and the customer (always set customer expectations) to ensure a seamless experience during troubleshooting.

## Contact

For feedback or assistance, contact via [Global Secure Access Teams channel](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47).
