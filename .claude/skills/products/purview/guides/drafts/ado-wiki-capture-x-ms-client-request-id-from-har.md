---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/How to/Capture x-ms-client-request-id from the browser trace (HAR file)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/How%20to/Capture%20x-ms-client-request-id%20from%20the%20browser%20trace%20(HAR%20file)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Capture x-ms-client-request-id from Browser Trace (HAR file)

To check data source Test Connectivity failure issues, you may need to get the **x-ms-client-request-id** to trace in the logs.

## Steps

1. Ask customer to provide the browser traces (HAR file).

2. Download and install Fiddler from: https://www.telerik.com/download/fiddler

3. Open the browser trace in Fiddler:
   - Open Fiddler
   - Stop capture by unchecking "Capture Traffic" from File Menu
   - From File Menu choose Import Sessions...
   - Choose HTTPArchive from the Select Import Format dropdown
   - Click Next and select the .har file

4. If troubleshooting connectivity issues, look for the **/testconnectivity** endpoint from the URL in the left-pane.

5. In the right-top (Request) pane, click on the Raw tab and capture the **x-ms-client-request-id** information.

6. Use this GUID to check the Gateway and other logs.

## Quick Method (Live Session)
If you're online with the customer, press F12 to start Network Capture and ask customer to reproduce the issue. Look for the /testConnectivity endpoint in the frames and click on it. In the request section you can find the x-ms-client-request-id information.
