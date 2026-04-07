---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Policy/[Product Knowledge] Policy Selectors and Overrides"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Policy/%5BProduct%20Knowledge%5D%20Policy%20Selectors%20and%20Overrides"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Policy Selectors and Overrides

## Overview

### What is Overrides?

Each security recommendation is implemented as policy definition part of policy set (initiative) named Azure Security Benchmark (ASB), and each policy definition (or recommendation) has a parameter which configures its effect (Audit, Deny or Disabled).

Azure Policy team introduced 3 main capabilities supporting SDP requirements and scale:
1. **Selectors** - specifies definition version or policyDefinitionReferenceIDs for policy set definition. Can also specify location or type of resource to evaluate (currently out of scope for MDC).
2. **Overrides** - specifies definition version or policy effect (can be mixed with selectors).
3. **Versioning** - specifies version for policy definition and policy set. Will be supported within MDC post Ignite event.

### Usage in MDC

MDC **SUPPORTS** Overrides and Selectors to override the **policy effect** (Audit, Deny or Disabled). In MDC terms: overriding the recommendation **effect parameter**.

### NOT SUPPORTED:
- Overriding **definitionVersion**
- **resourceSelectors** as stand alone (when not used in overrides). The only supported **resourceSelector** is **policyDefinitionReferenceId** selector.

## Example Assignment with Overrides

```json
{
    "properties": {
        "displayName": "This is the default set of policies monitored by ...",
        "policyDefinitionId": "/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8",
        "scope": "/subscriptions/{subscriptionId}",
        "parameters": {
            "secureTransferToStorageAccountMonitoringEffect": { "value": "Audit" },
            "classicComputeVMsMonitoringEffect": { "value": "Deny" }
        },
        "enforcementMode": "Default",
        "overrides": [
            {
                "kind": "policyEffect",
                "value": "deny",
                "selectors": [
                    {
                        "kind": "policyDefinitionReferenceId",
                        "in": ["classicStorageAccountsMonitoring"]
                    }
                ]
            },
            {
                "kind": "policyEffect",
                "value": "disabled",
                "selectors": [
                    {
                        "kind": "policyDefinitionReferenceId",
                        "in": ["classicComputeVMsMonitoring"]
                    }
                ]
            }
        ]
    }
}
```

Key points:
- Two **policy effect** overrides: one for **deny**, one for **disabled**
- The **deny** override targets policy definition reference id: **classicStorageAccountsMonitoring**
- The **disabled** override targets: **classicComputeVMsMonitoring**
- Overrides use policy definition reference id; parameters use Effect Type

## Calculating Assessment Policy Effect for ONE Assignment

### Step 1: Get the assignment

```kusto
// Input: Subscription id and assignment name
policyresources
| where type == "microsoft.authorization/policyassignments"
| where id contains "<INSERT Subscription id>"
| where name == "<INSERT assignment name>"
```

### Step 2: Get the assessment policy definition id by assessment key

```kusto
// Input: Assessment key
// Output: Policy definition id
cluster('romecore.kusto.windows.net').database("Dev").TraceEvent
| where env_time > ago(3d)
| where message has "Assessment Key:" and message has "| Recommendation source type:"
| where message contains "<INSERT Assessment key>"
| take 1
| extend policyDefinitionId = extract("(/policyDefinitions/)(.*)( \\| Supported Environments)", 2, message)
| project policyDefinitionId
```

### Step 3: Get the effect parameter name and policy definition reference id

Usually if the **policy definition reference** id is `examplePolicyDefinitionReferenceId`, the **effect parameter name** is `examplePolicyDefinitionReferenceIdEffect`.

```kusto
// Input: Policy definition id
// Output: Effect parameter name and policy definition reference id
policyresources
| where type == "microsoft.authorization/policysetdefinitions"
| where name == "1f3afdf9-d0c9-4c3d-847f-89da613e70a8"
| take 1
| extend PolicyDefinitions = properties.policyDefinitions
| mv-expand PolicyDefinitions limit 400
| project PolicyDefinitions
| where PolicyDefinitions.policyDefinitionId contains "<INSERT Policy definition id>"
| extend policyDefinitionReferenceId = PolicyDefinitions.policyDefinitionReferenceId
| project policyDefinitionReferenceId, effectParameterUnCleaned = extract("'(.*?)'", 1, tostring(PolicyDefinitions.parameters.effect.value))
```

### Step 4: Determine effective policy effect (precedence logic)

1. **If overrides exist** on the assignment:
   - Check if the assessment **policy definition reference id** exists in the policy effect selector array
   - If the same reference id appears in more than one override, **take the last one**
   - If an override has an **empty** selector array, it applies to **all** policy definition reference ids (previous bullet still applies)

2. **If parameter exists** on the assignment:
   - Check if the assessment **effect parameter name** exists in the parameters property
   - **If both overrides and parameter exist for the same assignment, overrides win**

3. **If neither overrides nor parameter exists**:
   - Look at the default value on the initiative:
   ```kusto
   // Input: Effect parameter name
   policyresources
   | where type == "microsoft.authorization/policysetdefinitions"
   | where name == "1f3afdf9-d0c9-4c3d-847f-89da613e70a8"
   | take 1
   | extend PolicyParameters = properties.parameters
   | mv-expand PolicyParameters limit 400
   | project PolicyParameters
   | where notnull(PolicyParameters["<INSERT Effect parameter name>"])
   ```
   - Or check on the policy definition:
   ```kusto
   // Input: Policy definition id
   policyresources
   | where type == "microsoft.authorization/policydefinitions"
   | where id contains "<INSERT Policy definition id>"
   | take 1
   | extend defaultEffect = properties.parameters.effect.defaultValue
   | project defaultEffect
   ```
