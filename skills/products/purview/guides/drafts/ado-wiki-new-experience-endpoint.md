---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Data Map Assets/New Experience Endpoint"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Data%20Map%20Assets/New%20Experience%20Endpoint"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# New Experience Endpoint (Classic vs Enterprise API)

Author: Tiffany Fischer

## Overview

The new experience Microsoft Purview uses a different endpoint for REST API. Existing (Classic) Purview accounts continue using the old API endpoint.

## Endpoint Reference

| Experience | Endpoint Format |
|-----------|----------------|
| Classic | `https://{your_purview_account_name}.purview.azure.com` |
| Enterprise (New Portal) | `https://api.purview-service.microsoft.com` |

## Notes

- Most REST API docs still reference the original (Classic) endpoints
- Some docs have been updated with the new endpoint but the new experience is not yet available to everyone
- Example: [Create Assets REST API tutorial](https://learn.microsoft.com/en-us/purview/create-entities) uses the new endpoint

## Reference

- [Create assets using REST API](https://learn.microsoft.com/en-us/purview/create-entities?tabs=classic-portal)
