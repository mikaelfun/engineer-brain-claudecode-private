---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Extra Goodies for extra miles - Scripts: powershell, python"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FExtra%20Goodies%20for%20extra%20miles%20-%20Scripts%3A%20powershell%2C%20python"
importDate: "2026-04-05"
type: reference-guide
---

## Microsoft has a clear rule when it comes to customers requesting assistance with scripts

Support for building and fixing scripts is not in scope!

However, sometimes, a bit of an extra mile will increase customer satisfaction and trust.
**If you feel comfortable with script coding and have a very good understanding of a code block**, you may check out what is failing for a customer when running a script and, if available, provide a working example from someone owning such in the team.

**Always make sure the customer agrees FIRST that the example is provided as it is, with no guarantees and that using it is their own full responsibility. If the customer agrees on these terms, consult in the collab channel and proceed afterwards.**

## Example: Remote Action call via Graph API (Python)

Requirements: Enterprise Application with required API permissions, client secret

```python
import msal
import requests
from azure.identity import ClientSecretCredential
from msgraph import GraphServiceClient
import asyncio
from msgraph.generated.device_management.virtual_endpoint.cloud_p_cs.cloud_p_cs_request_builder import CloudPCsRequestBuilder
from kiota_abstractions.base_request_configuration import RequestConfiguration
import re

UPN=input("What is the UPN?:\n")
scopes = ['https://graph.microsoft.com/.default']

tenant_id = 'TENANT ID'
client_id = 'Enterprise APP ID'
client_secret = 'App Secret VALUE'

credential = ClientSecretCredential(
    tenant_id=tenant_id,
    client_id=client_id,
    client_secret=client_secret)

graph_client = GraphServiceClient(credential, scopes)
query_params = CloudPCsRequestBuilder.CloudPCsRequestBuilderGetQueryParameters(
    select = ["id"],
    filter= "startswith(userPrincipalName,"+"'"+UPN+"'"+")",
)

request_configuration = RequestConfiguration(
    query_parameters = query_params,
)

async def call_graph():
    CPID = await graph_client.device_management.virtual_endpoint.cloud_p_cs.get(request_configuration=request_configuration)
    CPIDText = str(CPID)
    match = re.search(r"id='(.*?)'", CPIDText)
    if match:
        extracted_value = match.group(1)
        response = await graph_client.device_management.virtual_endpoint.cloud_p_cs.by_cloud_p_c_id(extracted_value).troubleshoot.post()
        print(response)
        return response
    else:
        print("No match found.")
        return extracted_value

asyncio.run(call_graph())
```

Python modules required:
- `pip install azure-identity`
- `pip install msgraph-sdk` (may throw error if OS long-path not enabled)
- `pip install asyncio` (requires Python 3.3+)
