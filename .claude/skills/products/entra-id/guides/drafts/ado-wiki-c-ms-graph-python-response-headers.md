---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Python/MS Graph Client Python Response Headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FPython%2FMS%20Graph%20Client%20Python%20Response%20Headers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MS Graph Client Python Response Headers

## How to get the response headers from GraphClient response

You will first need to create a Middleware to intercept the HTTP requests. This example gets the `x-ms-client-request-id`:

```python
from msgraph_core.middleware.middleware import Middleware
from msgraph_core import GraphClient
from msgraph_core.middleware.middleware_pipeline import MiddlewarePipeline

class ResponseHeaderMiddleware(Middleware):
    async def send(self, request, next):
        response = await next(request)
        headers = response.headers
        client_request_id = headers.get('x-ms-client-request-id')
        print('x-ms-client-request-id:', client_request_id)
        return response

middleware_pipeline = MiddlewarePipeline([ResponseHeaderMiddleware()])
client = GraphClient(authentication_provider=lambda: token, middleware_pipeline=middleware_pipeline)

async def get_graph_data():
    response = await client.get('/me')
    print(response.json())

import asyncio
asyncio.run(get_graph_data())
```

## Add Client Request ID to your request

You can add and specify your own Request ID that can be used to find within the MS Graph logs:

```python
import uuid

async def get_graph_data():
    # Generate a random UUID (Version 4)
    guid = uuid.uuid4()

    custom_headers = {
        'client-request-id': str(guid)
    }

    response = await client.get('/me', headers=custom_headers)
    print(response.json())

import asyncio
asyncio.run(get_graph_data())
```

## Key Points

- Use Middleware to intercept and inspect response headers
- `x-ms-client-request-id` is essential for correlating requests in MS Graph logs
- You can set custom `client-request-id` headers for easier troubleshooting
