---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Windows/Windows Performance Recorder Logs"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FWindows%2FWindows%20Performance%20Recorder%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows Performance Recorder (WPR) Logs Collection

## Steps

1. Download the Windows ADK from https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk
2. Open adksetup.exe and select "Windows Performance Toolkit" to install
3. Start "Windows Performance Recorder" and select options under Resource Analysis
4. Logging mode: "Memory" (default) or "File" (watch disk space)
5. Capture data for no more than 15 minutes
6. Immediately after WPR capture, use Process Explorer to dump the process with high CPU
