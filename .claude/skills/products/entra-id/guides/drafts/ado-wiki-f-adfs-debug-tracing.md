---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/ADFS/ADFS Debug Tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FAuthentication%20and%20Access%2FADFS%2FADFS%20Debug%20Tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This logging it helpful to see how ADFS processes the claim.

## To Enable:

1.  Open an admin command prompt and run the following command:
    `wevtutil sl "AD FS Tracing/Debug" /l:5`
    `net stop adfssrv && net start adfssrv`
2.  Open Event Viewer
    1.  Enable the 'Show Analytic and Debug Logs' option under the View menu
    2.  Expand Application and Services Logs > AD FS Tracing > Debug.
    3.  Right-click Debug log and select Enable Log. Note: alternatively, the debug log can be enabled through the following command line: `wevtutil sl "AD FS Tracing/Debug" /l:5 /e:true`
3.  Reproduce the issue

## To Review Logs:

1.  Open Event Viewer
2.  Expand Application and Services Logs > AD FS Tracing > Debug.
3.  Right-click Debug and select Disable Log.
4.  Right-click Debug and select Save All Events As and save the events in a convenient location.
5.  Be sure to save the display information in relevant languages.
6.  On the Event View menu bar select Action > Open Saved Log
7.  Navigate to the newly opened saved log.
8.  Filter on:
    Event IDs: 77, 111, 112, 133, 54, 128, 151, 140
