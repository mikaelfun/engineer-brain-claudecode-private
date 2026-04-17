---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Azure Load Testing"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FAzure%20Load%20Testing"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Load Testing — Policy RP Integration

> **Status**: Public Preview  
> **Supported effects**: Audit, Deny (tbc)  
> **Policy type**: Built-in policies only

## Architecture

When a user performs a create operation on an Azure Load Testing data plane endpoint, the endpoint calls the Policy evaluation API. The evaluation API returns a result, ALT processes accordingly, and returns the operation result to the user.

```mermaid
sequenceDiagram
  actor User
  User->>Azure Load Testing dataplane endpoint: Create operation
  Azure Load Testing dataplane endpoint->>Policy evaluation API: Payload to evaluate
  Policy evaluation API-->>Azure Load Testing dataplane endpoint: Evaluation response
  Azure Load Testing dataplane endpoint->>Azure Load Testing dataplane endpoint: Azure Load Testing processing
  Azure Load Testing dataplane endpoint-->>User: Operation result
```

## Support Ownership

| Team | Ownership | SAP |
|-|-|-|
| ALT | Request to evaluate policy, payload to evaluate | Azure\Azure Load Testing\Test Execution\Provisioning stalls or fails |
| Policy | Evaluation result, response to evaluation request* | No specific SAP — depends on scenario |

*Policy team also owns everything else under the Policy UX and APIs.

## Additional Information

- Additional documentation: tbd (per original wiki page)
