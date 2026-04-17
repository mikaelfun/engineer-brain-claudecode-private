---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Product Knowledge] - Recommendation Platform Assessment status decision making"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProduct%20Knowledge%5D%20-%20Recommendation%20Platform%20Assessment%20status%20decision%20making"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding Assessment Status Logic

## Summary

Explains how MDC backend determines assessment status (Healthy, Unhealthy, Not Applicable) based on Control Plane vs Data Plane mechanisms.

## Control Plane - Policy Based

### Single ASB Assignment
- Main status derived directly from the single ASB initiative
- No aggregation between initiatives' statuses

### Multiple ASB Assignments
- Assessment status aggregates all ASB initiative statuses
- MG and Subscription level initiatives count as multiple assignments

| Policy Assessment at MG | Policy Assessment at Sub | MDC Status |
|--------------------------|--------------------------|------------|
| Unhealthy | Healthy | Unhealthy |
| Healthy | Unhealthy | Unhealthy |
| Healthy | Healthy | Healthy |
| Exempted | Healthy | Healthy |
| Exempted | Exempted | Exempted |

**Note:** In practice, more variables influence the published assessment status based on recommendation type.

## Data Plane - Assessment Based

- One overall assessment is published for all policy initiative assignments
- Exemption status reflects only when EVERY relevant policy in ALL initiatives applied to the resource is exempted
- Unique scenario with exemptions: partial exemption does not change overall status

## Key Takeaways

- Control plane: ASB initiative status is authoritative (single) or aggregated (multiple)
- Data plane: all policies across all initiatives must be exempted for exemption to apply
- Multiple scope assignments (MG + Sub) create aggregation behavior that can cause unexpected Unhealthy status
