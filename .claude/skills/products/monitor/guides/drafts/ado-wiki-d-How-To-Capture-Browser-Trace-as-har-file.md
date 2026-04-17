---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/General/How To Capture Browser Trace as har file"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FGeneral%2FHow%20To%20Capture%20Browser%20Trace%20as%20har%20file"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To Capture Browser Trace as HAR file

Used to troubleshoot issues with the Azure Log Analytics Portal UI loading and other browser-related issues.

## Browser F12 Network Trace

### Steps to capture F12 Network Trace
1. Open your browser and navigate to webpage experiencing the issue
2. Push F12 on your keyboard to open developer tools
3. Click on the Network tab and ensure recording is occurring
   - IE: looks like a Play button
   - Chrome: looks like a red Record button
4. Click into the address bar and hit enter to reload the page (**do NOT refresh it**). Reproduce the issue.
5. Click the Stop button to stop recording
6. Save the trace:
   - IE: click the icon that looks like a floppy disk
   - Chrome: right click on the first line under the Name column on the network tab and select "Save as HAR with content"
7. Zip and attach to the case

## Fiddler Trace

For cases where a browser network trace is insufficient (client application/CLI behavior, spans multiple browser tabs).

### Steps to capture Fiddler Trace
1. Download and install Fiddler: https://www.telerik.com/download/fiddler/fiddler4
2. Close any instances of your web browser
3. Launch Fiddler via **Start > All Programs > Fiddler**
4. Open **Tools > Fiddler Options**
5. Click the **HTTPS** tab, check both **Capture** and **Decrypt** checkboxes
6. Trust the Fiddler Root certificate when prompted (click Yes to all prompts)
7. Click **OK** on Fiddler Options
8. Reproduce the problem
9. **File > Save All Sessions** - type filename and save
10. **File > Exit**
11. Upload the .HAR capture to the case
