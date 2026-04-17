---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Machine Learning Asset Stage Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FMachine%20Learning%20Asset%20Stage%20Management"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> Public Preview

> Greenfield only

> Supported effects: Deny

> Built-in policies only

## Architecture

### Greenfield

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant A as ML dataplane endpoint
  User->>A: Create data plane object operation
  A->>A: Evaluation happens inside ML RP through the Policy microservice
  A->>A: ML RP processing
  A-->>User: Operation result
```

> Policy RP is **not** involved during this evaluation process.

### Policy retrieval process

The diagram below covers how the Partner integration updates the policies cache for evaluation inside the RP.

```mermaid
sequenceDiagram
  autonumber
  participant A as Policy microservice inside ML RP
  loop Every 10 minutes
    A->>ARM: GET {scope}/providers/Microsoft.Authorization/policy*
    ARM-->>A: [API response]
    A->>A: Filter results to the DP integration only
  end
```

> `policy*` refers to any policy resource (definitions, assignments, initiatives, exemptions, etc.)

## Support ownership

| Team | Ownership | SAP |
|-|-|-|
| Machine Learning | Payload to evaluate, Policy micro-service, evaluation result | Azure/Machine Learning/Workspace Management, Configuration and Security/Issues with Azure ML built-in policies |
| Policy | All policy APIs, anything related to the Policy clients or UI | No specific SAP, depends on the scenario |

> From ML side, the above support scope was approved. If there is any pushback on support scope from ML team, please pull Cameron into the conversation.

## Additional information

- Resource provider TSG: [[ADO] Feature: Azure ML Policy for Registries](https://dev.azure.com/supportability/AzureML/_wiki/wikis/AzureML/1216054/Feature-Azure-ML-Policy-for-Registries?anchor=tsg-with-kusto-and-errors)
