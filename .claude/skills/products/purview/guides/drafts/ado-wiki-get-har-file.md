---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/How to capture logs & traces/Get HAR file"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FHow%20to%20capture%20logs%20%26%20traces%2FGet%20HAR%20file"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get HAR File from Customer Browser

## When to Use
Some UX errors are triggered by API failures or incorrect API responses. A HAR file helps quickly identify if the error is an API issue or a UX issue.

## Steps
1. Login to Purview portal, go to the target page
2. Press F12 or open Developer Tools, switch to **Network** tab, set filter type to "All"
3. Refresh the browser (ensures all requests are captured from portal initialization)
4. Reproduce the error in Purview portal
5. Click **Export HAR...** button to export the HAR file
6. Attach HAR file to ICM for triage

## Triage Tips
- Check for failed requests (usually marked in red)
- Some failures may be irrelevant to the error
- Get rough idea of API behavior from the API URL
