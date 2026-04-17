# DEFENDER MDC 安全建议与合规 — Comprehensive Troubleshooting Guide

**Entries**: 148 | **Draft sources**: 22 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-assessment-ibiza-not-scc.md, ado-wiki-a-assessment-status-logic.md, ado-wiki-a-azure-policy-vs-management-recommendations.md, ado-wiki-a-custom-recommendations.md, ado-wiki-a-enforce-deny-recommendations.md, ado-wiki-a-governance-kusto-queries-r2.md, ado-wiki-a-guest-config-recommendation-discrepancy-tsg.md, ado-wiki-a-policy-selectors-and-overrides.md, ado-wiki-a-recommendation-exemption-product-knowledge.md, ado-wiki-a-recommendation-ga-transition.md
  ... and 12 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Databricks
> Sources: ado-wiki

**1. Customer asks why they are still being charged for Databricks resources in Defender for Cloud when Databricks resources are excluded from many or all security recommendations (since they are locked re**

- **Root Cause**: Databricks resources have limitations on agent-based security scenarios due to being locked resources. However, other security scenarios such as network-based detections still provide coverage for Databricks resources.
- **Solution**: Explain to customer: Databricks has limitations on agent-based scenarios (with ongoing discussion between Microsoft and Databricks team to improve security coverage where applicable), but other scenarios like network-based detections still cover Databricks resources, justifying the Defender for Cloud charges.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer reports Databricks resources are excluded from MDC recommendations but questions why they are still being charged for Defender for Cloud protection**

- **Root Cause**: Databricks has a known limitation on agent-based security scenarios; there is an ongoing discussion with the Databricks team to improve security coverage where applicable
- **Solution**: Explain that while agent-based scenarios are limited for Databricks, other scenarios such as network-based detections still cover Databricks resources. The billing is for all applicable coverage types, not just recommendation-based coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Databricks resources excluded from MDC recommendations but customer questions why they are still paying for Defender protection**

- **Root Cause**: Known limitation: Databricks locks resources preventing agent-based MDC scenarios; discussion ongoing with Databricks team to improve coverage
- **Solution**: Explain that Databricks has a limitation on agent-based scenarios (recommendations), but other scenarios like network-based detections still cover Databricks resources, providing security value.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Databricks VMs excluded from many/all MDC recommendations but customer still paying for Defender coverage**

- **Root Cause**: Databricks resources are locked, making agent-based scenarios inapplicable. Known limitation with ongoing discussion between MDC and Databricks teams.
- **Solution**: Other scenarios such as network-based detections still cover Databricks resources. Limitation is known and being worked on with Databricks team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Databricks resources excluded from MDC recommendations but customer still charged for Defender coverage**

- **Root Cause**: Databricks are locked resources with agent-based limitations; network-based detections still apply
- **Solution**: Explain: agent-based scenarios limited for Databricks (ongoing discussion with Databricks team), but network-based detections still provide coverage
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Databricks resources show Defender for Cloud recommendations that cannot be remediated because resources are locked; customer questions why they are being charged for non-actionable recommendations**

- **Root Cause**: Known limitation: agent-based security scenarios are excluded from Databricks locked resources (open discussion with Databricks team)
- **Solution**: Acknowledge limitation on agent-based scenarios for Databricks. Network-based detections still cover Databricks resources. Collaboration with Databricks team is in progress to improve security coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Databricks resources generate Defender for Cloud recommendations that cannot be remediated; customer questions billing for non-actionable recommendations on locked resources**

- **Root Cause**: Databricks resources are locked and cannot have agents installed; agent-based security scenarios have limitations with Databricks
- **Solution**: Network-based detections still cover Databricks resources. Open discussion with Databricks team to improve security coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Databricks resources excluded from MDC recommendations but customer still paying for Defender protection on those resources**

- **Root Cause**: Known limitation: Databricks locks resources preventing agent-based security scenarios. Open discussion with Databricks team to improve coverage.
- **Solution**: Agent-based scenarios do not work on Databricks locked resources, but network-based detections still provide security coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Databricks resources show non-actionable Defender for Cloud recommendations; customer questions charges**

- **Root Cause**: Known limitation: agent-based scenarios excluded from Databricks locked resources.
- **Solution**: Acknowledge agent-based limitation for Databricks. Network-based detections still cover. Collaboration with Databricks team in progress.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Customer asks why they are still paying for Databricks resources in Defender for Cloud when Databricks is excluded from many/all security recommendations due to being a locked resource**

- **Root Cause**: Databricks resources are locked, preventing agent-based security scenarios and recommendation remediation. There is a known limitation on agent-based scenarios with Databricks.
- **Solution**: Databricks is still covered by other detection scenarios such as network-based detections. An ongoing discussion with Databricks team aims to improve security coverage where applicable. Agent-based limitations exist but other detection scenarios still provide value.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**11. Customer questions why paying for Defender for Cloud on Databricks when recommendations excluded or cannot be remediated (locked resource)**

- **Root Cause**: Databricks resources are locked, cannot be remediated by agent-based scenarios. Known limitation.
- **Solution**: Agent-based scenarios limited on Databricks but network-based detections still cover Databricks. MDC team in active discussion with Databricks to improve coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**12. Customer asks why Databricks resources are excluded from many/all MDC recommendations (locked resources cannot be remediated) but Defender charges still apply**

- **Root Cause**: Databricks resources are locked and cannot have agents installed, limiting agent-based security scenarios. However, other protection modes (network-based detections) still cover Databricks resources.
- **Solution**: Explain: agent-based scenarios are limited for Databricks (ongoing discussion with Databricks team to improve coverage), but network-based detections and other non-agent scenarios still provide security coverage, justifying the charges.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**13. Customer questions why they are paying for Databricks resources in Defender for Cloud when recommendations show Databricks as excluded/locked**

- **Root Cause**: Databricks has limitations on agent-based scenarios due to locked resources; ongoing discussion with Databricks team to improve coverage
- **Solution**: Explain: agent-based recommendations are limited for Databricks (locked resources), but other coverage (network-based detections) still applies to Databricks resources, justifying the cost.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**14. Customer questions why Databricks resources are excluded from Defender for Cloud recommendations but still incur charges for Defender protection**

- **Root Cause**: Databricks resources are locked, preventing agent-based security scenarios. Ongoing discussion with Databricks team to improve coverage.
- **Solution**: Explain that agent-based scenarios are limited on Databricks, but other coverage (e.g. network-based detections) still protects Databricks resources.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**15. Databricks resources excluded from MDC recommendations but customer still charged for Defender plans**

- **Root Cause**: Databricks has limitations on agent-based scenarios because resources are locked; only network-based detections cover Databricks
- **Solution**: By design: Databricks VMs cannot install agents so agent-based recommendations are excluded, but network-based detections still provide coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**16. Customer questions why paying for Databricks in Defender for Cloud when recommendations show Databricks resources as excluded/locked**

- **Root Cause**: Databricks has limitations on agent-based scenarios due to locked resources; ongoing discussion with Databricks team to improve coverage
- **Solution**: Agent-based recommendations limited for Databricks (locked resources), but network-based detections still cover Databricks resources, justifying the cost.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 2: Cspm
> Sources: ado-wiki

**1. Customer asks CSS to remediate MDC security recommendations on their behalf**

- **Root Cause**: CSPM features are designed to show misconfigurations; remediation is customer responsibility under shared responsibility model
- **Solution**: Explain that recommendations highlight areas to address for security posture improvement. Each recommendation includes Remediation steps and often a Fix button. Under shared responsibility model, resolving issues is customer/security team responsibility. CSS helps when things are not working as designed, not to perform remediation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer asks CSS to remediate their MDC security recommendations directly**

- **Root Cause**: Misunderstanding of shared responsibility model - CSPM features highlight misconfigurations, remediation is customer responsibility.
- **Solution**: Explain CSPM shows resource misconfigurations. All recommendations include Remediation steps and Fix button. Under shared responsibility model, resolving is customer/resource owner responsibility.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer asks CSS to remediate MDC security recommendations for their resources**

- **Root Cause**: CSPM features designed to highlight misconfigurations. Showing unhealthy resources is by design. Remediation is customer responsibility per shared responsibility model.
- **Solution**: Guide customer to Remediation steps and Fix button in each recommendation. Explain shared responsibility model. CSS helps when features not working as designed, not to perform remediation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer requests CSS to remediate MDC security recommendations on their behalf**

- **Root Cause**: Per shared responsibility model, remediation is customer responsibility
- **Solution**: Explain CSPM shows misconfigurations by design. Recommendations include remediation steps and Fix button. CSS assists when things are not working as designed
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Customer requests support to remediate Defender for Cloud security recommendations or asks CSS to fix unhealthy resources**

- **Root Cause**: CSPM recommendations show resource misconfigurations by design under shared responsibility model
- **Solution**: Remediation is customer responsibility per shared responsibility model. Each recommendation has Remediation steps and often a Fix button. Support assists only when features are not working as designed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Customer requests Microsoft support to remediate Defender for Cloud security recommendations on their behalf**

- **Root Cause**: Misunderstanding of shared responsibility model - CSPM shows misconfigurations, remediation is customer/resource-owner responsibility
- **Solution**: Explain: CSPM highlights misconfigurations by design. All recommendations include Remediation steps and many have a Fix button. Per shared responsibility model, resolving issues is the customer/security team responsibility. Point to recommendation-specific remediation docs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Customer requests Microsoft support to remediate Defender for Cloud security recommendations**

- **Root Cause**: CSPM highlights misconfigurations by design; remediation is customer/resource-owner responsibility per shared responsibility model
- **Solution**: CSPM shows misconfigurations by design. Recommendations include Remediation steps and Fix button. Resolving is customer responsibility.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Customer requests Microsoft support to remediate their MDC security recommendations (asking support to fix unhealthy resources)**

- **Root Cause**: CSPM features show resource misconfigurations by design. Unhealthy status means service is working correctly. Remediation is customer responsibility per shared responsibility model.
- **Solution**: Explain shared responsibility model. Point to remediation steps and Fix button in each recommendation. Customer/resource owner must resolve.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Customer requests Microsoft support to remediate Defender for Cloud security recommendations (unhealthy resources)**

- **Root Cause**: Misunderstanding of shared responsibility model. CSPM features highlight misconfigurations by design, not fix them.
- **Solution**: Explain MDC recommendations show unhealthy resources by design. Each recommendation has Remediation Steps and often a Fix button. Per shared responsibility model, resolving issues is the customer/security team responsibility. Support helps when product does not work as designed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Customer asks Microsoft support to remediate their Defender for Cloud security recommendations**

- **Root Cause**: By design: CSPM recommendations highlight misconfigurations per the shared responsibility model; remediation is the customer organization’s responsibility
- **Solution**: Explain CSPM is working as designed. Point to the recommendation’s built-in Remediation steps and Fix button. Under the shared responsibility model, resolving security issues is the responsibility of the customer’s security professionals or resource owners.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Exemption
> Sources: ado-wiki

**1. User created a recommendation exemption but the resource is not shown as exempted in MDC (control plane recommendation)**

- **Root Cause**: Not all relevant initiative assignments have exemptions applied; a recommendation can result from multiple initiatives (e.g., ASB and CIS), and exemption must be applied to all assignments
- **Solution**: Use ARG query (securityresources where type == microsoft.security/assessments) to check status per initiative; create exemptions on all relevant assignments, especially the default Microsoft Security Benchmark (MSB)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Cannot create exemption due to Exemption exists error, but no matching exemption found in the exemptions list**

- **Root Cause**: A previously created exemption with Apply exemption to the whole assignment option includes all policy definitions within the initiative, regardless of the display name
- **Solution**: Check all exemptions via REST API (Policy Exemptions - List) or ASC Policy > Policy Exemptions; look for exemptions with empty policyDefinitionReferenceIds brackets indicating whole-assignment coverage
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. After creating an exemption, all resources under the subscription moved to the Not applicable tab**

- **Root Cause**: The exemption scope was set to subscription level, causing all resources under that subscription to be exempted
- **Solution**: Verify the exemption scope; if only specific resources should be exempted, delete the subscription-level exemption and recreate with narrower scope targeting specific resources
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Resource shows as exempted in MDC recommendations but regulatory compliance status still shows non-compliant**

- **Root Cause**: Exemption was only applied to the Microsoft Security Baseline (MSB) assignment; regulatory compliance checks assessment status within its own initiative assignment
- **Solution**: Apply exemption to all relevant initiative assignments, not just MSB, to ensure consistent regulatory compliance status across all initiatives
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Authorization error when trying to delete a recommendation exemption created at management group scope; error: Assignment with id .../standardAssignments/{id} does not exist**

- **Root Cause**: Windows Azure Security Resource Provider does not have Reader role assigned at the management group level; without this, Defender for Cloud cannot evaluate or manage the exemption
- **Solution**: Assign the Reader role to the Windows Azure Security Resource Provider at the management group level where the exemption was created
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. After exempting MCSB initiative for a control plane recommendation, the assessment still shows Unhealthy instead of Not Applicable**

- **Root Cause**: For control plane recommendations, MDC derives assessment entirely from Azure Policy compliance. Exemptions must be applied to ALL initiatives contributing to the assessment, not just MCSB. Any non-exempted initiative remaining non-compliant keeps aggregated assessment Unhealthy.
- **Solution**: Apply exemptions to every initiative (MCSB, ISO, custom) involved in the assessment. Verify with ARG: securityresources | where type == "microsoft.security/assessments" | extend initiatives = properties.statusPerInitiative | mv-expand initiatives | project initiativeName, statusInMdc = initiatives.assessmentStatus.code
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. ISO per-policy status shows Unhealthy but policy compliance shows Compliant after applying MCSB exemption for a data plane recommendation**

- **Root Cause**: For data plane recommendations, once all MCSB assignments are exempted, the aggregated MDC assessment becomes Not Applicable. ISO policy compliance is derived from the aggregated assessment result (Not Applicable -> Compliant), not from per-policy status.
- **Solution**: This is expected behavior. The aggregated assessment is the authoritative source of truth. Validate using ARG policyresources query to confirm policy compliance reflects Compliant.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Management Group scope is grayed out when trying to create a recommendation exemption**

- **Root Cause**: The relevant policy is not part of an initiative assigned at the same Management Group scope level or higher
- **Solution**: Ensure the policy is included in an initiative that is assigned at the same MG scope level or a higher scope
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**9. Cannot see the context menu inside a recommendation to exempt a resource**

- **Root Cause**: The recommendation does not support exemptions; exemption requires (1) the recommendation has a policy definition ID, and (2) it uses the generic blade experience
- **Solution**: Verify the recommendation has a policy definition ID and uses the generic blade; if not, exemption is not available for this recommendation type
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 4: Governance
> Sources: ado-wiki

**1. No Active User shown for a resource in MDC recommendation/assignment blade, or client claims a user performed operations but they do not appear**

- **Root Cause**: Data delay (detection takes up to 48 hours), user may not be in Top 3 due to operation recency/type/role scoring, or potential ingestion/scoring error
- **Solution**: Ask when the operation was performed and wait up to 48 hours. Explain scoring logic (Time elapsed, Operation type Write>Read, User role). If nothing appears after 48 hours, escalate to dev team
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. Wrong Active User listed for a resource in MDC - client confused about the displayed user**

- **Root Cause**: Fallback logic: when no resource-level activity is detected, system falls back to resource group or subscription level. Listed user may have older/background activity (e.g., deployment automation)
- **Solution**: Explain fallback and scoring logic: Resource then Resource Group then Subscription. Validate using raw activity logs. If unexplained even after investigation, escalate to development team
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. MDC Governance rule with complex condition (multiple conditions) cannot be edited via UI**

- **Root Cause**: Rules created via API with complex conditions (more than one condition) are not supported for UI editing - this is by design
- **Solution**: Edit the rule via REST API instead of the portal UI. API docs: https://learn.microsoft.com/en-us/rest/api/defenderforcloud/governance-rules/
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. Unspecified owner shown in MDC Governance owners list**

- **Root Cause**: The tag configured to represent resource ownership is missing on the resource. When the tag is not found, the governance assignment is created with only a due date but no owner
- **Solution**: Verify the expected ownership tag exists on the resource. Query governance assignments in Kusto to check the rule and assignment mapping. Add the required tag to the resource
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**5. MDC Governance: owner/manager wants to stop receiving email notifications about assigned recommendations**

- **Root Cause**: Email notifications are configured per governance rule and apply to all assignments under that rule
- **Solution**: Edit ALL governance rules in the subscription to uncheck the email notification checkbox for owners. Apply the change on already existing governance assignments. Use PowerShell script DeleteGovernanceAssignments.ps1 or governance assignment deletion workbook for bulk operations
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**6. Cannot edit governance rule with complex conditions in MDC portal UI**

- **Root Cause**: Rules created via API with more than one condition cannot be edited through the UI
- **Solution**: Use Governance Rules REST API to edit: https://learn.microsoft.com/en-us/rest/api/defenderforcloud/governance-rules
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**7. Unspecified owner shown in MDC governance assignments list for resources**

- **Root Cause**: Ownership tag designated for the resource is missing on the resource; governanceAssignment created with only due date but no owner
- **Solution**: Add the required ownership tag to the affected Azure resource; query Kusto governance assignments to verify tag configuration and rule mapping
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**8. No recommendations visible when Show my items only filter is applied in MDC governance**

- **Root Cause**: Logged-in user email address does not match the email address set as owner in governance assignments
- **Solution**: Verify email address matches between logged-in user and recommendation owner; governance relies on exact email address matching
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 5: Secure Score
> Sources: ado-wiki

**1. Secure Score stops being published or calculated for a subscription after a period of inactivity; recommendations stop updating**

- **Root Cause**: By design - MDC stops processing and publishing recommendations after approximately 30 days of subscription inactivity (ref ICM 336791730)
- **Solution**: Use Kusto query on SubscriptionActivityQueryOE (romelogs cluster) to check active/inactive history. Re-activate by making an ARM call or logging into the subscription.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. A Secure Score control shows 0 score or 0 healthy resources even though some individual recommendations within that control show 0 unhealthy resources**

- **Root Cause**: By design - Secure Score counts resources not assessments. A resource is only healthy for a control if it complies with ALL recommendations in the control. Being healthy in one recommendation does not contribute positively if the same resource is unhealthy in another recommendation in the same control.
- **Solution**: Explain the correct model to customer. Identify which recommendation(s) within the control still have the resource marked as unhealthy and remediate those to increase control score.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Secure Score workbook shows no data, partial data, or incorrect data despite Secure Score being calculated in Defender for Cloud**

- **Root Cause**: Continuous export not configured for secure score data to Log Analytics Workspace, or data not flowing to the configured workspace
- **Solution**: 1) Configure continuous export in Environment Settings > Continuous Export for secure score. 2) Check LAW data with SecureScore/SecureScoreControls queries. 3) No data in LAW: reroute to Continuous Export team. 4) Data correct in LAW but wrong in workbook: escalate to Secure Score team with exact row examples.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Cloud Secure Score in Defender for Cloud initiative page shows N/A**

