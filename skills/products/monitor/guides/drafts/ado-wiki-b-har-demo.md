---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/Training Resources/Understanding and effectively using HAR/HAR Demo"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/Training%20Resources/Understanding%20and%20effectively%20using%20HAR/HAR%20Demo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HAR Demo - How to Collect a HAR Trace

## Overview
Walkthrough demo on how to properly collect a HAR trace in browser developer tools.

## Workflow
1. Open the developer tools in the browser via ellipses menu or "CTRL + Shift + i".
2. **Stop the recording** and **clear the network log** before reproducing the behavior. This avoids noise from other calls.
3. Start recording again just before reproducing the suspect behavior.
4. After reproducing the call, pause the recording and validate captured data by inspecting Payload or Response sections. Use the built-in filter in the Network tab to narrow the search.
5. Use the **Export** option to save the trace as a .har file.

Last Modified: 2024/08/28
