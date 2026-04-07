---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Graph/Architecture/ARG GET - LIST API (Project Pacific)"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Graph%2FArchitecture%2FARG%20GET%20-%20LIST%20API%20%28Project%20Pacific%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ARG GET / LIST API — Project Pacific

> Public Preview

## Overview

The ARG GET/LIST API offloads GET and LIST requests to an alternate ARG platform.

This means, a request that would usually go to the resource provider, can be processed by Azure Resource Graph when the `useResourceGraph=true` query parameter is passed in the URL.

Special considerations for this API usage pattern are documented in the official docs below.

## Additional information
- [[LEARN] Azure Resources Graph (ARG) GET/LIST API](https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/azure-resource-graph-get-list-api)