- **Root Cause**: Score 0 is being reported for the tenant, potentially due to a wider issue in the DataStore pipeline affecting multiple tenants.
- **Solution**: Check Risk Geneva dashboard -> Secure score by tenant widget filtered by tenant ID to see when issue started and if score shows 0. Check if other tenants also report score 0 - if yes, this is a wider issue to escalate to data store engineering team (ICM: Defender for CSPM/Defenders - CRIs).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Customer reports drastic/unexpected change in Cloud Secure Score in Defender for Cloud**

- **Root Cause**: Score is based on risk recommendations distribution and critical assets. Changes result from: new scopes onboarded/deleted, new recommendation becoming GA and impacting many resources, or significant changes in customer environment.
- **Solution**: Use Risk dashboard to identify exact time of score change. Use Prod Investigation dashboard (requires SAW/AME/JIT) at mdcprd.centralus.kusto.windows.net to check score over time, by category/workload, assessments and assets count. Investigate recent environment changes (scope onboarding/deletion, new GA recommendations).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Customer Secure Score is high but there are many High/Critical severity recommendations showing in Defender for Cloud**

- **Root Cause**: Preview recommendations are not included in Secure Score calculation. If many High/Critical recommendations are in preview status, they do not affect the score.
- **Solution**: Verify how many recommendations are actually included in score calculation using the Prod Investigation dashboard. Explain to customer that preview recommendations do not count towards Secure Score. Check score calculation explanation in the Cloud Initiative page UI.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Secure Score is N/A or not calculated for a subscription under Microsoft AME tenant (33e01921-4d64-4f8c-a055-5bdaffd5e33d)**

- **Root Cause**: By design - Secure Score is not calculated on subscriptions under the AME tenant unless explicitly added to an allow list
- **Solution**: Request Secure Score team to add the specific subscription to the allow list for Secure Score calculation.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 6: Identity Protection
> Sources: ado-wiki

**1. External (guest) user with multiple RBAC roles (Owner+Contributor+Reader) only appears as unhealthy in the highest-level external accounts recommendation, not in lower-level ones**

- **Root Cause**: MDC external accounts recommendations follow RBAC hierarchy - a user granted Owner role is only reported at the Owner level, even if also assigned Contributor or Reader roles on the same subscription
- **Solution**: Review external user RBAC assignments; if same user has multiple roles, only highest violation is shown by design. Use KQL on romelogs (TraceEvent, tagId IdentityRemoveExternalAccountsWithPermissions) to trace assessment generation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer sees External accounts with owner permissions recommendation but external user does not have built-in Owner role assigned**

- **Root Cause**: Custom roles with unlimited permissions (Actions=*, NotActions empty) are treated as Owner-equivalent by the assessment
- **Solution**: Check custom roles: Connect-AzureAd; Get-AzRoleDefinition | Where-Object {($_.Actions.count -eq 1) -and ($_.Actions[0] -eq '*') -and ($_.NotActions.count -eq 0)}
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Subscription intermittently shows too many owners / owner count fluctuates - assessment turns unhealthy at certain times of day**

- **Root Cause**: Customer uses PIM (Privileged Identity Management); ARM GetRoleAssignments API only returns active PIM assignments (not eligible ones), so when a PIM role is activated the user is counted as owner
- **Solution**: Use KQL on romelogs to check IsOwner status over time: cluster(romelogs.kusto.windows.net).database(Prod).TraceEvent | where message has subscriptionId | where message has Finished checking owner permissions | where message has userObjectId | project env_time, IsOwner = message has True
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Policy size too large error when trying to exempt sub-assessments in MDC identity recommendations - exemptions fail**

- **Root Cause**: Azure sub-assessment exemptions are stored as metadata properties on the policy assignment; unoptimized UI code creates separate metadata entries per exempted user, causing the assignment to exceed size limits
- **Solution**: Consolidate exemptions via ARM API: GET policy assignment, merge user IDs into single in array per filter rule, PUT back. Or use PowerShell script OptimizeAscDefaultPolicyExemption.ps1. Warning: optimized format may cause UI to misread exemptions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. MDC recommendation about subscription having more or less than X owners showing as unhealthy**

- **Root Cause**: Number of users with Owner role assignment on subscription does not meet the recommended threshold
- **Solution**: Run Kusto query on romelogs TraceEvent with rootOperationId (from General section) filtering tagId=IdentityUtils to find which users were identified as owners. Verify their permissions and adjust RBAC assignments accordingly
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**6. Users still appear as not covered by MFA in MDC recommendation despite Conditional Access (CA) policy enforcing MFA (Note: MFA recommendations deprecated Nov 2024)**

- **Root Cause**: CA policy misconfiguration: missing Azure Portal App ID (797f4846-ba00-4fd7-ba43-dac1f8f63013), excluded users/groups include target users, or unsupported CA features used (directory roles, authentication strengths, external user enforcement)
- **Solution**: Verify CA policy: 1) Includes Azure Portal app ID or All apps, 2) No excluded users/groups containing target users, 3) Uses supported MFA enforcement (not directory roles or auth strengths). Use Kusto: cluster(RomeLogs).database(Prod).UsersWithNoMFAOnSubscriptionByPermissionLevel(subId) to check non-compliant accounts
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 7: Servicenow
> Sources: ado-wiki

**1. Error 'Invalid instance URL' when creating MDC ServiceNow integration**

- **Root Cause**: Incorrect or inaccessible ServiceNow instance URL provided during integration setup
- **Solution**: Verify the ServiceNow instance URL is correct and accessible. Ensure it follows the expected format.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. All ServiceNow governance assignments disappear after removing a ServiceNow integration in MDC**

- **Root Cause**: By design - deleting an integration removes all governance assignments linked to it
- **Solution**: This is expected behavior. Before deleting a ServiceNow integration, note all associated governance assignments will be removed. Re-create assignments after setting up a new integration if needed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. ServiceNow dropdown is grayed out when creating MDC governance assignment**

- **Root Cause**: No ServiceNow integration configured on the selected resource scope
- **Solution**: Verify a ServiceNow integration exists on the selected scope by navigating to the Integrations view or querying ARG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. User selection keeps loading when creating MDC ServiceNow governance assignment**

- **Root Cause**: Integration connection issue between MDC and ServiceNow instance
- **Solution**: Use the ServiceNow Integration Dashboard in Kusto. Navigate to 'Integrations ARM' panel -> 'GetIntegrationUsers' widget, search by environment ID or integration ID. Check 'result description' for ServiceNow error details.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. MDC ServiceNow governance assignment creation fails**

- **Root Cause**: Various ServiceNow-side or MDC integration issues causing ticket creation failure
- **Solution**: Use the ServiceNow Integration Dashboard in Kusto, search for 'failed to create ticket in 3rd party system' to identify the specific failure reason.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Baseline
> Sources: ado-wiki, onenote

**1. MDC baseline recommendation 'Machines should be configured securely' (Assessment Key: c476dc48-8110-4139-91af-c8d940896b98) keeps switching status between 'Unhealthy' and 'Not Applicable'**

- **Root Cause**: Two conflicting agents (MMA and AMA) are running on the same VM, reporting two conflicting compliance results. SecurityBaseline reports come from only one SourceComputerId but Heartbeat entries show two different SourceComputerIds on the same machine.
- **Solution**: Remove the preview AMA agent from the VM. Verify by checking the Log Analytics workspace: if SecurityBaseline reports show only 1 SourceComputerId but Heartbeat shows 2 different SourceComputerIds for the same machine, this confirms the dual-agent race condition.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. 'Failed to fetch data' error when opening MDC 'Machines should be configured securely' recommendation. The recommendation shows no data.**

- **Root Cause**: The Baselines recommendation depends on a legacy security Tasks API (EntryPointGetTasks). When this API is degraded or failing, it causes the 'Failed to fetch data' error message.
- **Solution**: Run Kusto query to verify API failures: cluster('romelogs.kusto.windows.net').database('Prod').FilterableGetBLEntryPointOE | where operationName == 'EntryPointGetTasks' | where SubscriptionId contains '<subscription_id>' | project env_time, SubscriptionId, resultType, resultDescription, resultSignature. If failures confirmed, escalate to MDC backend team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. MDC baseline recommendation 'Zeroconf networking should be disabled' flagged on Linux VM**

- **Root Cause**: Zeroconf/APIPA networking is enabled by default on some Linux distributions — /etc/sysconfig/network does not contain NOZEROCONF=yes
- **Solution**: Run: echo 'NOZEROCONF=yes' >> /etc/sysconfig/network && /etc/init.d/network restart. Tracked in ADO work item 3280032.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

**4. Unable to remediate a failing Windows or Linux security baseline rule in MDC security configuration recommendation**

- **Root Cause**: Baseline rule Expected Value does not match the Actual Value on the VM. Remediation requires matching the specific rule expected configuration.
- **Solution**: 1) Look up the failing rule in docs: Windows - azure/governance/policy/samples/guest-configuration-baseline-windows, Linux - azure/governance/policy/samples/guest-configuration-baseline-linux. Ensure Expected Value equals Actual Value. 2) If still failing, escalate to ASM team via IcM template T1I121 and email AzSecBaselineSupport@microsoft.com with: IcM Id, OS type/version, Server Type, LA query: SecurityBaseline | where BaselineRuleId =~ 'ruleId' | project TimeGenerated, BaselineType, Resource, ActualResult, ExpectedResult, AnalyzeResult.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**5. ASC baseline recommendation 'Zeroconf networking should be disabled' - Linux VM flagged for zeroconf networking**

- **Root Cause**: Zeroconf (APIPA) networking is enabled by default on some Linux distributions, flagged by ASC baseline scanner as security risk
- **Solution**: Run: echo 'NOZEROCONF=yes' >> /etc/sysconfig/network && /etc/init.d/network restart
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 9: Ciem
> Sources: ado-wiki

**1. Azure CIEM bundle enabled successfully but CIEM recommendations not visible / not present in ARG**

- **Root Cause**: CIEM assessment results not propagated to ARG; possible onboarding or pipeline issue
- **Solution**: Run ARG query to check CIEM assessments: `securityresources | extend CiemAssessmentsKeys = dynamic(['d19d5a12-41e9-44e2-b7f5-ee2160f62d62','8b0bd683-bcfe-4ab1-96b9-f15a60eaa89d']) | where type == 'microsoft.security/assessments' | where CiemAssessmentsKeys contains name | extend cloud=properties.resourceDetails.Source | where cloud == 'Azure' | project name, id, subscriptionId, cloud, displayName, properties`. Regardless of results → create CRI with: project ID, subscription ID, query result, and validation steps taken.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. GCP CIEM security connector created successfully but no recommendations appear after 24+ hours**

- **Root Cause**: GCP CSPM security standard not assigned to the security connector
- **Solution**: MDC → Environment Settings → click security connector (edit) → left menu 'Security Policies' → verify 'Google Cloud Platform (GCP) CSPM' is assigned. If not assigned → assign it via action menu.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. GCP CIEM recommendations do not include all roles / IAM inheritance permissions missing**

