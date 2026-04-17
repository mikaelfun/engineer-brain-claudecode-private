---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/WebApps_training/Initial Questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/WebApps_training/Initial%20Questions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Environment Details

*   What is the **Windows Server version**(including build number)?
*   What is the **IIS version**?
*   Server name(s) affected:
*   Is this issue occurring on **a single server or multiple servers**?
*   Is the server part of a **web farm / loadbalanced setup**?

### IIS & Application Details

*   Affected **Site / Application name**:
*   **Application Pool name**:
*   **.NET CLR version**:
*   **Pipeline mode**(Integrated / Classic):
*   **Bitness**(32bit / 64bit):
*   Is the application running on **.NET Framework or .NET (Core/5+)**? Please specify version.

### IssueSpecific Questions

*   How frequently does the IIS outage occur (daily / weekly / random)?
*   When the issue occurs, does **IIS recover automatically**, or is a **server reboot required**?
*   Have you observed **Event ID 2001 (IISW3SVCPerfCounters)**every time the issue occurs?
*   Are **IIS performance counters missing or showing No valid counters consistently**, or only after the issue starts?
*   Have you attempted any remediation steps such as:
    *   `lodctr /R`
    *   Reinstalling IIS
    *   Restoring counter files from backup
        If yes, please share the outcome.

### Timeline & Impact

*   When was this issue **first noticed**?
*   When did the issue **last occur**?
*   What is the **business impact**(Production / Test / Dev, user impact, downtime)?
*   Did you notice anything unusual (high CPU/memory, Windows Updates, service crashes) when the issue first occurred?
