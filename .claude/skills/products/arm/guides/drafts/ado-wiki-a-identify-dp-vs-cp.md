---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Identify DP vs CP"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FIdentify%20DP%20vs%20CP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Identify Data Plane vs Control Plane

Identifying data plane vs control plane is pretty simple.

Basically, any property you can get from a response from `management.azure.com` or from a request payload to `management.azure.com`, will be **control plane**. This means Policy is able to access these properties directly from the standard API calls.

As opposed to control plane, **data plane** properties are not returned on calls to/from `management.azure.com`. Data plane calls usually go to an endpoint that belongs to the resource provider directly, which means those properties **cannot be pulled by a standard ARM call** — and therefore **Azure Policy cannot evaluate them** using standard aliases.