- **Root Cause**: Cloud Asset API not enabled in the GCP project — required to get effective permissions with inheritance
- **Solution**: Enable Cloud Asset API in GCP: 1) Sign in to Google Cloud Console. 2) Navigate to https://console.cloud.google.com/apis/library. 3) Search 'Cloud Asset API'. 4) Click Cloud Asset API entry. 5) Click ENABLE.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. MDC recommendation 'Permissions of inactive identities in your Azure subscriptions should be revoked' shows false positives - active service principals or managed identities incorrectly flagged as ina**

- **Root Cause**: Current recommendation relies only on EventServiceEntries ARM log table. Activities via HttpIncomingRequests (Azure Storage, App Services, HTTP endpoints) are not tracked, causing legitimate active identities to appear inactive
- **Solution**: Microsoft is improving detection logic to include HttpIncomingRequests (targeted Dec 2025-Jan 2026). Interim: exempt impacted identities from the recommendation to prevent secure score impact until fix is deployed
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Regulatory Compliance
> Sources: ado-wiki, mslearn

**1. Compliance Over Time (Preview) workbook in Defender for Cloud shows no data or is not available, even after enabling Continuous Export with Snapshot updates**

- **Root Cause**: Known bug: Continuous Export Snapshots do not run as scheduled (PG aware, no ETA for fix as of 2022). Also by design: workbook requires 1 week wait after initial Continuous Export + Snapshot enablement
- **Solution**: 1) PG can trigger a manual snapshot update if urgent. 2) Check workspace: SecurityRegulatoryCompliance | where IsSnapshot == 'true' - no results means no snapshot data. 3) Ensure Continuous Export with Snapshot Updates enabled in Environment Settings.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Regulatory compliance controls appear grayed out in Defender for Cloud dashboard**

- **Root Cause**: Controls without automated Defender for Cloud assessments show as grayed out; includes procedure/process-related controls, controls without automated policies yet, and platform-responsibility controls
- **Solution**: Grayed-out controls are by design for non-automatable assessments; manually assess compliance for process-related controls; standard wont show if subscription has no relevant resources
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**3. Regulatory compliance dashboard not loading or standards not showing in Defender for Cloud**

- **Root Cause**: Defender for Cloud not enabled at subscription level; or subscription has no relevant resources for assigned standard; browser cache issues
- **Solution**: Enable Defender for Cloud at subscription level; clear browser cache; try different browser or network; ensure at least one Defender plan (except Servers P1) is enabled for non-default standards; verify Reader access to policy compliance data
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**4. Compliance recommendation changes not reflected in regulatory compliance dashboard after remediation**

- **Root Cause**: Compliance assessments run approximately every 12 hours; changes not visible until next assessment cycle completes
- **Solution**: Wait 12 hours after taking remediation action for changes to reflect in compliance data; no manual way to force immediate reassessment
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 11: Byol
> Sources: ado-wiki

**1. Customer enabled both BYOL VA and Agentless scanning on the same subscription. No vulnerability assessment results from Agentless scanning are appearing.**

- **Root Cause**: BYOL and Agentless VA cannot be used side by side. When BYOL is configured first and Agentless is enabled later, Agentless VA will not produce results.
- **Solution**: Customer must choose one VA method. To use Agentless scanning, remove the BYOL solution first. To use BYOL, do not enable Agentless scanning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer wants to use Azure Policy to auto-deploy BYOL VA solution across subscriptions, but deployIfNotExists policy does not work for BYOL VA.**

- **Root Cause**: By design, BYOL VA security solution is not an ARM extension resource (unlike built-in VA). Azure Policy deployIfNotExists cannot detect if a VM is linked to a security solution, and the provisioning API requires creating a solution first then linking VMs (two-step), which Policy cannot orchestrate.
- **Solution**: Explain that Azure Policy auto-deploy is only supported for built-in VA (MDVM). For BYOL VA, use MDC auto-provisioning feature or manual API deployment. Consider migrating to built-in VA (MDVM) which supports Policy deployment.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. VA agent installation failed on a VM, but the "Add a vulnerability assessment solution" recommendation no longer appears for that VM.**

- **Root Cause**: The VA extension installation succeeded (so the VM is no longer discovered as needing VA), but the state machine failed on timeout, so the VM was not linked to any solution. The VM is in a limbo state: has the extension but is not a protected resource.
- **Solution**: Navigate to the VM in Azure portal > Extensions > find the Qualys/Rapid7 agent > Uninstall. This will cause the VM to be rediscovered and the recommendation will reappear, allowing a fresh installation attempt.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. VA recommendations of type "Remediate vulnerabilities" do not appear in Defender for Cloud after linking a VM with VA agent, even after waiting for data.**

- **Root Cause**: Findings from VA vendor have a delay up to 24 hours before appearing in MDC. Also: (1) VA vendor service may be down, (2) VA agent may not have VM scanning enabled, (3) License exceeded max VMs so agent does not send scans, (4) VA Policy turned off for subscription/ResourceGroup.
- **Solution**: Wait up to 24 hours after initial VA setup. Check Qualys status page (status.qualys.com). Verify VA policy is on for the subscription. Use Kusto query with VulnerabilityAssessmentRecommendationHandlerTracer to check if findings were discovered. If no findings, escalate to VA vendor.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 12: Mepm
> Sources: ado-wiki

**1. AWS security connector and CloudFormation deployed successfully but no Permissions Management recommendations appear after 24+ hours**

- **Root Cause**: Multiple possible causes: 1) MEPM first-party app (b46c3ac5-9da6-418f-a849-0a07a10b3c6c) not provisioned in customer tenant, 2) Third-party app mciem-aws-oidc-connector missing or misconfigured, 3) AWS IAM roles/identity provider deleted, 4) AWS CSPM security standard not assigned to connector
- **Solution**: Step-by-step: 1) Check MEPM first-party app ID b46c3ac5 in AAD — if missing, open CRI with tenant ID. 2) Check mciem-aws-oidc-connector app exists and Expose an API is configured correctly. 3) Verify AWS roles (DefenderForCloud-OidcCiem, DefenderForCloud-Ciem) and identity provider exist — if missing, update Stack/StackSet with new CFT. 4) Check AWS CSPM security standard assigned under Environment settings → Security policies. 5) Query ARG for assessment results. If all checks pass, open CRI with account ID, subscription ID, and validation results.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. MEPM extension enabled in Azure but no recommendations appear after 24+ hours - MEPM first-party app not provisioned in tenant**

- **Root Cause**: MEPM first-party app (App ID: b46c3ac5-9da6-418f-a849-0a07a10b3c6c) not provisioned in customer tenant
- **Solution**: Ask customer to search for app ID b46c3ac5-9da6-418f-a849-0a07a10b3c6c in Azure AD. If app does not exist, open CRI with tenant ID
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. MEPM extension enabled in Azure but no recommendations - Cloud Infrastructure Entitlement Management reader role missing at subscription**

- **Root Cause**: MEPM first-party app exists but was not assigned (or was removed) Reader role at the subscription level
- **Solution**: Ask customer to verify Cloud Infrastructure Entitlement Management has Reader role at subscription level. If not assigned, grant Reader role
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. MEPM no recommendations in Azure - Azure CSPM security standard not assigned to subscription**

- **Root Cause**: Azure CSPM security standard is not assigned to the subscription in MDC Security policies
- **Solution**: Navigate to MDC > Environment Settings > subscription > Security policies and assign Azure CSPM. Verify with ARG query filtering CiemAssessmentsKeys
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 13: Continuous Export
> Sources: ado-wiki

**1. Not all recommendations visible in MDC portal appear in Event Hub or Log Analytics Workspace configured for Continuous Export**

- **Root Cause**: Continuous Export operates in live streaming mode - a recommendation is exported only when its state changes (e.g., healthy → unhealthy). There is no current-state snapshot export. Pre-existing unhealthy resources at the time export was configured will not appear until their next state change. Secondary causes: rule set filtering certain severities, URI/Key invalidated, or permission loss.
- **Solution**: Explain that live streaming only exports state changes - resources unhealthy before export was enabled won't appear until next state change. Verify rule set configuration. Validate URI/Key are current. For current-state snapshot, use ARG queries to retrieve all current recommendations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Security Attack Paths not available as ExportedDataType in built-in policy 'Deploy export to Event Hub for MDC data' (cdfcce10-4578-4ecd-9703-530938e4abcb)**

- **Root Cause**: Attack Paths value supported in REST API 2023-12-01-preview but not yet in built-in Azure Policy. Expected FY26.
- **Solution**: Workaround: Duplicate built-in policy, modify custom policy to use API version 2023-12-01-preview and add Attack Paths to ExportedDataType. Ref: ICM-595407743.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Recommendations export from Azure Resource Graph (ARG) or Defender for Cloud portal exceeds the 20MB cap limit; unable to download full recommendations list as CSV**

- **Root Cause**: By design since August 2021, CSV exports of recommendation data are limited to 20MB to prevent service overload
- **Solution**: Filter recommendations by subscription using Azure Portal Advanced Filters; use 'All Recommendations' tab instead of 'Secure score recommendations' tab; apply severity/status filters (e.g., High severity, Active status). For large subscriptions, query data from Resource Graph Explorer with appropriate filters on subscriptionId and resource group.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Inventory
> Sources: ado-wiki

**1. Unhealthy resource count shown in MDC Recommendations page differs from the count shown in the Inventory page for the same subscription**

- **Root Cause**: The Recommendations blade does not count 'Preview' recommendations when calculating unhealthy resource counts, while the Inventory blade counts all resources including those with preview recommendation findings.
- **Solution**: Expected behavior by design. Inform customer that the Recommendations page excludes Preview recommendations from counts. To see all resources including those with preview findings, direct customer to use the Inventory blade.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. VM shows as 'not monitored' in MDC Asset Inventory despite customer believing monitoring is active**

- **Root Cause**: Agent monitoring recommendation not resolved for the VM
- **Solution**: Navigate to the Recommendations blade and resolve the 'Agent monitoring should be installed' recommendation for the affected VM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**3. Customer cannot find a specific resource in MDC Asset Inventory list**

- **Root Cause**: Asset Inventory only shows resources connected to MDC (resources with security recommendations). Not all Azure resources appear in Inventory.
- **Solution**: Use Azure 'All Resources' view to see all resources. To verify MDC security data, run ARG query: securityresources | where id has '{ResourceName}'. If security data exists but resource is not in Inventory, escalate to CSS.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 15: Remediation
> Sources: ado-wiki

**1. Customer requests Microsoft support to remediate their MDC security recommendations or fix unhealthy resource assessments**

- **Solution**: Explain CSPM is designed to highlight misconfigurations; unhealthy resources mean the service is working as intended. All recommendations contain Remediation steps and many have a Fix button. Per the shared responsibility model, resolving security issues is the customer or resource owner responsibility. Support assists when things are not working as designed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer requests CSS to remediate their MDC security recommendations or fix unhealthy resources**

- **Root Cause**: By design per shared responsibility model: CSPM features highlight misconfigurations, remediation is the responsibility of customer security professionals or resource/workload owners.
- **Solution**: Guide customer to Remediation steps in each recommendation, the Fix button for quick resolution, and relevant LEARN/DOCS resources. CSS helps when things are not working as designed, not to perform remediation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer asks Microsoft CSS to remediate Defender for Cloud security recommendations or fix unhealthy resource status**

- **Root Cause**: CSPM features highlight misconfigurations by design; remediation is customer responsibility under Azure shared responsibility model
- **Solution**: Guide customer to use built-in Remediation steps and Fix button in each recommendation. Remediation responsibility lies with customer security professionals or resource/workload owners.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 16: Vm Extensions
> Sources: ado-wiki

**1. VM extensions marked as unhealthy in MDC recommendation "Only approved VM extensions should be installed" - extension name shown differs from its type**

- **Root Cause**: Policy evaluates extension type but MDC UI shows extension name, causing confusion. The extension type was not added to the approved list in policy parameters
- **Solution**: In Azure Policy, find non-compliance reason to get extension type (Current value). Edit ASC Default initiative parameters, add the extension type to approved list. Changes reflect within 30 minutes. Use VM extensions API to find correct type if needed
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. VM extensions compliant in Azure Policy but still unhealthy in MDC for "Only approved VM extensions should be installed"**

- **Root Cause**: Customer applied the fix to the wrong policy initiative. MDC reads status from the CIS initiative, but customer edited a different initiative
- **Solution**: Find "Only approved VM extensions should be installed" policy inside the CIS initiative specifically and add the extension type there. Use Kusto query on romelogs to compare MDC status vs policy status columns
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. VM extensions still unhealthy after adding extension type to CIS initiative for "Only approved VM extensions should be installed"**

- **Root Cause**: MDC is looking at a different initiative than expected for compliance state
- **Solution**: Run POST policyStates API on the extension resource to find policyDefinitionGroupNames value (e.g. cis_azure_1.1.0_7.4). Apply the extension type fix to that specific initiative
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 17: Security Policy
> Sources: ado-wiki

**1. MDC recommendation "Diagnostic logs in Key Vault should be enabled" shows non-compliant status for Key Vault resources**

- **Root Cause**: Key Vault diagnostic log retention days do not match the value specified in the ASC Default policy assignment parameter (default typically 365 days), or diagnostic logs are not enabled at all.
- **Solution**: Navigate to Azure Policy > Definitions > ASC Default policy assignment > search for Key Vault policy > check Parameters to see required retention days. Click Definition to view JSON policy definition for exact non-compliance reasons. Verify customer Key Vault diagnostic settings have retention days matching the policy requirement (default 365). If mismatch, update Key Vault diagnostic settings accordingly.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. DeployIfNotExists (DINE) policy remediation task uses unexpected account context; newly created resources remediated with creator permissions instead of managed identity**

- **Root Cause**: Undocumented Azure Policy behavior: for newly created resources, DINE auto-remediation uses the account context of the resource creator, NOT the managed identity created with the policy. For existing non-compliant resources remediated manually via remediation task, the managed identity (with roles defined in policy definition) is used. Public documentation does not clarify this distinction.
- **Solution**: Explain the two DINE remediation contexts: (1) Manual remediation task for existing non-compliant resources uses the managed identity with roles defined in the policy definition. (2) Auto-remediation triggered by new resource creation (after configurable delay + success status code) uses the account context of the resource creator. Ensure the resource creator has sufficient permissions for the DINE deployment template. If customer reports DINE remediation failures on new resources, check if the creating account has necessary roles.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Deprecated parameters (marked [Deprecated]) appear in ASC/MDC built-in initiative policy assignment and cannot be removed by customer**

