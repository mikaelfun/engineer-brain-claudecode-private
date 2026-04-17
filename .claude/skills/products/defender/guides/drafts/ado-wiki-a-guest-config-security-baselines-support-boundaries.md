---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/Guest Configuration Baselines (Security Configuration)/[Support Boundaries] - Guest Configuration Security Baselines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/Guest%20Configuration%20Baselines%20%28Security%20Configuration%29/%5BSupport%20Boundaries%5D%20-%20Guest%20Configuration%20Security%20Baselines"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [Support Boundaries] - Guest Configuration Security Baselines

## Overview

This page defines the **support ownership boundaries** between the **Guest Configuration team** and the **Microsoft Defender for Cloud (MDC) team** for the security baseline recommendations.

## Scope

| Recommendation | Guest Assignment | Assessment Key |
|---|---|---|
| Vulnerabilities in security configuration on your Windows machines should be remediated (powered by Guest Configuration) | `AzureWindowsBaseline` | `8c3d9ad0-3639-4686-9cd2-2b2ab2609bda` |
| Vulnerabilities in security configuration on your Linux machines should be remediated (powered by Guest Configuration) | `AzureLinuxBaseline` | `1f655fb7-63ca-4980-91a3-56dbc2b715c6` |

https://learn.microsoft.com/en-us/azure/defender-for-cloud/apply-security-baseline
---

## End-to-End Flow

The following diagram shows the full pipeline from baseline rule evaluation to MDC recommendations:

:::mermaid
flowchart TD
    A["<b>OSConfig</b><br/>Baseline rule logic<br/>& compliance definitions"] -->|Evaluates rules| B["<b>Guest Config Agent</b><br/>(on VM)"]

    B -->|Compliant / NonCompliant<br/>per rule ID| C["<b>Guest Config Assignments</b><br/>AzureWindowsBaseline /<br/>AzureLinuxBaseline"]

    C -->|Maps to| D["<b>MDC Sub-Assessments</b>"]

    D --> E["<b>Windows Recommendation</b>"]
    D --> F["<b>Linux Recommendation</b>"]

    style A fill:#4A90D9,color:#fff
    style B fill:#7B68EE,color:#fff
    style C fill:#2E8B57,color:#fff
    style D fill:#DC143C,color:#fff
    style E fill:#1E90FF,color:#fff
    style F fill:#1E90FF,color:#fff
:::

---

## Ownership Decision Tree

Use this diagram to determine which team owns a reported issue:

:::mermaid
flowchart TD
    Start["Issue Identified"] --> Q{"What's the problem?"}

    Q --> FP["Security baseline rule is a<br/>false positive / false negative"]
    Q --> NotInstalled["Guest Config not installed<br/>or in failed state"]
    Q --> NoAssign["Guest Config not<br/>generating assignments"]
    Q --> Mismatch["Baseline findings don't match<br/>MDC sub-assessment results"]

    NotInstalled --> GC["<b>Owning Team:</b><br/>Guest Config"]
    NoAssign --> GC
    FP --> MDC_Own["<b>Owning Team:</b><br/>MDC CSS"]
    Mismatch --> MDC_Own

    style Start fill:#555,color:#fff
    style Q fill:#F5A623,color:#fff
    style FP fill:#666,color:#fff
    style NotInstalled fill:#666,color:#fff
    style NoAssign fill:#666,color:#fff
    style Mismatch fill:#666,color:#fff
    style GC fill:#7B68EE,color:#fff
    style MDC_Own fill:#2E8B57,color:#fff
:::

---

## Ownership Summary

| # | Scenario | Owning Team | What to Check |
|---|---|---|---|
| 1 | Security baseline rule is a false positive / false negative | **MDC CSS** | Baseline rule definitions, rule id evaluation in ASC |
| 2 | Guest Config not installed or in failed state | **Guest Config Team** | VM extension status, GC agent logs |
| 3 | Guest Config not generating assignments | **Guest Config Team** | VM extension status, GC agent logs  |
| 4 | Baseline findings don't match MDC sub-assessment results | **MDC CSS** | Sub-assessment result vs guest assignment result |

> **Key principle:** All Guest assignments under the security baseline recommendations are owned E2E by the MDC team from the point the data leaves the VM. Issues *inside* the VM (agent, extension, rule logic) follow the decision tree above.

---

## Related Articles

- [[Product Knowledge] - Guest configuration Baselines](/Defender-for-Cloud/Recommendations-and-remediation/Baselines-(configure-machines-securely)/Guest-Configuration-Baselines-(Security-Configuration)/%5BProduct-Knowledge%5D-%2D-Guest-configuration-Baselines)
- [[Troubleshooting Guide] - Guest configuration baselines](/Defender-for-Cloud/Recommendations-and-remediation/Baselines-(configure-machines-securely)/Guest-Configuration-Baselines-(Security-Configuration)/%5BTroubleshooting%2DGuide%5D-%2D-Guest-configuration-baselines)
- [[Product Knowledge] - Azure Policy Guest Configuration Agent](/Defender-for-Cloud/Recommendations-and-remediation/Baselines-(configure-machines-securely)/Guest-Configuration-Baselines-(Security-Configuration)/%5BProduct-Knowledge%5D%2DAzure%2DPolicy%2DGuest%2DConfiguration%2DAgent)
- [[Troubleshooting Guide] - Guest Configuration recommendation result discrepancy](/Defender-for-Cloud/Recommendations-and-remediation/Baselines-(configure-machines-securely)/Guest-Configuration-Baselines-(Security-Configuration)/%5BTroubleshooting%2DGuide%5D-%2D-Guest-Configuration-recommendation-result-discrepancy)

---

## Contributors

| Name | Date |
|---|---|
| Francisco Prelhaz | 2025-02-27 |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

