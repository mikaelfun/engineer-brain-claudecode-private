---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Procedure] - Microsoft Defender for cloud Recommendations escalation workflow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProcedure%5D%20-%20Microsoft%20Defender%20for%20cloud%20Recommendations%20escalation%20workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Defender for Cloud Recommendations Escalation Workflow

This Wiki should be followed before escalating any general issues related to Microsoft Defender for Cloud (MDC) recommendations/assessments.

## Understanding Microsoft Defender for Cloud (MDC) Recommendations

- MDC recommendations are provided by many different Azure development teams (much like alerts).
- MDC recommendations are also called Assessments.
- All MDC recommendations are injected into Azure Resource Graph (ARG).
- For each recommendations question/query/issue, ask the customer to export an ARG query:
  ```kql
  securityresources
  | where type == "microsoft.security/assessments"
  | where subscriptionId == "{subscriptionId}"
  ```

- All recommendations are either based on Azure Policy (control-plane) or updating associated policy (data-plane).

## Escalations

### ICM Data Collection Requirements

1. Subscription and Session ID
2. Assessment(s) Key
3. Output of the recommendation(s) from ARG
4. All evidence collected from investigation steps
5. Kusto query results:
   ```kql
   cluster('RomeTelemetryData.kusto.windows.net').database('RomeTelemetryProd').AssessmentsNonAggregatedStatusSnapshot
   | where SubscriptionId == "{subscriptionId}"
   | extend AssessedResourceName = split(AssessedResourceId, "/")[-1], AssessedResourceType = split(AssessedResourceId, "/")[-2]
   | summarize arg_max(Timestamp, *) by AssessedResourceId
   | project Timestamp, AssessmentKey, AssessmentsDisplayName, ReleaseState, AssessedResourceName, AssessedResourceType, StatusCode, StatusCause, StatusDescription, StatusChangeDate, FirstEvaluationDate, AssessedResourceId
   ```

### Escalation Steps

1. Get information about the recommendation:
   - Go to MDC portal > Recommendations, search the recommendation
   - Check resource status and compare to policy compliance
   - Click "View policy definition" to learn about the policy intent
   - Click "Open query" to get the ARG query

2. Identify the Recommendation/policy/assessment provider:
   ```kql
   cluster('Rometelemetrydata').database('RomeTelemetryProd').RecommendationsData(31d,0d)
   | where AssessmentDisplayName has "{recommendation_name}"
   ```
   Key fields: AssessmentKey, PolicyDefinitionId, ServiceTreeId, TeamName

3. Find team to escalate to using ServiceTreeId:
   ```kql
   cluster('Icmcluster').database('IcmDataWarehouse').GetDim_ServiceTree_ServiceOid()
   | where ServiceOid == "{ServiceTreeId}"
   | join kind=inner (cluster('Icmcluster').database('IcmDataWarehouse').TeamsSnapshot(true)) on TeamId
   ```

4. Fallback if nothing returns:
   ```kql
   cluster('Icmcluster').database('IcmDataWarehouse').GetServiceOid()
   | where ServiceOid == "{ServiceTreeId}"
   | where TeamGroupName != ""
   | project DivisionName, TenantName, TenantId, TeamGroupName, ServiceGroupName, ServiceName, PmOwnerAlias, DevOwnerAlias, PublicTeamId, ManageTeamsLink
   ```

**Notes:**
- If ServiceTreeId returns null, use engineering TSG for "Search recommendation owner"
- If TeamName == "greenfield", escalate to "CDG Security Green Team Services/Triage"
- PublicTeamId is the team to escalate to in ICM
- In case of multiple results, use the Triage team

## Common Scenarios

### Customer Gets No Recommendation for a Resource

1. Check policy assignment status under Security Center > Security Policy
2. Check Policy assignment and compliance status of assigned initiative
3. Verify Azure Security Benchmark (ASB) is the default policy initiative
4. If customer disabled ASB: recommend keeping it assigned and disabling unwanted policies within it
5. At least one initiative must be assigned
