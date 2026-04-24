---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/fiddler-capture-ssl-traffic
importDate: "2026-04-24"
type: guide-draft
---

# Capture SSL Traffic with Fiddler (Node.js and .NET)

## Node.js
Set proxy env vars before npm start:
- set https_proxy=http://127.0.0.1:8888
- set http_proxy=http://127.0.0.1:8888
- set NODE_TLS_REJECT_UNAUTHORIZED=0

## Azure Key Vault .NET SDK
Set HTTP_PROXY and HTTPS_PROXY environment variables in code before creating SecretClient.
