---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/HTTP traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FHTTP%20traces"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Azure Resource Manager works with REST APIs, which means, all communication between clients and ARM is handled through the HTTP protocol.

Any API call to ARM includes important information about the intent of the client (resource id, authorization header, request body, etc.), and any response from ARM includes information about how that request was processed (HTTP status code, headers, response body, etc.).

There is also key information in the trace that can help locating the right operation in our logs.

Here are a few samples of that:

- **Object id:** This can be found in a decoded Authorization token, which comes from the `Authorization` request header in any call from the client to ARM. See [[TSG] Decode a JWT](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623805).
- **Correlation id:** Found in the `x-ms-correlation-request-id` response header of an ARM call.
- **Activity id:** Found in the `x-ms-request-id` response header of an ARM call.
- **Session id:** Found in the `x-ms-client-session-id` request header of an ARM call (only if the request comes from the Azure Portal).

Traces do not lie, they are key to understand what happened with the operation and if the call behaved as expected.

## Additional information
- [[TSG] Get a HTTP Trace](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623815)