- **Root Cause**: Removing parameters from policy definitions is a breaking change in Azure Policy - all existing assignments must be removed first before the parameter can be deleted from the definition. Policy and MDC teams are working on a versioning solution to address this limitation.
- **Solution**: Explain to customer that [Deprecated] parameters in the ASC Default initiative assignment are a known Azure Policy limitation. These deprecated parameters can be safely ignored and do not affect policy evaluation. They cannot be removed without breaking all existing assignments. Azure Policy versioning feature is planned to resolve this. Customer can customize by duplicating the initiative if needed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 18: Risk Level
> Sources: ado-wiki

**1. Defender for Cloud Recommendation Risk Level not being evaluated or not appearing for resources. Risk level may change unexpectedly between assessments.**

- **Root Cause**: Risk Level requires Defender Cloud Security Posture Management (CSPM) plan enabled. Risk level is dynamically calculated from recommendation base score (mapped to security category) plus contextual information (resource importance, privileges, exposure). Changes occur due to: contextual information changes (new permissions added/removed), assessment updates (new vulnerability detected), or periodic system recalculation (every few hours).
- **Solution**: Verify CSPM is enabled: use ADX dashboard (Infrastructure Solutions - Common Queries/MDC-Billing/3. latest Pricing Tier) or Kusto query on cluster(Rometelemetrydata).database(RomeTelemetryProd).PricingTierByBundleAndSubscriptionId filtered by SubscriptionId. Review risk evaluation flow via Investigation Dashboard (ADX dashboard 717634a5). Docs: https://learn.microsoft.com/en-us/azure/defender-for-cloud/implement-security-recommendations#group-recommendations-by-risk-level
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Security recommendations show N/A risk level in Defender for Cloud**

- **Root Cause**: Cloud Security Posture Management (CSPM) bundle is not enabled on the connector (AWS/GCP) or Azure subscription
- **Solution**: Enable Defender CSPM bundle on the relevant connector or subscription; risk levels will populate within ~24 hours
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. Recommendations still show N/A risk level despite CSPM being recently enabled**

- **Root Cause**: Risk calculation job has not yet run on the tenant data after CSPM enablement
- **Solution**: Check the risk calculation job dashboard (filter by subscription); wait for the job to complete at least once in the last 24 hours
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — ADO Wiki]`

### Phase 19: Recommendation
> Sources: onenote

**1. Need to export all MDC security recommendations for a subscription using ARG query**

- **Solution**: Use Azure Resource Graph Explorer: securityresources | where type == 'microsoft.security/assessments'. To find a specific recommendation's assessment key, check the recommendation URL or properties in the portal.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

**2. Customer needs to export or query all security recommendations from Defender for Cloud**

- **Root Cause**: Recommendations can be queried via Azure Resource Graph using securityresources type
- **Solution**: Use ARG query: securityresources | where type == 'microsoft.security/assessments'. Get assessment key from the recommendation URL or API. Use Resource Graph Explorer in Azure portal for ad-hoc queries.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**3. Some ASC recommendations are not managed by Azure Policy and use internal logic (Core/R3) instead**

- **Root Cause**: Design limitation - VMSS, SQL VA, IoT, nested (Qualys), and legacy recommendations have no Azure Policy backing. Feature request tracked at msazure.visualstudio.com/One/_backlogs backlog item 4554685.
- **Solution**: Inform customer that these recommendations cannot be exempted/enforced via Azure Policy. Workaround: use workflow automation or manual remediation. Affected categories: VMSS updates/monitoring/EP, SQL classification/VA, IoT security, container image scanning (Qualys), legacy EP/monitoring agent recommendations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.0/10 — OneNote]`

### Phase 20: Azure Policy
> Sources: ado-wiki, onenote

**1. Cannot turn off Microsoft Defender for Cloud Plans — error 'You do not have permission to modify Microsoft Defender plan' (403) despite having Owner/Security Admin role on the subscription**

- **Root Cause**: Azure Policy 'Security Center standard pricing tier should be selected' blocks disabling Defender Plans. Turning off a plan would downgrade the pricing tier, violating the policy assigned at management group level.
- **Solution**: Add a policy exemption for the 'Security Center standard pricing tier should be selected' policy definition within the relevant policy initiative (e.g., management group policy). After exemption, Defender Plans can be disabled normally.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. Azure Policy shows NotFound non-compliant status for MDC recommendations (e.g., container security, SQL VA). Machines without Docker or SQL show as non-compliant in Policy compliance results.**

- **Root Cause**: By design: the policy checks for specific assessment types. If a resource of the target type (VM, Arc machine) does not have Docker/SQL installed, the assessment does not exist, causing Policy to return NotFound as non-compliant. The existenceCondition only matches NotApplicable or Healthy status codes.
- **Solution**: Explain to customer this is by-design behavior. NotFound means the assessment is not applicable (no Docker/SQL installed). Affected assessment IDs include: 82e20e14, dbd0cb49, f97aa83c, c0f5316d, 1195afff, and several IoT device assessments.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 21: Devops Security
> Sources: ado-wiki

**1. Container vulnerability recommendations missing in Azure Portal or Defender Portal after DfC CLI scan**

- **Root Cause**: Container was not pushed to the container registry after scanning. Recommendations are only published for pushed containers to reduce noise
- **Solution**: Verify the scan produced a SARIF file. Push the container to the container registry - only pushed containers generate recommendations in MDC
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. DevOps recommendations not visible in MDC after migration to new DevOps sources**

- **Root Cause**: DevOps recommendations migrated to new sources (AzureDevOps, GitHub, GitLab) and moved under All recommendations in Recommendations blade
- **Solution**: Navigate to Recommendations blade > All recommendations and filter by DevOps sources; findings still surface on DevOps Security blade
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 22: Active User
> Sources: ado-wiki

**1. No Active User shown for resource in MDC recommendations or governance assignment blade**

- **Root Cause**: Data delay (detection/display takes up to 48 hours); or user not in top 3 ranking based on operation recency/type/role; or ingestion/scoring error
- **Solution**: Wait up to 48 hours after operation; explain scoring logic: ranks by time elapsed, operation type (Write > Read), user role; fallback from resource > resource group > subscription scope; escalate to PG if empty after 48 hours
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Incorrect user displayed as Active User for MDC recommendation**

- **Root Cause**: Fallback logic applied when no resource-level activity found (falls back to resource group or subscription level); or older background activity (e.g. deployment automation) ranked higher
- **Solution**: Explain fallback and scoring logic to customer; validate using raw activity logs (data plane logs); escalate to development team if unexplained after investigation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 23: Dynamic Assessments
> Sources: ado-wiki

**1. Customer reports many unfamiliar/new recommendations suddenly appearing on a resource, often within a specific recommendationCategory (e.g., SoftwareUpdate, HostMisconfigurations).**

- **Root Cause**: Dynamic Assessments feature (Public Preview) promotes sub-assessments to standalone assessments. Previously nested sub-assessments now surface as individual assessment entries, causing significant increase in total assessment count.
- **Solution**: Confirm with customer this is expected behavior. Use Kusto query on AssessmentLifeCycle table (isDynamicAssesment=true, filter by ScopeId and RecommendationCategory) to verify ingestion volume. Customer can use Recommendation tag filter pill to distinguish dynamic vs sub-assessments.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer deleted a resource but still sees dynamic assessments associated with it in MDC.**

- **Root Cause**: Known gap in Dynamic Assessments Public Preview: dynamic assessment cleanup runs on a delayed schedule, not immediately upon resource deletion.
- **Solution**: Inform customer that stale dynamic assessments will be deleted within 10 days. PG is actively working to reduce this to minutes before GA.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 24: Containers
> Sources: ado-wiki, mslearn

**1. "Container images should be deployed from trusted registries only" still unhealthy after regex matches all pods**

- **Root Cause**: Regex applied to wrong initiative or other linked initiatives also report non-compliant status. MDC aggregates status from multiple initiatives
- **Solution**: Check ARG query for statusPerInitiative to find all linked initiatives. Ensure regex is added to all linked initiatives including management group level. Run on-demand policy compliance scan and wait up to 24h
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Defender for Containers: missing recommendations for AKS**

- **Root Cause**: Azure Policy add-on not enabled, initial assessment up to 24h, agentless discovery disabled, or tag exclusion
- **Solution**: Enable Azure Policy add-on; wait 24h; enable agentless discovery; check tags
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 25: Endpoint Protection
> Sources: ado-wiki

**1. Installed 3rd party endpoint solution but MDC still shows endpoint protection recommendation as unhealthy**

- **Root Cause**: 3rd party AV not in MDC supported list, or ProtectionStatus not reporting correctly to Log Analytics workspace
- **Solution**: 1) Verify AV is supported: https://docs.microsoft.com/en-us/azure/defender-for-cloud/supported-machines-endpoint-solutions-clouds-servers. 2) Query ProtectionStatus in workspace. 3) If no data, run Antimalware detection script (Event 9993 in OMS event log). Note: SCEP on Win2008R2 requires PowerShell v3.0+
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDE for Linux not detected as valid endpoint protection solution by MDC recommendation**

- **Root Cause**: Real-Time Protection (RTP) not enabled on MDE.Linux agent - MDC requires RTP to be active for detection
- **Solution**: Enable RTP: mdatp config real-time-protection --value enabled. Validate: mdatp health --field real_time_protection_enabled
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 26: Edr
> Sources: ado-wiki, mslearn

**1. Defender for Cloud EDR misconfiguration recommendations - Both full and quick scans are out of 7 days, Signature out of date, or Anti-virus is off or partially configured**

- **Root Cause**: Defender for Endpoint is not configured correctly on protected machines. Agentless scanning detects misconfiguration issues such as outdated scans, stale signatures, or disabled AV components.
- **Solution**: Navigate to Defender for Cloud > Recommendations, search for EDR configuration issues should be resolved on virtual machines. Select affected resources, review security check findings, and follow remediation steps in Defender for Endpoint or on the affected machine. Requires Defender for Servers Plan 2 or Defender CSPM. Changes reflect within 24 hours.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.5/10 — MS Learn]`

**2. Defender for Cloud recommendation 'EDR configuration issues should be resolved on virtual machines' shows unhealthy with finding 'Anti-Virus is off or Partial configured', but Microsoft Defender Antiv**

- **Root Cause**: The ForceDefenderPassiveMode registry key (under HKLM:\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection or HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection) is set to 1, even though Defender AV is not in passive mode. This occurs when: (1) third-party AV was previously installed then removed, (2) GPO/Intune previously enforced passive mode, (3) SCCM/MECM set the key during deployment, or (4) MDE onboarding set passive mode that was not reverted. The agentless EDR assessment reads registry keys and reports unhealthy when ForceDefenderPassiveMode=1 regardless of actual runtime state.
- **Solution**: Set ForceDefenderPassiveMode to 0 in both registry paths: Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection' -Name 'ForceDefenderPassiveMode' -Value 0, and same for non-policy path. For scale, use Azure Run Command (Invoke-AzVMRunCommand). If GPO/Intune is the source, update the policy to prevent reversion. Wait 12-24 hours for agentless EDR reassessment. Related IcMs: 728850742.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 27: System Update
> Sources: onenote

**1. MDC system update recommendation not reflecting correct patch status or SystemUpdatesScanTime is stale**

- **Root Cause**: Windows: update info collected via MMA from Windows Event Setup (Event ID 2 for install/uninstall complete, Event ID 4 for reboot pending) and WindowsUpdateClient/Operational (Event ID 40). Linux: /etc/opt/omi/conf/omsconfig/configuration/CompletePackageInventory.xml. Stale data indicates MMA agent collection failure.
- **Solution**: Query Kusto at romelogsmc.kusto.chinacloudapi.cn/RomeLogs, table HybridOmsMachineRawSecurityDataOE, filter by ResourceIdFromHeartbeat matching the VM resource ID, project env_time and SystemUpdatesScanTime to verify latest scan timestamp. If stale, troubleshoot MMA agent health and Windows event log collection.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 28: Sql Va
> Sources: onenote

**1. MDC recommendation SQL servers should have vulnerability assessment configured appears on SQL server with no user databases - customer cannot trigger manual scan via portal**

- **Root Cause**: By design in non-express VA configuration, SQL servers without user databases still receive this recommendation. Express Configuration not yet available in Mooncake (ICM 413578033, work in progress by PG).
- **Solution**: Trigger on-demand VA scan on the master database using PowerShell: Start-AzSqlDatabaseVulnerabilityAssessmentScan. There is no UI support for master DB scan. Verify recommendation status using ARG query filtering by assessment key and resource name.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 29: Dependency Agent
> Sources: ado-wiki

**1. Recommendation: Dependency Agent should be installed on VMs/VMSS**

- **Root Cause**: Dependency Agent is a sub-agent for AMA required when VM Insights are enabled. It cannot function without AMA installed first. For AKS VMSS, AMA can be auto-installed via Cluster Insights.
- **Solution**: Install AMA first as prerequisite. Then bulk-install Dependency Agent via Azure Policy. For AKS VMSS: verify AMA pods with kubectl get pods -n kube-system, then deploy with az vmss extension set --name DependencyAgentLinux --publisher Microsoft.Azure.Monitoring.DependencyAgent. If customer does not want AMA, they can disable/exempt the recommendation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 30: Baselines
> Sources: ado-wiki

**1. MDC recommendation flags /etc/passwd- file permissions should be set to 0600 but remediation keeps getting overwritten after applying chmod 600**

- **Root Cause**: Every time a change occurs on /etc/passwd, the system saves a backup copy as /etc/passwd- with the same permissions as passwd (typically 644), overwriting any manual chmod 600 remediation
- **Solution**: Create a root cron job to enforce permissions every 5 minutes: sudo crontab -u root -e, add entry: */5 * * * * chmod 600 /etc/passwd-. This ensures the file permission is continuously enforced regardless of passwd changes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 31: Csv Export
> Sources: ado-wiki

**1. Exporting All Recommendations CSV from the MDC Recommendations pane fails with 503 ServerTimeout error, particularly when not filtering by subscription**

- **Root Cause**: The portal generates CSV on the fly using ARG results. For environments with a large number of assessments, the server times out before the export completes. HAR file shows: httpStatusCode 503, code: ServerTimeout.
- **Solution**: Use the Continuous Export feature to export recommendations to Log Analytics Workspace or Event Hub instead - this is the supported method for large-scale exports. Reference: https://learn.microsoft.com/en-us/azure/defender-for-cloud/continuous-export
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 32: Defender Cli
> Sources: ado-wiki

**1. Container vulnerability recommendations missing in Azure/Defender Portal after Defender for Cloud CLI scan**

- **Root Cause**: Container was not pushed to container registry; recommendations only published for pushed containers to reduce noise
- **Solution**: Verify scan produced SARIF file; push container to container registry; recommendations appear only for containers that are pushed to registry
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 33: Sub Assessment
> Sources: ado-wiki

**1. Error: The UserAssignedIdentities property keys should only be empty json objects, null or the resource existing property when disabling vulnerability assessment finding rule**

- **Root Cause**: Microsoft Cloud Security Benchmark is configured with a user-assigned managed identity for remediations; only system-assigned managed identities are supported for disable rule actions
- **Solution**: Reconfigure the MCSB policy assignment to use a system-assigned managed identity instead of user-assigned
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 34: Asb
> Sources: ado-wiki

**1. Customer gets no Defender for Cloud recommendation for a specific resource**

- **Root Cause**: Azure Security Benchmark (ASB) initiative not assigned, disabled, or replaced with a custom initiative that does not include the relevant policy definition.
- **Solution**: Check Security Center > Security Policy for policy assignment status. Verify ASB is the default initiative assigned. If customer uses custom initiative, recommend keeping ASB enabled and disabling unwanted policies within it. At least one initiative must be assigned.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 35: Azure Advisor
> Sources: ado-wiki

**1. Azure Advisor shows different recommendation data or status than Defender for Cloud portal for the same resource**

- **Root Cause**: Either MDC data itself is inconsistent, or the Advisor pipeline consuming data from MDC has an issue.
- **Solution**: Step 1: Check MDC portal and ARG data. Step 2: If consistent in MDC but different in Advisor, forward to Advisor team stating MDC data is intact. Step 3: If inconsistent in MDC, assign to MDC domain owner with MDC-specific screenshots (not Advisor screenshots).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 36: Assessment
> Sources: ado-wiki

**1. Security assessment results return resource not found or assessment is missing in Defender for Cloud**

- **Root Cause**: Azure Policy sends assessment against a resource which MDC marks as Not Applicable, but Policy marks as non-compliant. Discrepancy causes missing/incorrect results.
- **Solution**: Apply resource exemption for the assessment finding. See Resource Exemption TSG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 37: Vulnerability Assessment
> Sources: ado-wiki

**1. Customer wants to disable specific Zero Day vulnerability rule in VM vulnerability recommendation**

- **Root Cause**: Individual vulnerability findings (sub-assessments) need to be disabled separately through the Disable findings feature.
- **Solution**: Navigate to the assessment, find the specific QID/rule, and use the Disable findings (sub-assessments) feature to suppress the specific vulnerability rule.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 38: Assessment Status
> Sources: ado-wiki

**1. MDC assessment shows Unhealthy even though subscription-level policy is Healthy due to multiple ASB initiative assignments at different scopes**

- **Root Cause**: Multiple ASB initiative assignments at Management Group and Subscription levels. Aggregated assessment considers all scopes; if any scope is Unhealthy, aggregated status is Unhealthy.
- **Solution**: Check for ASB assignments at both MG and Subscription levels using policy compliance blade. Ensure all scopes are compliant. For exemptions, all assignments across all scopes must be exempted.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 39: Smart Aligner
> Sources: ado-wiki

**1. Deleted Azure resources still show stale assessments/recommendations in Defender for Cloud that are not being automatically cleaned up**

- **Root Cause**: Smart Aligner module only operates on assessments with keys in its allowedToDeleteList (SmartAlignerConfigurations.cs). If the assessment key is not configured, Smart Aligner will not delete stale assessments.
- **Solution**: Check SmartAlignerConfigurations.cs for the assessment key. If absent: check if control plane (managed by Azure Policy) or data plane (find recommendation owner). Use Kusto on romecore.kusto.windows.net Prod.ServiceFabricDynamicOE to trace Smart Aligner operations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 40: Deleted Resources
> Sources: ado-wiki

**1. Stale recommendations still appear in MDC for deleted IaaS resources (VMs, VMSS, Arc machines). Customer sees unhealthy assessments for resources that no longer exist.**

- **Root Cause**: The deleted-resource assessment cleanup scan runs every 24 hours. Until the next scan cycle, stale assessments for deleted resources remain visible. Only specific assessment IDs are covered by this cleanup feature.
- **Solution**: Wait up to 24 hours for the next scan cycle to remove stale assessments. Verify the recommendation is in the supported list (e.g., SQL VA, container image VA, system updates). For ACR images see Containers TSG; for inventory retired resources see Retired Resources investigation guide.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 41: Inactive Subscription
> Sources: ado-wiki

**1. MDC recommendations do not appear at all for a subscription. Azure Policy shows Assessment not found for the same recommendations.**

- **Root Cause**: Subscription is inactive: no MDC plan enabled AND no MDC portal login in past 30 days. MDC background jobs only process active subscriptions. Policy shows non-compliant with Assessment not found because MDC did not generate the assessments.
- **Solution**: Two options: 1) Turn on at least one MDC plan, OR 2) Log into MDC portal at least once a month. Either action reactivates the subscription. Use Data Explorer dashboard to check if subscription is active/inactive.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 42: Mma Baselines
> Sources: ado-wiki

**1. Unable to remediate MMA baseline security configuration recommendation in MDC**

- **Root Cause**: MMA baseline remediation is not an MDC issue; it is an ASM/OS baseline agent issue downstream
- **Solution**: Verify MDC matches LAW data. If yes, route to ASM team via Customer Support Request Workflow or IcM template. Email AzSecBaselineSupport@microsoft.com with IcM Id, OS type, server type, and LAW query results
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 43: Cis Benchmark
> Sources: ado-wiki

**1. CIS Microsoft Azure Foundations Benchmark activity log alert recommendations (5.2.1-5.2.9) showing unhealthy/non-compliant**

- **Root Cause**: Required activity log alert rules for specific security/administrative/policy operations have not been created in Azure Monitor
- **Solution**: Create individual alert rules in Azure Monitor Alerts for each CIS control condition (one rule per condition). Verify existing rules in Azure Support Center by searching microsoft.insights/activityLogAlerts
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 44: Network Watcher
> Sources: ado-wiki

**1. Network Watcher should be enabled recommendation remains unhealthy/non-compliant despite Network Watchers deployed in all VNET regions of the subscription**

- **Root Cause**: Azure Policy expects Network Watchers to be deployed under resource group named NetworkWatcherRG specifically. If customer moved NW to a different RG, policy returns complianceReasonCode=ResourceGroupNotFound
- **Solution**: 1) Move or recreate Network Watchers under RG named NetworkWatcherRG, OR 2) Update policy assignment parameter to allow custom RG name. Verify via ARG: resources | where type == 'microsoft.network/networkwatchers'
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 45: Adaptive Network Hardening
> Sources: ado-wiki

**1. Adaptive Network Hardening (ANH) assessment shows Not Applicable status for a VM in Defender for Cloud**

- **Root Cause**: The VM does not meet ANH requirements. Not-applicable reasons include: non-Standard tier VM, Classic VM, no NSG attached to both Subnet and NIC, or a new VM provisioned less than 30 days ago. The specific reason is displayed in the ANH main blade next to each resource.
- **Solution**: Check the ANH main blade to see the not applicable reason for each resource. If new VM, wait 30 days for enough traffic data. For Classic VMs or missing NSGs, ensure the VM meets prerequisites. Use KQL on RomeLogs to extract inapplicability reasons: query TraceEvent filtering by AssessmentBuilderTracer and NotApplicable.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 46: Web Ports
> Sources: ado-wiki

**1. Customer receives Web ports should be restricted on NSG associated to your VM recommendation in Defender for Cloud (unrelated to ANH)**

- **Root Cause**: VMs running web applications have overly permissive NSGs that allow unrestricted inbound traffic on ports 80/443 from any source.
- **Solution**: Manual remediation: Edit NSG inbound rules to restrict access to specific source IP ranges for ports 80 and 443. For WAF-protected apps: (1) Deploy a Web Application Firewall, (2) Update DNS to point to the WAF IP, (3) Restrict NSG source to only the WAF IP address. Use KQL on RomeLogs/Rome3Prod AssessmentCalculationOE to check assessment results per subscription.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 47: Aac
> Sources: ado-wiki

**1. Adaptive Application Control (AAC) groups or VMs not displayed (Recommended/Configured tab empty)**

- **Root Cause**: Two common causes: 1) Subscription has been in Standard tier (Azure Defender On) for less than 4 days — insufficient data to create recommendation. 2) VMs do not have AppLocker events (Windows) or LinuxAuditD events (Linux) — AAC requires these events for 30-day analysis. Windows 10 Professional additionally requires domain GPO or InTune managed AppLocker settings.
- **Solution**: Verify subscription has been in Standard tier for at least 4 days. Check for AppLocker/AuditD events using Log Analytics queries. For Windows 10 Pro, configure domain GPO or InTune AppLocker settings. Note: Feature retired August 2024.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 48: Cloud Security Explorer
> Sources: ado-wiki

**1. Cloud Security Explorer query builder shows missing dropdown options — resource types, insights, or recommendations not appearing**

- **Root Cause**: Dropdown options are loaded dynamically from CloudMap data; CloudMap data may be missing or the user doesn't have access to those resource types/options
- **Solution**: Investigate CloudMap data availability for the customer's environment. Note: some template options may display but be unavailable to specific users due to their environment scope. Copy query link to CRI for further investigation by engineering.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 49: App Service
> Sources: ado-wiki

**1. Customer reports Restrict Access to App Services assessment in Defender for Cloud showing unexpected results or needs investigation of assessment flow**

- **Root Cause**: The RestrictAccessToAppServicesAssessor detects that an App Service Environment (ASE) has an ARM VNet with an associated NSG that allows inbound traffic from the internet
- **Solution**: Investigate using KQL on RomeLogs/Rome3Prod: (1) Query TraceEvent filtering by subscriptionId and RestrictAccessToAppServicesAssessor to see starting assessment and creating assessment patterns. (2) Use env_cv and env_seqNum range to trace the full assessment flow. Check if the NSG allows internet traffic to the ASE.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 50: Mfa
> Sources: onenote

**1. MFA recommendation troubleshooting - 'MFA should be enabled on accounts with owner/write/read permissions' shows unhealthy but customer believes MFA is configured via Conditional Access**

- **Root Cause**: MDfC evaluates MFA enforcement via: (1) user-specific MFA requirements (strongAuthenticationDetail) and (2) CA policies. CA policy must include Azure Management App ID (797f4846-ba00-4fd7-ba43-dac1f8f63013 or c1745b99-11d6-4b3c-9fda-5f3136d0b960 for MC) AND enforce MFA control. Known bug: engine sometimes cannot identify Azure mgmt app ID in CA policy.
- **Solution**: Query Kusto (romelogsmc.kusto.chinacloudapi.cn/Prod): ServiceFabricIfxTraceEvent for 'IdentityEnableMFAForAccountsWithPermissions' to see assessment results per subscription. Check per-user MFA status and CA policy evaluation. Look for notEnforceMfaCauses values: CaPolicyNotEnforceMfa, CaPolicyNotIncludeAzureManagementAppId.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 51: Extension
> Sources: ado-wiki

**1. MDE extension deployment via Azure Policy fails: "AuthorizationFailed: client does not have authorization to perform action Microsoft.Security/mdeOnboardings/read"**

- **Root Cause**: When Azure Policy is scoped to a resource group, the managed identity only gets RG-level access. MDE onboarding requires subscription-level read access to Microsoft.Security/mdeOnboardings.
- **Solution**: Add Contributor role for the policy managed identity (object ID from error) at the subscription level, not just RG level. Go to Subscription > IAM > Add role assignment > Contributor > select the managed identity.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 52: Multi Cloud
> Sources: ado-wiki

**1. AWS/GCP recommendations not visible after onboarding via legacy classic connector**

- **Root Cause**: Sync delay: Security Hub/Config Rules/GCP SCC recently enabled takes up to 1 day.
- **Solution**: Wait 10min initial. If Security Hub recently enabled wait 1 day. Legacy connector deprecated Sep 2023.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — ADO Wiki]`

### Phase 53: Antivirus
> Sources: mslearn

**1. MDAV scheduled quick scan not running even though configured**

- **Root Cause**: ScanParameters set to 2 (Full Scan) overrides quick scan schedule; or ScheduledQuickScanTime set to 0 disables daily quick scans
- **Solution**: Set ScanParameters to 1 for Quick Scan; set ScheduleQuickScanTime to desired time (minutes past midnight); verify with Get-MpPreference
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 54: Mcas
> Sources: mslearn

**1. Defender for Cloud Apps policy automatically disabled with error: The policy was automatically disabled due to a configuration error**

- **Root Cause**: Objects referenced in the policy (IP tags, custom sensitive types) were deleted from Defender for Cloud Apps or Security and Compliance Center, or the policy filter is too complex
- **Solution**: Edit the policy and fix configuration errors: remove deleted objects from policy filters, simplify complex filters, and save the policy to re-enable it
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 55: Onboarding
> Sources: mslearn

**1. MDE onboarding SenseIsRunning compliant but OrgId/OnboardingState non-compliant (or vice versa)**

- **Root Cause**: Case 1: OOBE not completed; Case 2: delayed start causes non-compliance report during DM session
- **Solution**: Case 1: wait for OOBE; Case 2: auto-resolves within 24 hours; ensure onboarding/offboarding policies not deployed simultaneously
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 56: Attack Path
> Sources: mslearn

**1. Remediated attack path still appears in Defender for Cloud attack path analysis list after fixing all recommendations**

- **Root Cause**: Attack path analysis requires up to 24 hours to refresh and remove resolved attack paths from the list. The cloud security graph update is not immediate.
- **Solution**: Wait up to 24 hours for the resolved attack path to be removed. This is expected behavior. Verify remediation was properly applied by checking individual recommendation status.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 57: Wcf
> Sources: mslearn

**1. Web content filtering policy not taking effect - up to 2 hours delay; blocking Uncategorized category causes unexpected blocks**

- **Root Cause**: Inherent 2-hour latency for policy propagation. Uncategorized only covers newly registered + parked domains.
- **Solution**: Wait up to 2h for propagation. Avoid blocking Uncategorized. Additional delay when changing device groups and policy simultaneously.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot turn off Microsoft Defender for Cloud Plans — error 'You do not have permission to modify ... | Azure Policy 'Security Center standard pricing tier should be selected' blocks disabling Defender... | Add a policy exemption for the 'Security Center standard pricing tier should be selected' policy ... | 🟢 9.0 | OneNote |
| 2 | MDC system update recommendation not reflecting correct patch status or SystemUpdatesScanTime is ... | Windows: update info collected via MMA from Windows Event Setup (Event ID 2 for install/uninstall... | Query Kusto at romelogsmc.kusto.chinacloudapi.cn/RomeLogs, table HybridOmsMachineRawSecurityDataO... | 🟢 9.0 | OneNote |
| 3 | MDC recommendation SQL servers should have vulnerability assessment configured appears on SQL ser... | By design in non-express VA configuration, SQL servers without user databases still receive this ... | Trigger on-demand VA scan on the master database using PowerShell: Start-AzSqlDatabaseVulnerabili... | 🟢 9.0 | OneNote |
| 4 | Recommendation: Dependency Agent should be installed on VMs/VMSS | Dependency Agent is a sub-agent for AMA required when VM Insights are enabled. It cannot function... | Install AMA first as prerequisite. Then bulk-install Dependency Agent via Azure Policy. For AKS V... | 🟢 8.5 | ADO Wiki |
| 5 | MDC recommendation flags /etc/passwd- file permissions should be set to 0600 but remediation keep... | Every time a change occurs on /etc/passwd, the system saves a backup copy as /etc/passwd- with th... | Create a root cron job to enforce permissions every 5 minutes: sudo crontab -u root -e, add entry... | 🟢 8.5 | ADO Wiki |
| 6 | Not all recommendations visible in MDC portal appear in Event Hub or Log Analytics Workspace conf... | Continuous Export operates in live streaming mode - a recommendation is exported only when its st... | Explain that live streaming only exports state changes - resources unhealthy before export was en... | 🟢 8.5 | ADO Wiki |
| 7 | Exporting All Recommendations CSV from the MDC Recommendations pane fails with 503 ServerTimeout ... | The portal generates CSV on the fly using ARG results. For environments with a large number of as... | Use the Continuous Export feature to export recommendations to Log Analytics Workspace or Event H... | 🟢 8.5 | ADO Wiki |
| 8 | Unhealthy resource count shown in MDC Recommendations page differs from the count shown in the In... | The Recommendations blade does not count 'Preview' recommendations when calculating unhealthy res... | Expected behavior by design. Inform customer that the Recommendations page excludes Preview recom... | 🟢 8.5 | ADO Wiki |
| 9 | Azure CIEM bundle enabled successfully but CIEM recommendations not visible / not present in ARG | CIEM assessment results not propagated to ARG; possible onboarding or pipeline issue | Run ARG query to check CIEM assessments: `securityresources / extend CiemAssessmentsKeys = dynami... | 🟢 8.5 | ADO Wiki |
| 10 | GCP CIEM security connector created successfully but no recommendations appear after 24+ hours | GCP CSPM security standard not assigned to the security connector | MDC → Environment Settings → click security connector (edit) → left menu 'Security Policies' → ve... | 🟢 8.5 | ADO Wiki |
| 11 | GCP CIEM recommendations do not include all roles / IAM inheritance permissions missing | Cloud Asset API not enabled in the GCP project — required to get effective permissions with inher... | Enable Cloud Asset API in GCP: 1) Sign in to Google Cloud Console. 2) Navigate to https://console... | 🟢 8.5 | ADO Wiki |
| 12 | Customer asks why they are still being charged for Databricks resources in Defender for Cloud whe... | Databricks resources have limitations on agent-based security scenarios due to being locked resou... | Explain to customer: Databricks has limitations on agent-based scenarios (with ongoing discussion... | 🟢 8.5 | ADO Wiki |
| 13 | Container vulnerability recommendations missing in Azure Portal or Defender Portal after DfC CLI ... | Container was not pushed to the container registry after scanning. Recommendations are only publi... | Verify the scan produced a SARIF file. Push the container to the container registry - only pushed... | 🟢 8.5 | ADO Wiki |
| 14 | Error 'Invalid instance URL' when creating MDC ServiceNow integration | Incorrect or inaccessible ServiceNow instance URL provided during integration setup | Verify the ServiceNow instance URL is correct and accessible. Ensure it follows the expected format. | 🟢 8.5 | ADO Wiki |
| 15 | All ServiceNow governance assignments disappear after removing a ServiceNow integration in MDC | By design - deleting an integration removes all governance assignments linked to it | This is expected behavior. Before deleting a ServiceNow integration, note all associated governan... | 🟢 8.5 | ADO Wiki |
| 16 | ServiceNow dropdown is grayed out when creating MDC governance assignment | No ServiceNow integration configured on the selected resource scope | Verify a ServiceNow integration exists on the selected scope by navigating to the Integrations vi... | 🟢 8.5 | ADO Wiki |
| 17 | User selection keeps loading when creating MDC ServiceNow governance assignment | Integration connection issue between MDC and ServiceNow instance | Use the ServiceNow Integration Dashboard in Kusto. Navigate to 'Integrations ARM' panel -> 'GetIn... | 🟢 8.5 | ADO Wiki |
| 18 | MDC ServiceNow governance assignment creation fails | Various ServiceNow-side or MDC integration issues causing ticket creation failure | Use the ServiceNow Integration Dashboard in Kusto, search for 'failed to create ticket in 3rd par... | 🟢 8.5 | ADO Wiki |
| 19 | DevOps recommendations not visible in MDC after migration to new DevOps sources | DevOps recommendations migrated to new sources (AzureDevOps, GitHub, GitLab) and moved under All ... | Navigate to Recommendations blade > All recommendations and filter by DevOps sources; findings st... | 🟢 8.5 | ADO Wiki |
| 20 | Container vulnerability recommendations missing in Azure/Defender Portal after Defender for Cloud... | Container was not pushed to container registry; recommendations only published for pushed contain... | Verify scan produced SARIF file; push container to container registry; recommendations appear onl... | 🟢 8.5 | ADO Wiki |
| 21 | No Active User shown for resource in MDC recommendations or governance assignment blade | Data delay (detection/display takes up to 48 hours); or user not in top 3 ranking based on operat... | Wait up to 48 hours after operation; explain scoring logic: ranks by time elapsed, operation type... | 🟢 8.5 | ADO Wiki |
| 22 | Incorrect user displayed as Active User for MDC recommendation | Fallback logic applied when no resource-level activity found (falls back to resource group or sub... | Explain fallback and scoring logic to customer; validate using raw activity logs (data plane logs... | 🟢 8.5 | ADO Wiki |
| 23 | Customer reports Databricks resources are excluded from MDC recommendations but questions why the... | Databricks has a known limitation on agent-based security scenarios; there is an ongoing discussi... | Explain that while agent-based scenarios are limited for Databricks, other scenarios such as netw... | 🟢 8.5 | ADO Wiki |
| 24 | Customer requests Microsoft support to remediate their MDC security recommendations or fix unheal... |  | Explain CSPM is designed to highlight misconfigurations; unhealthy resources mean the service is ... | 🟢 8.5 | ADO Wiki |
| 25 | Customer asks CSS to remediate MDC security recommendations on their behalf | CSPM features are designed to show misconfigurations; remediation is customer responsibility unde... | Explain that recommendations highlight areas to address for security posture improvement. Each re... | 🟢 8.5 | ADO Wiki |
| 26 | Databricks resources excluded from MDC recommendations but customer questions why they are still ... | Known limitation: Databricks locks resources preventing agent-based MDC scenarios; discussion ong... | Explain that Databricks has a limitation on agent-based scenarios (recommendations), but other sc... | 🟢 8.5 | ADO Wiki |
| 27 | Customer asks CSS to remediate their MDC security recommendations directly | Misunderstanding of shared responsibility model - CSPM features highlight misconfigurations, reme... | Explain CSPM shows resource misconfigurations. All recommendations include Remediation steps and ... | 🟢 8.5 | ADO Wiki |
| 28 | Customer requests CSS to remediate their MDC security recommendations or fix unhealthy resources | By design per shared responsibility model: CSPM features highlight misconfigurations, remediation... | Guide customer to Remediation steps in each recommendation, the Fix button for quick resolution, ... | 🟢 8.5 | ADO Wiki |
| 29 | Customer asks CSS to remediate MDC security recommendations for their resources | CSPM features designed to highlight misconfigurations. Showing unhealthy resources is by design. ... | Guide customer to Remediation steps and Fix button in each recommendation. Explain shared respons... | 🟢 8.5 | ADO Wiki |
| 30 | Databricks VMs excluded from many/all MDC recommendations but customer still paying for Defender ... | Databricks resources are locked, making agent-based scenarios inapplicable. Known limitation with... | Other scenarios such as network-based detections still cover Databricks resources. Limitation is ... | 🟢 8.5 | ADO Wiki |
| 31 | Customer requests CSS to remediate MDC security recommendations on their behalf | Per shared responsibility model, remediation is customer responsibility | Explain CSPM shows misconfigurations by design. Recommendations include remediation steps and Fix... | 🟢 8.5 | ADO Wiki |
| 32 | Databricks resources excluded from MDC recommendations but customer still charged for Defender co... | Databricks are locked resources with agent-based limitations; network-based detections still apply | Explain: agent-based scenarios limited for Databricks (ongoing discussion with Databricks team), ... | 🟢 8.5 | ADO Wiki |
| 33 | Customer requests support to remediate Defender for Cloud security recommendations or asks CSS to... | CSPM recommendations show resource misconfigurations by design under shared responsibility model | Remediation is customer responsibility per shared responsibility model. Each recommendation has R... | 🟢 8.5 | ADO Wiki |
| 34 | Customer requests Microsoft support to remediate Defender for Cloud security recommendations on t... | Misunderstanding of shared responsibility model - CSPM shows misconfigurations, remediation is cu... | Explain: CSPM highlights misconfigurations by design. All recommendations include Remediation ste... | 🟢 8.5 | ADO Wiki |
| 35 | Databricks resources show Defender for Cloud recommendations that cannot be remediated because re... | Known limitation: agent-based security scenarios are excluded from Databricks locked resources (o... | Acknowledge limitation on agent-based scenarios for Databricks. Network-based detections still co... | 🟢 8.5 | ADO Wiki |
| 36 | Customer requests Microsoft support to remediate Defender for Cloud security recommendations | CSPM highlights misconfigurations by design; remediation is customer/resource-owner responsibilit... | CSPM shows misconfigurations by design. Recommendations include Remediation steps and Fix button.... | 🟢 8.5 | ADO Wiki |
| 37 | Customer asks Microsoft CSS to remediate Defender for Cloud security recommendations or fix unhea... | CSPM features highlight misconfigurations by design; remediation is customer responsibility under... | Guide customer to use built-in Remediation steps and Fix button in each recommendation. Remediati... | 🟢 8.5 | ADO Wiki |
| 38 | Databricks resources generate Defender for Cloud recommendations that cannot be remediated; custo... | Databricks resources are locked and cannot have agents installed; agent-based security scenarios ... | Network-based detections still cover Databricks resources. Open discussion with Databricks team t... | 🟢 8.5 | ADO Wiki |
| 39 | Customer requests Microsoft support to remediate their MDC security recommendations (asking suppo... | CSPM features show resource misconfigurations by design. Unhealthy status means service is workin... | Explain shared responsibility model. Point to remediation steps and Fix button in each recommenda... | 🟢 8.5 | ADO Wiki |
| 40 | Databricks resources excluded from MDC recommendations but customer still paying for Defender pro... | Known limitation: Databricks locks resources preventing agent-based security scenarios. Open disc... | Agent-based scenarios do not work on Databricks locked resources, but network-based detections st... | 🟢 8.5 | ADO Wiki |
| 41 | Databricks resources show non-actionable Defender for Cloud recommendations; customer questions c... | Known limitation: agent-based scenarios excluded from Databricks locked resources. | Acknowledge agent-based limitation for Databricks. Network-based detections still cover. Collabor... | 🟢 8.5 | ADO Wiki |
| 42 | Customer requests Microsoft support to remediate Defender for Cloud security recommendations (unh... | Misunderstanding of shared responsibility model. CSPM features highlight misconfigurations by des... | Explain MDC recommendations show unhealthy resources by design. Each recommendation has Remediati... | 🟢 8.5 | ADO Wiki |
| 43 | Customer asks Microsoft support to remediate their Defender for Cloud security recommendations | By design: CSPM recommendations highlight misconfigurations per the shared responsibility model; ... | Explain CSPM is working as designed. Point to the recommendation’s built-in Remediation steps and... | 🟢 8.5 | ADO Wiki |
| 44 | Security Attack Paths not available as ExportedDataType in built-in policy 'Deploy export to Even... | Attack Paths value supported in REST API 2023-12-01-preview but not yet in built-in Azure Policy.... | Workaround: Duplicate built-in policy, modify custom policy to use API version 2023-12-01-preview... | 🟢 8.5 | ADO Wiki |
| 45 | Recommendations export from Azure Resource Graph (ARG) or Defender for Cloud portal exceeds the 2... | By design since August 2021, CSV exports of recommendation data are limited to 20MB to prevent se... | Filter recommendations by subscription using Azure Portal Advanced Filters; use 'All Recommendati... | 🟢 8.5 | ADO Wiki |
| 46 | User created a recommendation exemption but the resource is not shown as exempted in MDC (control... | Not all relevant initiative assignments have exemptions applied; a recommendation can result from... | Use ARG query (securityresources where type == microsoft.security/assessments) to check status pe... | 🟢 8.5 | ADO Wiki |
| 47 | Cannot create exemption due to Exemption exists error, but no matching exemption found in the exe... | A previously created exemption with Apply exemption to the whole assignment option includes all p... | Check all exemptions via REST API (Policy Exemptions - List) or ASC Policy > Policy Exemptions; l... | 🟢 8.5 | ADO Wiki |
| 48 | After creating an exemption, all resources under the subscription moved to the Not applicable tab | The exemption scope was set to subscription level, causing all resources under that subscription ... | Verify the exemption scope; if only specific resources should be exempted, delete the subscriptio... | 🟢 8.5 | ADO Wiki |
| 49 | Resource shows as exempted in MDC recommendations but regulatory compliance status still shows no... | Exemption was only applied to the Microsoft Security Baseline (MSB) assignment; regulatory compli... | Apply exemption to all relevant initiative assignments, not just MSB, to ensure consistent regula... | 🟢 8.5 | ADO Wiki |
| 50 | Error: The UserAssignedIdentities property keys should only be empty json objects, null or the re... | Microsoft Cloud Security Benchmark is configured with a user-assigned managed identity for remedi... | Reconfigure the MCSB policy assignment to use a system-assigned managed identity instead of user-... | 🟢 8.5 | ADO Wiki |
| 51 | Authorization error when trying to delete a recommendation exemption created at management group ... | Windows Azure Security Resource Provider does not have Reader role assigned at the management gro... | Assign the Reader role to the Windows Azure Security Resource Provider at the management group le... | 🟢 8.5 | ADO Wiki |
| 52 | After exempting MCSB initiative for a control plane recommendation, the assessment still shows Un... | For control plane recommendations, MDC derives assessment entirely from Azure Policy compliance. ... | Apply exemptions to every initiative (MCSB, ISO, custom) involved in the assessment. Verify with ... | 🟢 8.5 | ADO Wiki |
| 53 | ISO per-policy status shows Unhealthy but policy compliance shows Compliant after applying MCSB e... | For data plane recommendations, once all MCSB assignments are exempted, the aggregated MDC assess... | This is expected behavior. The aggregated assessment is the authoritative source of truth. Valida... | 🟢 8.5 | ADO Wiki |
| 54 | Customer gets no Defender for Cloud recommendation for a specific resource | Azure Security Benchmark (ASB) initiative not assigned, disabled, or replaced with a custom initi... | Check Security Center > Security Policy for policy assignment status. Verify ASB is the default i... | 🟢 8.5 | ADO Wiki |
| 55 | Azure Advisor shows different recommendation data or status than Defender for Cloud portal for th... | Either MDC data itself is inconsistent, or the Advisor pipeline consuming data from MDC has an is... | Step 1: Check MDC portal and ARG data. Step 2: If consistent in MDC but different in Advisor, for... | 🟢 8.5 | ADO Wiki |
| 56 | Security assessment results return resource not found or assessment is missing in Defender for Cloud | Azure Policy sends assessment against a resource which MDC marks as Not Applicable, but Policy ma... | Apply resource exemption for the assessment finding. See Resource Exemption TSG. | 🟢 8.5 | ADO Wiki |
| 57 | Customer wants to disable specific Zero Day vulnerability rule in VM vulnerability recommendation | Individual vulnerability findings (sub-assessments) need to be disabled separately through the Di... | Navigate to the assessment, find the specific QID/rule, and use the Disable findings (sub-assessm... | 🟢 8.5 | ADO Wiki |
| 58 | MDC assessment shows Unhealthy even though subscription-level policy is Healthy due to multiple A... | Multiple ASB initiative assignments at Management Group and Subscription levels. Aggregated asses... | Check for ASB assignments at both MG and Subscription levels using policy compliance blade. Ensur... | 🟢 8.5 | ADO Wiki |
| 59 | Deleted Azure resources still show stale assessments/recommendations in Defender for Cloud that a... | Smart Aligner module only operates on assessments with keys in its allowedToDeleteList (SmartAlig... | Check SmartAlignerConfigurations.cs for the assessment key. If absent: check if control plane (ma... | 🟢 8.5 | ADO Wiki |
| 60 | Stale recommendations still appear in MDC for deleted IaaS resources (VMs, VMSS, Arc machines). C... | The deleted-resource assessment cleanup scan runs every 24 hours. Until the next scan cycle, stal... | Wait up to 24 hours for the next scan cycle to remove stale assessments. Verify the recommendatio... | 🟢 8.5 | ADO Wiki |
| 61 | Customer reports many unfamiliar/new recommendations suddenly appearing on a resource, often with... | Dynamic Assessments feature (Public Preview) promotes sub-assessments to standalone assessments. ... | Confirm with customer this is expected behavior. Use Kusto query on AssessmentLifeCycle table (is... | 🟢 8.5 | ADO Wiki |
| 62 | Customer deleted a resource but still sees dynamic assessments associated with it in MDC. | Known gap in Dynamic Assessments Public Preview: dynamic assessment cleanup runs on a delayed sch... | Inform customer that stale dynamic assessments will be deleted within 10 days. PG is actively wor... | 🟢 8.5 | ADO Wiki |
| 63 | Azure Policy shows NotFound non-compliant status for MDC recommendations (e.g., container securit... | By design: the policy checks for specific assessment types. If a resource of the target type (VM,... | Explain to customer this is by-design behavior. NotFound means the assessment is not applicable (... | 🟢 8.5 | ADO Wiki |
| 64 | MDC recommendations do not appear at all for a subscription. Azure Policy shows Assessment not fo... | Subscription is inactive: no MDC plan enabled AND no MDC portal login in past 30 days. MDC backgr... | Two options: 1) Turn on at least one MDC plan, OR 2) Log into MDC portal at least once a month. E... | 🟢 8.5 | ADO Wiki |
| 65 | MDC baseline recommendation 'Machines should be configured securely' (Assessment Key: c476dc48-81... | Two conflicting agents (MMA and AMA) are running on the same VM, reporting two conflicting compli... | Remove the preview AMA agent from the VM. Verify by checking the Log Analytics workspace: if Secu... | 🟢 8.5 | ADO Wiki |
| 66 | 'Failed to fetch data' error when opening MDC 'Machines should be configured securely' recommenda... | The Baselines recommendation depends on a legacy security Tasks API (EntryPointGetTasks). When th... | Run Kusto query to verify API failures: cluster('romelogs.kusto.windows.net').database('Prod').Fi... | 🟢 8.5 | ADO Wiki |
| 67 | Unable to remediate MMA baseline security configuration recommendation in MDC | MMA baseline remediation is not an MDC issue; it is an ASM/OS baseline agent issue downstream | Verify MDC matches LAW data. If yes, route to ASM team via Customer Support Request Workflow or I... | 🟢 8.5 | ADO Wiki |
| 68 | CIS Microsoft Azure Foundations Benchmark activity log alert recommendations (5.2.1-5.2.9) showin... | Required activity log alert rules for specific security/administrative/policy operations have not... | Create individual alert rules in Azure Monitor Alerts for each CIS control condition (one rule pe... | 🟢 8.5 | ADO Wiki |
| 69 | VM extensions marked as unhealthy in MDC recommendation "Only approved VM extensions should be in... | Policy evaluates extension type but MDC UI shows extension name, causing confusion. The extension... | In Azure Policy, find non-compliance reason to get extension type (Current value). Edit ASC Defau... | 🟢 8.5 | ADO Wiki |
| 70 | VM extensions compliant in Azure Policy but still unhealthy in MDC for "Only approved VM extensio... | Customer applied the fix to the wrong policy initiative. MDC reads status from the CIS initiative... | Find "Only approved VM extensions should be installed" policy inside the CIS initiative specifica... | 🟢 8.5 | ADO Wiki |
| 71 | VM extensions still unhealthy after adding extension type to CIS initiative for "Only approved VM... | MDC is looking at a different initiative than expected for compliance state | Run POST policyStates API on the extension resource to find policyDefinitionGroupNames value (e.g... | 🟢 8.5 | ADO Wiki |
| 72 | "Container images should be deployed from trusted registries only" still unhealthy after regex ma... | Regex applied to wrong initiative or other linked initiatives also report non-compliant status. M... | Check ARG query for statusPerInitiative to find all linked initiatives. Ensure regex is added to ... | 🟢 8.5 | ADO Wiki |
| 73 | External (guest) user with multiple RBAC roles (Owner+Contributor+Reader) only appears as unhealt... | MDC external accounts recommendations follow RBAC hierarchy - a user granted Owner role is only r... | Review external user RBAC assignments; if same user has multiple roles, only highest violation is... | 🟢 8.5 | ADO Wiki |
| 74 | Customer sees External accounts with owner permissions recommendation but external user does not ... | Custom roles with unlimited permissions (Actions=*, NotActions empty) are treated as Owner-equiva... | Check custom roles: Connect-AzureAd; Get-AzRoleDefinition / Where-Object {($_.Actions.count -eq 1... | 🟢 8.5 | ADO Wiki |
| 75 | Subscription intermittently shows too many owners / owner count fluctuates - assessment turns unh... | Customer uses PIM (Privileged Identity Management); ARM GetRoleAssignments API only returns activ... | Use KQL on romelogs to check IsOwner status over time: cluster(romelogs.kusto.windows.net).databa... | 🟢 8.5 | ADO Wiki |
| 76 | Policy size too large error when trying to exempt sub-assessments in MDC identity recommendations... | Azure sub-assessment exemptions are stored as metadata properties on the policy assignment; unopt... | Consolidate exemptions via ARM API: GET policy assignment, merge user IDs into single in array pe... | 🟢 8.5 | ADO Wiki |
| 77 | Installed 3rd party endpoint solution but MDC still shows endpoint protection recommendation as u... | 3rd party AV not in MDC supported list, or ProtectionStatus not reporting correctly to Log Analyt... | 1) Verify AV is supported: https://docs.microsoft.com/en-us/azure/defender-for-cloud/supported-ma... | 🟢 8.5 | ADO Wiki |
| 78 | MDE for Linux not detected as valid endpoint protection solution by MDC recommendation | Real-Time Protection (RTP) not enabled on MDE.Linux agent - MDC requires RTP to be active for det... | Enable RTP: mdatp config real-time-protection --value enabled. Validate: mdatp health --field rea... | 🟢 8.5 | ADO Wiki |
| 79 | Network Watcher should be enabled recommendation remains unhealthy/non-compliant despite Network ... | Azure Policy expects Network Watchers to be deployed under resource group named NetworkWatcherRG ... | 1) Move or recreate Network Watchers under RG named NetworkWatcherRG, OR 2) Update policy assignm... | 🟢 8.5 | ADO Wiki |
| 80 | MDC recommendation 'Permissions of inactive identities in your Azure subscriptions should be revo... | Current recommendation relies only on EventServiceEntries ARM log table. Activities via HttpIncom... | Microsoft is improving detection logic to include HttpIncomingRequests (targeted Dec 2025-Jan 202... | 🟢 8.5 | ADO Wiki |
| 81 | Compliance Over Time (Preview) workbook in Defender for Cloud shows no data or is not available, ... | Known bug: Continuous Export Snapshots do not run as scheduled (PG aware, no ETA for fix as of 20... | 1) PG can trigger a manual snapshot update if urgent. 2) Check workspace: SecurityRegulatoryCompl... | 🟢 8.5 | ADO Wiki |
| 82 | Secure Score stops being published or calculated for a subscription after a period of inactivity;... | By design - MDC stops processing and publishing recommendations after approximately 30 days of su... | Use Kusto query on SubscriptionActivityQueryOE (romelogs cluster) to check active/inactive histor... | 🟢 8.5 | ADO Wiki |
| 83 | A Secure Score control shows 0 score or 0 healthy resources even though some individual recommend... | By design - Secure Score counts resources not assessments. A resource is only healthy for a contr... | Explain the correct model to customer. Identify which recommendation(s) within the control still ... | 🟢 8.5 | ADO Wiki |
| 84 | Secure Score workbook shows no data, partial data, or incorrect data despite Secure Score being c... | Continuous export not configured for secure score data to Log Analytics Workspace, or data not fl... | 1) Configure continuous export in Environment Settings > Continuous Export for secure score. 2) C... | 🟢 8.5 | ADO Wiki |
| 85 | MDC recommendation "Diagnostic logs in Key Vault should be enabled" shows non-compliant status fo... | Key Vault diagnostic log retention days do not match the value specified in the ASC Default polic... | Navigate to Azure Policy > Definitions > ASC Default policy assignment > search for Key Vault pol... | 🟢 8.5 | ADO Wiki |
| 86 | DeployIfNotExists (DINE) policy remediation task uses unexpected account context; newly created r... | Undocumented Azure Policy behavior: for newly created resources, DINE auto-remediation uses the a... | Explain the two DINE remediation contexts: (1) Manual remediation task for existing non-compliant... | 🟢 8.5 | ADO Wiki |
| 87 | Defender for Cloud Recommendation Risk Level not being evaluated or not appearing for resources. ... | Risk Level requires Defender Cloud Security Posture Management (CSPM) plan enabled. Risk level is... | Verify CSPM is enabled: use ADX dashboard (Infrastructure Solutions - Common Queries/MDC-Billing/... | 🟢 8.5 | ADO Wiki |
| 88 | Customer enabled both BYOL VA and Agentless scanning on the same subscription. No vulnerability a... | BYOL and Agentless VA cannot be used side by side. When BYOL is configured first and Agentless is... | Customer must choose one VA method. To use Agentless scanning, remove the BYOL solution first. To... | 🟢 8.5 | ADO Wiki |
| 89 | Customer wants to use Azure Policy to auto-deploy BYOL VA solution across subscriptions, but depl... | By design, BYOL VA security solution is not an ARM extension resource (unlike built-in VA). Azure... | Explain that Azure Policy auto-deploy is only supported for built-in VA (MDVM). For BYOL VA, use ... | 🟢 8.5 | ADO Wiki |
| 90 | VA agent installation failed on a VM, but the "Add a vulnerability assessment solution" recommend... | The VA extension installation succeeded (so the VM is no longer discovered as needing VA), but th... | Navigate to the VM in Azure portal > Extensions > find the Qualys/Rapid7 agent > Uninstall. This ... | 🟢 8.5 | ADO Wiki |
| 91 | VA recommendations of type "Remediate vulnerabilities" do not appear in Defender for Cloud after ... | Findings from VA vendor have a delay up to 24 hours before appearing in MDC. Also: (1) VA vendor ... | Wait up to 24 hours after initial VA setup. Check Qualys status page (status.qualys.com). Verify ... | 🟢 8.5 | ADO Wiki |
| 92 | Adaptive Network Hardening (ANH) assessment shows Not Applicable status for a VM in Defender for ... | The VM does not meet ANH requirements. Not-applicable reasons include: non-Standard tier VM, Clas... | Check the ANH main blade to see the not applicable reason for each resource. If new VM, wait 30 d... | 🟢 8.5 | ADO Wiki |
| 93 | Customer receives Web ports should be restricted on NSG associated to your VM recommendation in D... | VMs running web applications have overly permissive NSGs that allow unrestricted inbound traffic ... | Manual remediation: Edit NSG inbound rules to restrict access to specific source IP ranges for po... | 🟢 8.5 | ADO Wiki |
| 94 | Cloud Secure Score in Defender for Cloud initiative page shows N/A | Score 0 is being reported for the tenant, potentially due to a wider issue in the DataStore pipel... | Check Risk Geneva dashboard -> Secure score by tenant widget filtered by tenant ID to see when is... | 🟢 8.5 | ADO Wiki |
| 95 | Customer reports drastic/unexpected change in Cloud Secure Score in Defender for Cloud | Score is based on risk recommendations distribution and critical assets. Changes result from: new... | Use Risk dashboard to identify exact time of score change. Use Prod Investigation dashboard (requ... | 🟢 8.5 | ADO Wiki |
| 96 | Customer Secure Score is high but there are many High/Critical severity recommendations showing i... | Preview recommendations are not included in Secure Score calculation. If many High/Critical recom... | Verify how many recommendations are actually included in score calculation using the Prod Investi... | 🟢 8.5 | ADO Wiki |
| 97 | MDC baseline recommendation 'Zeroconf networking should be disabled' flagged on Linux VM | Zeroconf/APIPA networking is enabled by default on some Linux distributions — /etc/sysconfig/netw... | Run: echo 'NOZEROCONF=yes' >> /etc/sysconfig/network && /etc/init.d/network restart. Tracked in A... | 🟢 8.0 | OneNote |
| 98 | Need to export all MDC security recommendations for a subscription using ARG query |  | Use Azure Resource Graph Explorer: securityresources / where type == 'microsoft.security/assessme... | 🟢 8.0 | OneNote |
| 99 | Adaptive Application Control (AAC) groups or VMs not displayed (Recommended/Configured tab empty) | Two common causes: 1) Subscription has been in Standard tier (Azure Defender On) for less than 4 ... | Verify subscription has been in Standard tier for at least 4 days. Check for AppLocker/AuditD eve... | 🔵 7.5 | ADO Wiki |
| 100 | Cloud Security Explorer query builder shows missing dropdown options — resource types, insights, ... | Dropdown options are loaded dynamically from CloudMap data; CloudMap data may be missing or the u... | Investigate CloudMap data availability for the customer's environment. Note: some template option... | 🔵 7.5 | ADO Wiki |
| 101 | VM shows as 'not monitored' in MDC Asset Inventory despite customer believing monitoring is active | Agent monitoring recommendation not resolved for the VM | Navigate to the Recommendations blade and resolve the 'Agent monitoring should be installed' reco... | 🔵 7.5 | ADO Wiki |
| 102 | Customer cannot find a specific resource in MDC Asset Inventory list | Asset Inventory only shows resources connected to MDC (resources with security recommendations). ... | Use Azure 'All Resources' view to see all resources. To verify MDC security data, run ARG query: ... | 🔵 7.5 | ADO Wiki |
| 103 | Customer asks why they are still paying for Databricks resources in Defender for Cloud when Datab... | Databricks resources are locked, preventing agent-based security scenarios and recommendation rem... | Databricks is still covered by other detection scenarios such as network-based detections. An ong... | 🔵 7.5 | ADO Wiki |
| 104 | Customer questions why paying for Defender for Cloud on Databricks when recommendations excluded ... | Databricks resources are locked, cannot be remediated by agent-based scenarios. Known limitation. | Agent-based scenarios limited on Databricks but network-based detections still cover Databricks. ... | 🔵 7.5 | ADO Wiki |
| 105 | Customer asks why Databricks resources are excluded from many/all MDC recommendations (locked res... | Databricks resources are locked and cannot have agents installed, limiting agent-based security s... | Explain: agent-based scenarios are limited for Databricks (ongoing discussion with Databricks tea... | 🔵 7.5 | ADO Wiki |
| 106 | Customer questions why they are paying for Databricks resources in Defender for Cloud when recomm... | Databricks has limitations on agent-based scenarios due to locked resources; ongoing discussion w... | Explain: agent-based recommendations are limited for Databricks (locked resources), but other cov... | 🔵 7.5 | ADO Wiki |
| 107 | Customer questions why Databricks resources are excluded from Defender for Cloud recommendations ... | Databricks resources are locked, preventing agent-based security scenarios. Ongoing discussion wi... | Explain that agent-based scenarios are limited on Databricks, but other coverage (e.g. network-ba... | 🔵 7.5 | ADO Wiki |
| 108 | Databricks resources excluded from MDC recommendations but customer still charged for Defender plans | Databricks has limitations on agent-based scenarios because resources are locked; only network-ba... | By design: Databricks VMs cannot install agents so agent-based recommendations are excluded, but ... | 🔵 7.5 | ADO Wiki |
| 109 | Customer questions why paying for Databricks in Defender for Cloud when recommendations show Data... | Databricks has limitations on agent-based scenarios due to locked resources; ongoing discussion w... | Agent-based recommendations limited for Databricks (locked resources), but network-based detectio... | 🔵 7.5 | ADO Wiki |
| 110 | Management Group scope is grayed out when trying to create a recommendation exemption | The relevant policy is not part of an initiative assigned at the same Management Group scope leve... | Ensure the policy is included in an initiative that is assigned at the same MG scope level or a h... | 🔵 7.5 | ADO Wiki |
| 111 | Cannot see the context menu inside a recommendation to exempt a resource | The recommendation does not support exemptions; exemption requires (1) the recommendation has a p... | Verify the recommendation has a policy definition ID and uses the generic blade; if not, exemptio... | 🔵 7.5 | ADO Wiki |
| 112 | Unable to remediate a failing Windows or Linux security baseline rule in MDC security configurati... | Baseline rule Expected Value does not match the Actual Value on the VM. Remediation requires matc... | 1) Look up the failing rule in docs: Windows - azure/governance/policy/samples/guest-configuratio... | 🔵 7.5 | ADO Wiki |
| 113 | MDC recommendation about subscription having more or less than X owners showing as unhealthy | Number of users with Owner role assignment on subscription does not meet the recommended threshold | Run Kusto query on romelogs TraceEvent with rootOperationId (from General section) filtering tagI... | 🔵 7.5 | ADO Wiki |
| 114 | Users still appear as not covered by MFA in MDC recommendation despite Conditional Access (CA) po... | CA policy misconfiguration: missing Azure Portal App ID (797f4846-ba00-4fd7-ba43-dac1f8f63013), e... | Verify CA policy: 1) Includes Azure Portal app ID or All apps, 2) No excluded users/groups contai... | 🔵 7.5 | ADO Wiki |
| 115 | Deprecated parameters (marked [Deprecated]) appear in ASC/MDC built-in initiative policy assignme... | Removing parameters from policy definitions is a breaking change in Azure Policy - all existing a... | Explain to customer that [Deprecated] parameters in the ASC Default initiative assignment are a k... | 🔵 7.5 | ADO Wiki |
| 116 | Customer reports Restrict Access to App Services assessment in Defender for Cloud showing unexpec... | The RestrictAccessToAppServicesAssessor detects that an App Service Environment (ASE) has an ARM ... | Investigate using KQL on RomeLogs/Rome3Prod: (1) Query TraceEvent filtering by subscriptionId and... | 🔵 7.5 | ADO Wiki |
| 117 | Regulatory compliance controls appear grayed out in Defender for Cloud dashboard | Controls without automated Defender for Cloud assessments show as grayed out; includes procedure/... | Grayed-out controls are by design for non-automatable assessments; manually assess compliance for... | 🔵 7.5 | MS Learn |
| 118 | Regulatory compliance dashboard not loading or standards not showing in Defender for Cloud | Defender for Cloud not enabled at subscription level; or subscription has no relevant resources f... | Enable Defender for Cloud at subscription level; clear browser cache; try different browser or ne... | 🔵 7.5 | MS Learn |
| 119 | Compliance recommendation changes not reflected in regulatory compliance dashboard after remediation | Compliance assessments run approximately every 12 hours; changes not visible until next assessmen... | Wait 12 hours after taking remediation action for changes to reflect in compliance data; no manua... | 🔵 7.5 | MS Learn |
| 120 | ASC baseline recommendation 'Zeroconf networking should be disabled' - Linux VM flagged for zeroc... | Zeroconf (APIPA) networking is enabled by default on some Linux distributions, flagged by ASC bas... | Run: echo 'NOZEROCONF=yes' >> /etc/sysconfig/network && /etc/init.d/network restart | 🔵 7.0 | OneNote |
| 121 | Customer needs to export or query all security recommendations from Defender for Cloud | Recommendations can be queried via Azure Resource Graph using securityresources type | Use ARG query: securityresources / where type == 'microsoft.security/assessments'. Get assessment... | 🔵 7.0 | OneNote |
| 122 | MFA recommendation troubleshooting - 'MFA should be enabled on accounts with owner/write/read per... | MDfC evaluates MFA enforcement via: (1) user-specific MFA requirements (strongAuthenticationDetai... | Query Kusto (romelogsmc.kusto.chinacloudapi.cn/Prod): ServiceFabricIfxTraceEvent for 'IdentityEna... | 🔵 7.0 | OneNote |
| 123 ⚠️ | AWS security connector and CloudFormation deployed successfully but no Permissions Management rec... | Multiple possible causes: 1) MEPM first-party app (b46c3ac5-9da6-418f-a849-0a07a10b3c6c) not prov... | Step-by-step: 1) Check MEPM first-party app ID b46c3ac5 in AAD — if missing, open CRI with tenant... | 🔵 7.0 | ADO Wiki |
| 124 ⚠️ | MEPM extension enabled in Azure but no recommendations appear after 24+ hours - MEPM first-party ... | MEPM first-party app (App ID: b46c3ac5-9da6-418f-a849-0a07a10b3c6c) not provisioned in customer t... | Ask customer to search for app ID b46c3ac5-9da6-418f-a849-0a07a10b3c6c in Azure AD. If app does n... | 🔵 7.0 | ADO Wiki |
| 125 ⚠️ | MEPM extension enabled in Azure but no recommendations - Cloud Infrastructure Entitlement Managem... | MEPM first-party app exists but was not assigned (or was removed) Reader role at the subscription... | Ask customer to verify Cloud Infrastructure Entitlement Management has Reader role at subscriptio... | 🔵 7.0 | ADO Wiki |
| 126 ⚠️ | MEPM no recommendations in Azure - Azure CSPM security standard not assigned to subscription | Azure CSPM security standard is not assigned to the subscription in MDC Security policies | Navigate to MDC > Environment Settings > subscription > Security policies and assign Azure CSPM. ... | 🔵 7.0 | ADO Wiki |
| 127 ⚠️ | No Active User shown for a resource in MDC recommendation/assignment blade, or client claims a us... | Data delay (detection takes up to 48 hours), user may not be in Top 3 due to operation recency/ty... | Ask when the operation was performed and wait up to 48 hours. Explain scoring logic (Time elapsed... | 🔵 7.0 | ADO Wiki |
| 128 ⚠️ | Wrong Active User listed for a resource in MDC - client confused about the displayed user | Fallback logic: when no resource-level activity is detected, system falls back to resource group ... | Explain fallback and scoring logic: Resource then Resource Group then Subscription. Validate usin... | 🔵 7.0 | ADO Wiki |
| 129 ⚠️ | MDC Governance rule with complex condition (multiple conditions) cannot be edited via UI | Rules created via API with complex conditions (more than one condition) are not supported for UI ... | Edit the rule via REST API instead of the portal UI. API docs: https://learn.microsoft.com/en-us/... | 🔵 7.0 | ADO Wiki |
| 130 ⚠️ | Unspecified owner shown in MDC Governance owners list | The tag configured to represent resource ownership is missing on the resource. When the tag is no... | Verify the expected ownership tag exists on the resource. Query governance assignments in Kusto t... | 🔵 7.0 | ADO Wiki |
| 131 ⚠️ | MDC Governance: owner/manager wants to stop receiving email notifications about assigned recommen... | Email notifications are configured per governance rule and apply to all assignments under that rule | Edit ALL governance rules in the subscription to uncheck the email notification checkbox for owne... | 🔵 7.0 | ADO Wiki |
| 132 ⚠️ | Cannot edit governance rule with complex conditions in MDC portal UI | Rules created via API with more than one condition cannot be edited through the UI | Use Governance Rules REST API to edit: https://learn.microsoft.com/en-us/rest/api/defenderforclou... | 🔵 7.0 | ADO Wiki |
| 133 ⚠️ | Unspecified owner shown in MDC governance assignments list for resources | Ownership tag designated for the resource is missing on the resource; governanceAssignment create... | Add the required ownership tag to the affected Azure resource; query Kusto governance assignments... | 🔵 7.0 | ADO Wiki |
| 134 ⚠️ | No recommendations visible when Show my items only filter is applied in MDC governance | Logged-in user email address does not match the email address set as owner in governance assignments | Verify email address matches between logged-in user and recommendation owner; governance relies o... | 🔵 7.0 | ADO Wiki |
| 135 ⚠️ | MDE extension deployment via Azure Policy fails: "AuthorizationFailed: client does not have autho... | When Azure Policy is scoped to a resource group, the managed identity only gets RG-level access. ... | Add Contributor role for the policy managed identity (object ID from error) at the subscription l... | 🔵 7.0 | ADO Wiki |
| 136 ⚠️ | Security recommendations show N/A risk level in Defender for Cloud | Cloud Security Posture Management (CSPM) bundle is not enabled on the connector (AWS/GCP) or Azur... | Enable Defender CSPM bundle on the relevant connector or subscription; risk levels will populate ... | 🔵 7.0 | ADO Wiki |
| 137 ⚠️ | Secure Score is N/A or not calculated for a subscription under Microsoft AME tenant (33e01921-4d6... | By design - Secure Score is not calculated on subscriptions under the AME tenant unless explicitl... | Request Secure Score team to add the specific subscription to the allow list for Secure Score cal... | 🔵 7.0 | ADO Wiki |
| 138 | Defender for Cloud EDR misconfiguration recommendations - Both full and quick scans are out of 7 ... | Defender for Endpoint is not configured correctly on protected machines. Agentless scanning detec... | Navigate to Defender for Cloud > Recommendations, search for EDR configuration issues should be r... | 🔵 6.5 | MS Learn |
| 139 | Some ASC recommendations are not managed by Azure Policy and use internal logic (Core/R3) instead | Design limitation - VMSS, SQL VA, IoT, nested (Qualys), and legacy recommendations have no Azure ... | Inform customer that these recommendations cannot be exempted/enforced via Azure Policy. Workarou... | 🔵 6.0 | OneNote |
| 140 ⚠️ | AWS/GCP recommendations not visible after onboarding via legacy classic connector | Sync delay: Security Hub/Config Rules/GCP SCC recently enabled takes up to 1 day. | Wait 10min initial. If Security Hub recently enabled wait 1 day. Legacy connector deprecated Sep ... | 🔵 6.0 | ADO Wiki |
| 141 ⚠️ | Recommendations still show N/A risk level despite CSPM being recently enabled | Risk calculation job has not yet run on the tenant data after CSPM enablement | Check the risk calculation job dashboard (filter by subscription); wait for the job to complete a... | 🔵 6.0 | ADO Wiki |
| 142 ⚠️ | MDAV scheduled quick scan not running even though configured | ScanParameters set to 2 (Full Scan) overrides quick scan schedule; or ScheduledQuickScanTime set ... | Set ScanParameters to 1 for Quick Scan; set ScheduleQuickScanTime to desired time (minutes past m... | 🔵 6.0 | MS Learn |
| 143 ⚠️ | Defender for Cloud Apps policy automatically disabled with error: The policy was automatically di... | Objects referenced in the policy (IP tags, custom sensitive types) were deleted from Defender for... | Edit the policy and fix configuration errors: remove deleted objects from policy filters, simplif... | 🔵 6.0 | MS Learn |
| 144 ⚠️ | Defender for Containers: missing recommendations for AKS | Azure Policy add-on not enabled, initial assessment up to 24h, agentless discovery disabled, or t... | Enable Azure Policy add-on; wait 24h; enable agentless discovery; check tags | 🔵 6.0 | MS Learn |
| 145 ⚠️ | MDE onboarding SenseIsRunning compliant but OrgId/OnboardingState non-compliant (or vice versa) | Case 1: OOBE not completed; Case 2: delayed start causes non-compliance report during DM session | Case 1: wait for OOBE; Case 2: auto-resolves within 24 hours; ensure onboarding/offboarding polic... | 🔵 6.0 | MS Learn |
| 146 ⚠️ | Remediated attack path still appears in Defender for Cloud attack path analysis list after fixing... | Attack path analysis requires up to 24 hours to refresh and remove resolved attack paths from the... | Wait up to 24 hours for the resolved attack path to be removed. This is expected behavior. Verify... | 🔵 6.0 | MS Learn |
| 147 | Defender for Cloud recommendation 'EDR configuration issues should be resolved on virtual machine... | The ForceDefenderPassiveMode registry key (under HKLM:\SOFTWARE\Policies\Microsoft\Windows Advanc... | Set ForceDefenderPassiveMode to 0 in both registry paths: Set-ItemProperty -Path 'HKLM:\SOFTWARE\... | 🔵 5.5 | ADO Wiki |
| 148 ⚠️ | Web content filtering policy not taking effect - up to 2 hours delay; blocking Uncategorized cate... | Inherent 2-hour latency for policy propagation. Uncategorized only covers newly registered + park... | Wait up to 2h for propagation. Avoid blocking Uncategorized. Additional delay when changing devic... | 🔵 5.0 | MS Learn |
