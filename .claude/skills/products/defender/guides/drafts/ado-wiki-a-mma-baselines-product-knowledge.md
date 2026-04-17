---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/[deprecated] MMA Baselines (Security Configuration)/[Product Knowledge] - MMA Baselines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/%5Bdeprecated%5D%20MMA%20Baselines%20%28Security%20Configuration%29/%5BProduct%20Knowledge%5D%20-%20MMA%20Baselines"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
MDC provides security configuration recommendations (A.K.A baseline recommendations). The recommendation is based on data that is collected from each machine by the OMS agent (A.K.A Log Analytics agent), which also reports the data to the user's Log Analytics workspaces. The OMS agent running on the machine is responsible for populating the data properly in the `SecurityBaseline` table in the Log Analytics workspace.<br/> MDC in turn approches these workspaces and queries them for their data under the `SecurityBaseline` table. If the data exists properly, it will be shown by MDC in this recommendation.

![image.png](/.attachments/image-22925215-ff70-43c9-bbd5-1d54d96d32d2.png)

# What is required by MDC
MDC uses as a proxy to extract data from all the user's workspaces, including cross-subscription workspaces, and shows all the data centralized in 1 view.

**Please note**: MDC is not responsible for the OMS agent sending the reports to the workspace, but only for taking it from the workspaces. Thus, in this TSG we will deal mainly with checking for whether MDC's required data exists on the workspace or not.

## MDC Security Configurations Query
The data created in MDC is based on the below queries:


```
SecurityBaseline
| where (BaselineType =~ 'WindowsOS' or BaselineType =~ 'Windows OS' or BaselineType =~ 'Linux' or BaselineType =~ 'Oms.Linux' or BaselineType =~ 'Web' or (isempty(BaselineType) and isnotempty(TimeGenerated))) 
| summarize arg_max(TimeGenerated, *) by SourceComputerId, Computer, BaselineRuleId, RuleSeverity, BaselineRuleType
```

# How health state is determined in MDC
Based on the above queries, we check for each baseline row the value for "AnalyzeResult".

1. If a resource has any Baseline row where AnalyzeResult == "Failed" -> then the resource status is "Not Healthy".
1. If a resource has rows in the Baseline table, and for all of them AnalyzeResult == "Success"-> then the resource status is "Healthy".

|Contributor Name|  Details|  Date|
|--|--|--|
| Dan Chang| Created this section | 1/16/2022 |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

