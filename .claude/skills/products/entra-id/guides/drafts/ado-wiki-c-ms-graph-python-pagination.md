---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Python/MS Graph Client Python Pagination"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FPython%2FMS%20Graph%20Client%20Python%20Pagination"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to perform pagination using Microsoft Graph Python SDK

## Overview

Here is an example of how to perform pagination using Microsoft Graph Python SDK.

## Code Example

```python
from msgraph.core import GraphClient

client = GraphClient(credential=your_credential)

# Initial request
response = client.get('/users')
users = response.json().get('value', [])

# Follow pagination
while '@odata.nextLink' in response.json():
    next_link = response.json()['@odata.nextLink']
    response = client.get(next_link)
    users.extend(response.json().get('value', []))
```

## Key Points

- Use `@odata.nextLink` from the response to get the next page of results
- Continue iterating until `@odata.nextLink` is no longer present in the response
- Extend (not replace) the results list with each page's `value` array
