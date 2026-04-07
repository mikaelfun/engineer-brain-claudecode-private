---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Training/Tools/Using NetLog"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Training/Tools/Using%20NetLog"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cw.AAD-Auth
- cw.AAD-Account Management
- cw.AAD-Sync
- cw.AAD-Workflow
- cw.AAD-Dev-Training
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Auth](/Tags/AAD%2DAuth) [AAD-Account Management](/Tags/AAD%2DAccount-Management) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-Training](/Tags/AAD%2DDev%2DTraining)              

:::template /.templates/Shared/MBIInfo.md
:::

# Using NetLog

[[_TOC_]]

# Overview

This is similar to Fiddler/HAR but its not a HAR capture. 

For more info about NetLog�
https://dev.chromium.org/for-testers/providing-network-details


**For Chrome:**  

Open a new tab and navigate to�
`chrome://net-export/`

**For Edge:**  

Open a new tab and navigate to�
`edge://net-export`

Instructions:
1. Optional but helpful: Close all browser tabs but one.
1. Navigate to `chrome://net-export`
    Make sure its configured as�
    * Include raw bytes
    * Leave **Maximum Log Size** blank
1. In the UI that appears, press the Start Logging to Disk button.
1. Choose a filename to save the traffic to. Tip: Pick a location you can easily find later, like your Desktop.
1. Reproduce the networking problem in a new tab. If you close or navigate the //net-export tab, the logging will stop automatically.
1. After reproducing the problem, press the Stop Logging button.
1. Share the Net-Export-Log.json file

**On Mobile Devices**  
This also works on Edge and Chrome for Android
This works on Chrome for iOS

You will have an email option to send the logs when on the mobile device.
From <https://textslashplain.com/2020/01/17/capture-network-logs-from-edge-and-chrome/> 

# Review Logs
Use Fiddler to review logs

Install the NetLog addin for Fiddler
https://bayden.com/dl/FiddlerImportNetLog.exe

1. Open Fiddler
2. Go to File > Import Sessions
3. Select NetLog JSON�

