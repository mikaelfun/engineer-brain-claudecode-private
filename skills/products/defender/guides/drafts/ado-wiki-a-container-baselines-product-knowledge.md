---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/[Product Knowledge] - Container Baselines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/%5BProduct%20Knowledge%5D%20-%20Container%20Baselines"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

The Container Baselines experience exists as a legacy recommendation under the recommendation `Container hosts should be configured securely`.

![image.png](/.attachments/image-24031f16-c338-4e69-86a0-9bca24b509db.png)

# How Does it Work?

The recommendation is based on data that is collected from each machine by the OMS agent, which also reports the data to the user's Log Analytics workspaces. The OMS agent running on the machine is responsible for populating the data properly in the `SecurityBaseline` table in the Log Analytics workspace.<br/> MDC in turn approches these workspaces and queries them for their data under the `SecurityBaseline` table. If the data exists properly, it will be shown by MDC in this recommendation.

# What is required by MDC?

MDC uses as a proxy to extract data from all the user's workspaces, including cross-subscription workspaces, and shows all the data centralized in 1 view.

**Please note**: MDC is not responsible for the OMS agent sending the reports to the workspace, but only for taking it from the workspaces. Thus, in this TSG we will deal mainly with checking for whether MDC's required data exists on the workspace or not.

## MDC Security Configurations Query
The data created in MDC is based on the below query:
```
SecurityBaseline
| where BaselineType == "Docker"
| where Computer == "<computer name>" 
| summarize arg_max(TimeGenerated, *) by CceId
| where AnalyzeResult == "Failed"
| project
    CceId,
    Description,
    Resource,
    ResourceGroup,
    RuleSeverity,
    ActualResult,
    BaselineType,
    Type,
    SubscriptionId,
    TenantId,
    ResourceId,
    ComputerEnvironment
| order by RuleSeverity asc nulls last
```

# How health state is determined in MDC
Based on the above queries, we check for each baseline row the value for "AnalyzeResult".

1. If a resource has any Baseline row where AnalyzeResult == "Failed" -> then the resource status is "Not Healthy".
1. If a resource has rows in the Baseline table, and for all of them AnalyzeResult == "Success"-> then the resource status is "Healthy".

# TSG

## I can't see the recommendation in MDC

Run the above query on the Log Analytics workspace. If you don't see any data - the problem is in the OMS agent not reporting the data to the Log Analytics workspace.

### Please route the incident to the ASM team using the details below:
- Read and follow the ASM wiki: [**Customer Support Request Workflow**](https://msazure.visualstudio.com/ASMDocs/_wiki/wikis/ASMDocs.wiki/65129/External-Customer-Support-Request-Workflow?anchor=**compute-os-baselines**)  for evidences that needs to be collected.
- If needed create IcM using [**this template**](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T1I121)
- Additionally, also e-mail the following to AzSecBaselineSupport@microsoft.com & [Guruprasad Venkatesha](mailto:Guruprasad.Govindappa@microsoft.com) for getting support.

|Contributor Name|  Details|  Date|
|--|--|--|
| Dan Chang| Created this section | 1/16/2022 |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

