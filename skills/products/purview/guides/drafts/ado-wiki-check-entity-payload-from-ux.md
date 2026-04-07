---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/How to/How to check entity payload from UX"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/How%20to/How%20to%20check%20entity%20payload%20from%20UX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Check Entity Payload from UX

## Steps

1. When the browser is active and you're viewing the asset entity under investigation, press **F12** to open developer tools.

2. Click on the **refresh** button to ask the portal to retrieve the entity again. You should see many requests on the **Network** tab.

3. Copy the GUID of the entity from the URI to the **filter** field to filter out the relevant requests.

4. Click on the request with **"bulk"** and size not equal to 0 — you should see the payload in the response tab.

## Use Case
This technique is useful for debugging entity-related issues in Microsoft Purview Governance Portal, such as:
- Verifying entity schema/metadata
- Checking if entity data is correctly returned from the API
- Troubleshooting missing or incorrect entity attributes
