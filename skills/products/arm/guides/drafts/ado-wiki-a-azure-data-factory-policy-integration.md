---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Azure Data Factory"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FAzure%20Data%20Factory"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Data Factory — Policy RP Integration

> **Status**: Public Preview  
> **Scope**: Greenfield only  
> **Supported effects**: Deny  
> **Policy type**: Built-in policies only

## Architecture

When a user performs a create operation on an ADF data plane endpoint, the endpoint calls the Policy evaluation API with the payload. The evaluation API returns a result, ADF continues processing, and returns the operation result to the user.

```mermaid
sequenceDiagram
  actor User
  User->>ADF dataplane endpoint: Create operation
  ADF dataplane endpoint->>Policy evaluation API: Payload to evaluate
  Policy evaluation API-->>ADF dataplane endpoint: Evaluation response
  ADF dataplane endpoint->>ADF dataplane endpoint: ADF processing
  ADF dataplane endpoint-->>User: Operation result
```

## Support Ownership

| Team | Ownership | SAP |
|-|-|-|
| ADF | Request to evaluate policy, payload to evaluate | Azure/Data Factory/Security (Permission, Firewall, and etc.)/Policies |
| Policy | Evaluation result, response to evaluation request* | No specific SAP — depends on scenario |

*Policy team also owns everything else under the Policy UX and APIs.

## Additional Information

- [Outbound network rules using Azure Policy (Preview)](https://learn.microsoft.com/en-us/azure/data-factory/configure-outbound-allow-list-azure-policy)
