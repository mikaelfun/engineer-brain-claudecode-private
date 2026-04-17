# Defender MDC 安全建议与合规 — 排查工作流

**来源草稿**: ado-wiki-a-assessment-ibiza-not-scc.md, ado-wiki-a-assessment-status-logic.md, ado-wiki-a-azure-policy-vs-management-recommendations.md, ado-wiki-a-custom-recommendations.md, ado-wiki-a-enforce-deny-recommendations.md, ado-wiki-a-governance-kusto-queries-r2.md, ado-wiki-a-guest-config-recommendation-discrepancy-tsg.md, ado-wiki-a-policy-selectors-and-overrides.md, ado-wiki-a-recommendation-exemption-product-knowledge.md, ado-wiki-a-recommendation-ga-transition.md, ado-wiki-a-recommendations-automated-remediation-scripts.md, ado-wiki-a-recommendations-escalation-workflow.md, ado-wiki-a-recommendations-for-vmss.md, ado-wiki-a-recommendations-policy-types.md, ado-wiki-a-recommendations-wrong-status.md, ado-wiki-a-running-container-vulnerability-assessment.md, ado-wiki-a-security-azure-policy-tips.md, ado-wiki-a-who-when-created-recommendation-exemption.md, ado-wiki-b-tsg-secure-score.md, onenote-mfa-recommendation-kusto-tsg.md, onenote-recommendations-not-managed-by-policy.md, onenote-security-assessment-tools.md
**场景数**: 18
**生成日期**: 2026-04-07

---

## Scenario 1: JIT requests (JIT - Overview)
> 来源: ado-wiki-a-assessment-ibiza-not-scc.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
Get_Current_Raw_TenantStampLocationMapping_1_0_0
| where TenantId == {TENANT_ID}
| project TenantId, StampUri
```

**查询 2:**
```kusto
Get_Current_View_RecommendationGridResource_0_0_17
| where Id has {ASSESSMENT_ID}
```

**查询 3:**
```kusto
Get_Current_View_RecommendationsWithAssets_0_0_1
| where AssessmentId has {ASSESSMENT_ID}
```

**查询 4:**
```kusto
Get_Current_Raw_Assessments_1_0_0
| where AssessmentId has {ASSESSMENT_ID}
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: How to Differentiate Between Azure Policy and Management Recommendations (and Exemptions)
> 来源: ado-wiki-a-azure-policy-vs-management-recommendations.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Copy the name/guide of the recommendation you want to check
2. Go to the Modeller repository
3. Use the repository search function to look for the recommendation name / key
4. Check the results for a Json file, usually under RawBuiltinMetadata directory:
5. You should find the assessment in there

### Portal 导航路径
- the Modeller repository

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: Microsoft Defender for Cloud Custom Recommendations Management
> 来源: ado-wiki-a-custom-recommendations.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 4: Emails (Governance Kusto Queries R2)
> 来源: ado-wiki-a-governance-kusto-queries-r2.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "GovernanceEmailManager-EnrichEmailAsync"
        or operationName has "GovernanceEmailManager-SendEmailAsync"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| where subscriptionId == "{SubscriptionId}"
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

**查询 2:**
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').TraceEvent 
| where env_time between (startTime..endTime)
| where tagId has "SendEmailAsync" or tagId has "EnrichEmailAsync"
```

**查询 3:**
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "CreateOrUpdateGovernanceAssignmentByAssignmentKey"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

**查询 4:**
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "CreateOrUpdateGovernanceRuleSingle"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

**查询 5:**
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "GovernanceRuleExecuteSingle"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

---

## Scenario 5: How to Troubleshoot Guest Config Recommendation Result Discrepancy Issues
> 来源: ado-wiki-a-guest-config-recommendation-discrepancy-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Guest Configuration** - Responsible for the assessment logic.
2. **Azure Policy** - Evaluates the assessment results provided by Guest Assignments.
3. **Microsoft Defender for Cloud** (MDC) - Categorizes resources as healthy, unhealthy, or not applicable based on policy compliance status.
4. If the GuestAssignment is missing after confirming steps 1 and 2, **involve the Guest Config team for further assistance**.
5. If GuestAssignment is non-compliant, review the reason and ensure remediation steps are followed.
6. If settings are correct but GuestAssignment remains non-compliant, **involve the Guest Config team**.
7. If GuestAssignment is compliant but policy shows non-compliance, **involve the Policy team**.
8. If both GuestAssignment and Azure Policy are compliant but Microsoft Defender for Cloud shows unhealthy status, refer to [[Troubleshooting Guide] - Recommendations showing wrong status](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1456/-TSG-Recommendations-showing-wrong-status) to submit an Incident Case Management (ICM).

### Kusto 诊断查询
**查询 1:**
```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| where properties contains "/providers/Microsoft.Authorization/policyDefinitions/<DefinitionID>" //Policy Definition ID.
| where properties contains "<Resource ID>"
| project resourceName = tostring(split(tolower(extract("(.*)/providers/microsoft.policyinsights",1, id)),"/")[-1]), Initiative = properties.policyDefinitionGroupNames, Status = properties.complianceState
```

**查询 2:**
```kusto
GuestConfigurationResources
| where id contains "<Resource ID>"
| where name contains "<GuestAssignmentName>"
| project resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.GuestConfiguration",1, id)),"/")[-1]), AssignmentName = name, Status = properties.complianceStatus, lastComplianceStatusChecked = properties.lastComplianceStatusChecked
```

**查询 3:**
```kusto
resources
    | where type == "microsoft.compute/virtualmachines/extensions"
    | extend publisher = properties.publisher
    | where publisher == "Microsoft.GuestConfiguration"
    | extend provisioningState = properties.provisioningState
    | project id, name, publisher, type, provisioningState
```

**查询 4:**
```kusto
resources
    | where type == "microsoft.compute/virtualmachines"
    | project name, identity.type, id
```

**查询 5:**
```kusto
GuestConfigurationResources
    | project resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.GuestConfiguration",1, id)),"/")[-1]), AssignmentName = name, Status = properties.complianceStatus, lastComplianceStatusChecked = properties.lastComplianceStatusChecked, properties
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 6: Policy Selectors and Overrides
> 来源: ado-wiki-a-policy-selectors-and-overrides.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Selectors** - specifies definition version or policyDefinitionReferenceIDs for policy set definition. Can also specify location or type of resource to evaluate (currently out of scope for MDC).
2. **Overrides** - specifies definition version or policy effect (can be mixed with selectors).
3. **Versioning** - specifies version for policy definition and policy set. Will be supported within MDC post Ignite event.
4. **If overrides exist** on the assignment:
5. **If parameter exists** on the assignment:
6. **If neither overrides nor parameter exists**:

### Kusto 诊断查询
**查询 1:**
```kusto
// Input: Subscription id and assignment name
policyresources
| where type == "microsoft.authorization/policyassignments"
| where id contains "<INSERT Subscription id>"
| where name == "<INSERT assignment name>"
```

**查询 2:**
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

**查询 3:**
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

**查询 4:**
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

**查询 5:**
```kusto
// Input: Policy definition id
   policyresources
   | where type == "microsoft.authorization/policydefinitions"
   | where id contains "<INSERT Policy definition id>"
   | take 1
   | extend defaultEffect = properties.parameters.effect.defaultValue
   | project defaultEffect
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 7: Recommendation Exemption
> 来源: ado-wiki-a-recommendation-exemption-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Obtain the assignment ID of the Azure Security Benchmark/Microsoft Cloud Security Benchmark (MCSB) from the Azure Policy portal and the reference ID of the policy you want to exempt.
2. Navigate to Azure Policy -> Assignments -> Click "ASC Default/Microsoft Cloud Security Benchmark" -> Copy the **assignment ID** and the **Parameter ID** of the policy you want to exempt.

### Portal 导航路径
- Azure Policy -> Assignments -> Click "ASC Default/Microsoft Cloud Security Benchmark" -> Copy the **assignment ID** and the **Parameter ID** of the policy you want to exempt

### 脚本命令
```powershell
# Define variables for reuse
SUBSCRIPTION_ID="XXXXXXXXXXXXXXXXXXXX"
POLICY_ASSIGNMENT_ID="/subscriptions/$SUBSCRIPTION_ID/providers/Microsoft.Authorization/policyAssignments/XXXXXXXXXXXXX"
EXEMPTION_NAME="TESTExemption"
POLICY_DEFINITION_REFERENCE_ID="gcWindowsDiskEncryptionMonitoring"
EXEMPTION_CATEGORY="Waiver"
DISPLAY_NAME="TEST-MDC-Windows virtual machines should enable Azure Disk Encryption or EncryptionAtHost."
DESCRIPTION="Test"
EXPIRES_ON="2025-02-27T08:00:00Z"

# Create the policy exemption using Azure Command-Line Interface
az policy exemption create \
  --name "$EXEMPTION_NAME" \
  --policy-assignment "$POLICY_ASSIGNMENT_ID" \
  --exemption-category "$EXEMPTION_CATEGORY" \
  --policy-definition-reference-ids "$POLICY_DEFINITION_REFERENCE_ID" \
  --display-name "$DISPLAY_NAME" \
  --description "$DESCRIPTION" \
  --scope "/subscriptions/$SUBSCRIPTION_ID" \
  --expires-on "$EXPIRES_ON"
```

```powershell
# Define variables for reuse
SUBSCRIPTION_ID="XXXXXXXXXXXXXXXXXXXX"
RESOURCE_GROUP="yourResourceGroupName" # Replace with your actual resource group name 
VM_NAME="ADFS01" # Replace with your actual virtual machine name
POLICY_ASSIGNMENT_ID="/subscriptions/$SUBSCRIPTION_ID/providers/Microsoft.Authorization/policyAssignments/XXXXXXXXXXXXX"
EXEMPTION_NAME="TESTExemption"
POLICY_DEFINITION_REFERENCE_ID="gcWindowsDiskEncryptionMonitoring"
EXEMPTION_CATEGORY="Waiver"
DISPLAY_NAME="TEST-MDC-Windows virtual machines should enable Azure Disk Encryption or EncryptionAtHost."
DESCRIPTION="Test"
EXPIRES_ON="2025-02-27T08:00:00Z"

# Create the policy exemption using Azure Command-Line Interface
az policy exemption create \
  --name "$EXEMPTION_NAME" \
  --policy-assignment "$POLICY_ASSIGNMENT_ID" \
  --exemption-category "$EXEMPTION_CATEGORY" \
  --policy-definition-reference-ids "$POLICY_DEFINITION_REFERENCE_ID" \
  --display-name "$DISPLAY_NAME" \
  --description "$DESCRIPTION" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Compute/virtualMachines/$VM_NAME" \
  --expires-on "$EXPIRES_ON"
```

---

## Scenario 8: Overview (Recommendation Ga Transition)
> 来源: ado-wiki-a-recommendation-ga-transition.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- in [[ADX Web](https://dataexplorer

### Kusto 诊断查询
**查询 1:**
```kusto
letRecommendationName="Storageaccountsshouldrestrictnetworkaccessusingvirtualnetworkrules";  
cluster('RomeTelemetryData.kusto.windows.net').database('RomeTelemetryProd').AssessmentsNonAggregatedStatusSnapshot  
|whereTimestamp>=ago(30d)  
|whereAssessmentsDisplayName==RecommendationName  
|summarize  
FirstPreview=minif(Timestamp,ReleaseState=="Preview"),  
FirstGA=minif(Timestamp,ReleaseState=="GA")  
byAssessmentsDisplayName  
|whereisnotempty(FirstPreview)andisnotempty(FirstGA)  
|whereFirstPreview<FirstGA  
|projectAssessmentsDisplayName,PreviewSince=FirstPreview,GATransition=FirstGA
```

---

## Scenario 9: Troubleshooting Guide for Recommendations automated remediation scripts
> 来源: ado-wiki-a-recommendations-automated-remediation-scripts.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Navigate to the recommendation** in the Defender for Cloud portal.
2. **Click the "Fix" button** — this generates the automated remediation script specific to that recommendation.
3. **Copy the generated script(s)**.
4. **Follow the remediation steps** provided in the recommendation and execute the script in the appropriate environment.
5. **Repeat for each recommendation** — every recommendation will have its own script and steps.

### Portal 导航路径
- the recommendation** in the Defender for Cloud portal

### 脚本命令
```powershell
# Remove all the public ACLs
gsutil iam ch -d allUsers:objectViewer gs://<bucket-name>
gsutil iam ch -d allUsers:objectAdmin  gs://<bucket-name>
```

---

## Scenario 10: Defender for Cloud Recommendations Escalation Workflow
> 来源: ado-wiki-a-recommendations-escalation-workflow.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Subscription and Session ID
2. Assessment(s) Key
3. Output of the recommendation(s) from ARG
4. All evidence collected from investigation steps
5. Kusto query results:
6. Get information about the recommendation:
7. Identify the Recommendation/policy/assessment provider:
8. Find team to escalate to using ServiceTreeId:
9. Fallback if nothing returns:
10. Check policy assignment status under Security Center > Security Policy
11. Check Policy assignment and compliance status of assigned initiative
12. Verify Azure Security Benchmark (ASB) is the default policy initiative
13. If customer disabled ASB: recommend keeping it assigned and disabling unwanted policies within it
14. At least one initiative must be assigned

### Portal 导航路径
- MDC portal > Recommendations, search the recommendation
- query" to get the ARG query

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
  | where type == "microsoft.security/assessments"
  | where subscriptionId == "{subscriptionId}"
```

**查询 2:**
```kusto
cluster('RomeTelemetryData.kusto.windows.net').database('RomeTelemetryProd').AssessmentsNonAggregatedStatusSnapshot
   | where SubscriptionId == "{subscriptionId}"
   | extend AssessedResourceName = split(AssessedResourceId, "/")[-1], AssessedResourceType = split(AssessedResourceId, "/")[-2]
   | summarize arg_max(Timestamp, *) by AssessedResourceId
   | project Timestamp, AssessmentKey, AssessmentsDisplayName, ReleaseState, AssessedResourceName, AssessedResourceType, StatusCode, StatusCause, StatusDescription, StatusChangeDate, FirstEvaluationDate, AssessedResourceId
```

**查询 3:**
```kusto
cluster('Rometelemetrydata').database('RomeTelemetryProd').RecommendationsData(31d,0d)
   | where AssessmentDisplayName has "{recommendation_name}"
```

**查询 4:**
```kusto
cluster('Icmcluster').database('IcmDataWarehouse').GetDim_ServiceTree_ServiceOid()
   | where ServiceOid == "{ServiceTreeId}"
   | join kind=inner (cluster('Icmcluster').database('IcmDataWarehouse').TeamsSnapshot(true)) on TeamId
```

**查询 5:**
```kusto
cluster('Icmcluster').database('IcmDataWarehouse').GetServiceOid()
   | where ServiceOid == "{ServiceTreeId}"
   | where TeamGroupName != ""
   | project DivisionName, TenantName, TenantId, TeamGroupName, ServiceGroupName, ServiceName, PmOwnerAlias, DevOwnerAlias, PublicTeamId, ManageTeamsLink
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 11: Recommendations Policy Types
> 来源: ado-wiki-a-recommendations-policy-types.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Control Plane** - Policy defines logic, monitors resource, updates compliance status
2. **Data Plane** - MDC services assess and send compliance status to the mirrored policy
3. **Policy Data Plane** - Hybrid approach

### Portal 导航路径
- the Modeler

---

## Scenario 12: Overview (Recommendations Wrong Status)
> 来源: ado-wiki-a-recommendations-wrong-status.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Control plane recommendations-** In this case, we are creating recommendations on top of Policy by taking Policy compliance and converting it into recommendations in such a way that non-compliant status becomes unhealthy, and compliant becomes healthy.
2. **Data plane recommendations-** In this case, the recommendations are calculated and pushed directly to Microsoft Defender for Cloud (MDC) by external partners.
3. Start by checking if the status is consistent between Policy and Microsoft Defender for Cloud (MDC). (You can use the query below)
4. Check if the job that generates recommendations on top of Policy completed successfully. It should run one time every 12 hours.
5. If the issue is a deleted resource- the ticket should be transferred to the Azure policy team to check why they generate compliance results on deleted resource
6. The relevant assessment key for your recommendation
7. The relevant policy definition Id for your recommendations
8. The problematic resource name
9. Active/Inactive known limitation:

### Portal 导航路径
- Azure Portal, and search for "Azure Resource Graph"

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type == "microsoft.security/assessments"
| where subscriptionId == "<ADD-HERE-SUBSCRIPTION-ID>"
| where name == "ADD-HERE-ASSESSMENT-KEY" 
| where id contains "<ADD-HERE-RESOURCE-NAME>"
| extend resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.Security",1, id)),"/")[-1])
| extend statusInMdc = properties.status.code
| project resourceName, statusInMdc
| join
(
policyresources
| where type == "microsoft.policyinsights/policystates"
| where subscriptionId == "<ADD-HERE-SUBSCRIPTION-ID>"
| where * contains "ADD-HERE-POLICY-DEFINITION-ID"
| where id contains "<ADD-HERE-RESOURCE-NAME>"
| extend resourceName = tostring(split(tolower(extract("(.*)/providers/microsoft.policyinsights",1, id)),"/")[-1])
| extend statusInPolicy = properties.complianceState
| extend policyAssignmentScope = tostring(properties.policyAssignmentScope)
| extend policyAssignmentId = tostring(properties.policyAssignmentId)
| project resourceName, statusInPolicy, policyAssignmentScope, policyAssignmentId
) on resourceName
//Remove comment from below to find policy "policyAssignmentScope, policyAssignmentId"
| project resourceName, statusInMdc, statusInPolicy//, policyAssignmentScope, policyAssignmentId
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 13: Running Container Images Vulnerability Assessment
> 来源: ado-wiki-a-running-container-vulnerability-assessment.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Registry access** must be enabled for:
2. **External registries** require specific setup:
3. Ensure the image exists in the Container Registry and has scan results in the prerequisite recommendation.
4. **Defender Sensor (Defender pods)** must be running on the AKS cluster or have K8S API access enabled.
5. Ensure the image is **supported** by the VA scanner:
6. **Image stopped running** on AKS cluster → recommendation deleted after ~24h of inactivity
7. **Image still running** but on a different container/pod → recommendations updated hourly, reflected within ~2h

### Kusto 诊断查询
**查询 1:**
```kusto
union cluster('ascprodeupartners.uksouth.kusto.windows.net').database('ProdRawEvents').K8S_Pods,
cluster('ascproduspartners.eastus.kusto.windows.net').database('ProdRawEvents').K8S_Pods
| where AzureResourceId == "<AKS_RESOURCE_ID>"
| extend containerStatuses = todynamic(Status.containerStatuses)
| mv-expand containerStatuses
| extend ImageId = tostring(containerStatuses.['imageID'])
| extend ImageState = bag_keys(containerStatuses.['state'])[0]
| where ImageId contains "<IMAGE_DIGEST_OR_NAME>"
| project AzureResourceId, Spec, ImageId, ImageState
| take 5
```

**查询 2:**
```kusto
union cluster('ascprodeupartners.uksouth.kusto.windows.net').database('ProdRawEvents').K8S_Pods,
cluster('ascproduspartners.eastus.kusto.windows.net').database('ProdRawEvents').K8S_Pods
| where * contains "{imageDigest}"
| extend containerStatuses = todynamic(Status.containerStatuses)
| mv-expand containerStatuses
| extend ImageId = tostring(containerStatuses.['imageID'])
| extend ImageState = bag_keys(containerStatuses.['state'])[0]
| project AzureResourceId, Spec, ImageId, ImageState
| take 5
```

---

## Scenario 14: Security Azure Policy - TIPS
> 来源: ado-wiki-a-security-azure-policy-tips.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to Azure > Policy > Compliance > ASC Default policy
2. Check **Last Evaluated** on any policies with resources
3. Use Azure RM PowerShell to force a new policy scan:
4. Download the PCE ZIP file from https://github.com/prchanda/pce/releases
5. Extract the ZIP file and locate the PCE application
6. Open CMD, navigate to the folder and run:

### Portal 导航路径
- Azure > Policy > Compliance > ASC Default policy
- CMD, navigate to the folder and run:

### 脚本命令
```powershell
# Force on-demand policy compliance scan
$job = Start-AzPolicyComplianceScan -AsJob
$job  # Check status
```

```powershell
# Subscription scope evaluation
pce.exe -s "91897ffb-xxxx-xxxx-xxxx-4bb03c62ca8b"

# Resource Group scope evaluation
pce.exe -s "91897ffb-xxxx-xxxx-xxxx-4bb03c62ca8b" -rg "<RG Name>"
```

---

## Scenario 15: Possible Scenarios
> 来源: ado-wiki-a-who-when-created-recommendation-exemption.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Azure Policy-based Recommendations**
2. **Security Standard-based Recommendations**
3. Navigate to **Defender for Cloud** > **Recommendations** > **Classic View** > Select the relevant recommendation > **Not Applicable Resources** > Click the **"..."** on the right side > **Manage Exemption**.
4. Gather the following information:

### Portal 导航路径
- the **[Defender for Cloud - Recommendations Dashboard](https://dataexplorer
- **Defender for Cloud** > **Recommendations** > **Classic View** > Select the relevant recommendation > **Not Applicable Resources** > Click the **"

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources

| where type == "microsoft.security/standardassignments"

| where properties.effect == "Exempt"

| extend type = "MDC"

| extend exemptionId = name

| extend exemptionDisplayName = tostring(properties.displayName)

| extend description = tostring(properties.description)

| extend category = tostring(properties.exemptionData.exemptionCategory)

| extend scope = split(id, "/providers/Microsoft.Security/standardAssignments/")[0]

| extend assessmentKey = tostring(properties.exemptionData.assessmentKey)

| extend isSingleRecommendation = iff(assessmentKey != "00000000-0000-0000-0000-000000000000", true, false)

| extend isIdentityBased = iff(scope contains "providers/Microsoft.Security/pricings/CloudPosture/securityentitydata", true, false)

| extend recommendations = iff(

    isSingleRecommendation,

    pack_array(assessmentKey),

    iff(

      isnotempty(properties.exemptionData.subAssessmentExemptionRule.if.allOf[0].operation.values),

      properties.exemptionData.subAssessmentExemptionRule.if.allOf[0].operation.values,

      iff(

        isnotempty(properties.exemptionData.subAssessmentExemptionRule.if.anyOf[0].operation.values),

        properties.exemptionData.subAssessmentExemptionRule.if.anyOf[0].operation.values,

        dynamic([])

      )

    )

  )

| extend numRecommendations = array_length(recommendations)

| project id, name, type, subscriptionId, exemptionDisplayName, description, category, scope, assessmentKey, isSingleRecommendation, isIdentityBased, recommendations, numRecommendations

//| where exemptionDisplayName contains "name" // Follow Step A to get it.

//| where assessmentKey contains "<assessmentKey>" // Follow Step 1 to get it.
```

### API 端点
```
GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{management-group-name}/providers/Microsoft.Security/standardAssignments/{exemption-id}?api-version=2024-08-01
```
```
GET https://management.azure.com/subscriptions/{subscription-id}/providers/Microsoft.Security/standardAssignments/{exemption-id}?api-version=2024-08-01
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 16: Secure Score
> 来源: ado-wiki-b-tsg-secure-score.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Ensure continuous export is configured for secure score (Portal: Defender for Cloud > Environment Settings > Subscription > Continuous Export)
2. Note the Log Analytics Workspace parameters used in continuous export
3. Check data in the workspace: run `SecureScore` and `SecureScoreControls` queries
4. **If no data in LAW** → issue is with continuous export, not secure score — reroute ticket accordingly
5. **If data in LAW but workbook wrong** → secure score team issue (provide exact row examples from LAW vs workbook)
6. **Custom Initiative recommendations** — only built-in recommendations affect score
7. **Preview Recommendations** — excluded until preview period ends
8. **Disabled recommendations** — disabled via Default Security Policy don't affect score
9. **Exempted resources** — resource exempted from a recommendation → not counted as unhealthy

### Kusto 诊断查询
**查询 1:**
```kusto
let subscriptionId = "<subscriptionId>";
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').SecureScoreV3ControlsScore
| where Timestamp > ago(3d)
| where SubscriptionId == subscriptionId
| where HealthyResources > 0 or UnhealthyResources > 0
| join kind=leftouter 
(
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').SecureScoreV3ControlsMetadata
) on ControlKey
| distinct ControlKey, MaxScore
```

**查询 2:**
```kusto
let _subscriptionId = '{subscriptionId}';
cluster("https://romelogs.kusto.windows.net").database('Prod').SubscriptionActivityQueryOE
| where env_time > ago(30d)
| where operationName == "GetSubscriptionActivityStatusAsync"
| project env_time, SubscriptionId, ActivityStatus
| where SubscriptionId == _subscriptionId
| summarize count() by ActivityStatus, bin(env_time,1d)
| render timechart
```

**查询 3:**
```kusto
let _subIds = "{subscriptionId}";
let _controlKey = '';
let _cloud = dynamic(['GCP']);
cluster('romecore').database('Prod').ServiceFabricDynamicOE
| where env_time > ago(1d)
| project env_time, operationName, resultType, customData
| where operationName == "CoreV2.TraceSecureScoreControlsData"
| extend customData = todynamic(customData)
| extend SubscriptionId = tostring(customData.SubscriptionId)
| where _subIds contains SubscriptionId
| extend ControlKey = tostring(customData.ControlKey)
| where isempty(_controlKey) or _controlKey contains ControlKey
| extend CurrentScore = todecimal(customData.CurrentScore)
| extend Weight = todecimal(customData.Weight)
| extend Percentage = todecimal(customData.Percentage)
| extend UnhealthyResources = todecimal(customData.UnhealthyResources)
| extend HealthyResources = todecimal(customData.HealthyResources)
| extend NotAvailableResources = todecimal(customData.NotAvailableResources)
| extend NotApplicableByPolicyResources = todecimal(customData.NotApplicableByPolicyResources)
| extend CalculationId = tostring(customData.CalculationId)
| extend Source = tostring(customData.Source)
| where isempty(['_cloud']) or Source in (['_cloud'])
```

**查询 4:**
```kusto
let _controlKey = '';
let _startTime = datetime(2025-01-01);
let _endTime = datetime(2025-07-01);
let _subId = "{subscriptionId}";
cluster('rometelemetrydata').database('RomeTelemetryProd').SecureScoreV3Assessments
| where Timestamp between (_startTime .. _endTime)
| where SubscriptionId == _subId
| where AssessmentKey in (
    cluster('rometelemetrydata').database('RomeTelemetryProd').SecureScoreV3ControlsMetadata
    | where _controlKey has ControlKey or isempty(_controlKey)
    | mv-expand Assessments
    | project AssessmentKey=tostring(Assessments))
| order by Timestamp asc
| project Timestamp, CalculationId, AssessmentKey, AssessmentDisplayName, HealthyResources, UnhealthyResources, NotApplicableResources, NotApplicableByPolicyResources
| order by Timestamp, AssessmentKey
| summarize take_any(*) by bin(Timestamp, 1d), AssessmentKey
| order by Timestamp asc
| summarize make_set(HealthyResources), HealthyResourcesDetails = bag_pack("HealthyResources", make_list(HealthyResources), "Date", make_list(Timestamp)), make_set(UnhealthyResources), UnHealthyResourcesDetails = bag_pack("UnhealthyResources", make_list(UnhealthyResources), "Date", make_list(Timestamp)), make_set(NotApplicableResources), NotApplicableResourcesDetails = bag_pack("NotApplicableResources", make_list(NotApplicableResources), "Date", make_list(Timestamp)), make_set(NotApplicableByPolicyResources), NotApplicableByPolicyResourcesDetails = bag_pack("NotApplicableByPolicyResources", make_list(NotApplicableByPolicyResources), "Date", make_list(Timestamp)) by AssessmentKey, AssessmentDisplayName
| where array_length(set_HealthyResources) > 1 or array_length(set_UnhealthyResources) > 1 or array_length(set_NotApplicableResources) > 1 or array_length(set_NotApplicableByPolicyResources) > 1
| project-away set_HealthyResources, set_NotApplicableByPolicyResources, set_NotApplicableResources, set_UnhealthyResources
```

**查询 5:**
```kusto
let _subIds = '{SubId}';
let _controlKey = '';
let _cloud = dynamic(['Azure']);
cluster('romecore').database('Prod').ServiceFabricDynamicOE
| where env_time > ago(1d)
| where operationName == "CoreV2.TraceSecureScoreControlsData"
| project env_time, operationName, resultType, customData
| extend customData = todynamic(customData)
| extend 
    SubscriptionId = tostring(customData.SubscriptionId),
    ControlKey = tostring(customData.ControlKey),
    CurrentScore = todecimal(customData.CurrentScore),
    Weight = todecimal(customData.Weight),
    Percentage = todecimal(customData.Percentage),
    UnhealthyResources = todecimal(customData.UnhealthyResources),
    HealthyResources = todecimal(customData.HealthyResources),
    NotAvailableResources = todecimal(customData.NotAvailableResources),
    NotApplicableByPolicyResources = todecimal(customData.NotApplicableByPolicyResources),
    CalculationId = tostring(customData.CalculationId),
    Maximo = todecimal(customData.MaxScore),
    Source = tostring(customData.Source)
| where _subIds contains SubscriptionId
| where isempty(_controlKey) or _controlKey contains ControlKey
| where isempty(_cloud) or Source in (_cloud)
| summarize 
    TotalScore = sum(CurrentScore), 
    MaximoTotal = sum(Maximo) 
    by CalculationId
| extend SecureScore = (TotalScore / MaximoTotal) * 100
| project _subIds, SecureScore
```

### API 端点
```
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/secureScores/{secureScoreName}?api-version=2020-01-01-preview
```
```
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/secureScores?api-version=2020-01-01-preview
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 17: MFA Recommendation Kusto Troubleshooting
> 来源: onenote-mfa-recommendation-kusto-tsg.md | 适用: Mooncake ✅

### Kusto 诊断查询
**查询 1:**
```kusto
let subscriptionId = "<SubscriptionId>";
let startTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between (startTime .. (startTime + 24h))
| where message contains subscriptionId
| where message contains "IdentityEnableMFAForAccountsWithPermissions"
    or message contains "Finshed assessing recommendation 'Enable MFA"
| project env_time, message
```

**查询 2:**
```kusto
let userOid = "<UserObjectId>";
let endTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between ((endTime - 5m) .. endTime)
| where message contains userOid
| project env_time, message
```

**查询 3:**
```kusto
let endTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between ((endTime - 5s) .. endTime)
| where tagId == "Microsoft.Azure.Security.Service.SecuritySubscriptionSnapshotter.Utils.IdentityUtils+Tracer::TraceInfo"
| where message startswith "Policy"
| parse message with policy:string '//// ' result:string
| parse result with * 'policyIncludesAzurePortal = ' policyIncludeAzurePortal
    'policyExcludesAzurePortal = ' policyExcludesAzurePortal
    ', policyEnforcesMfa = ' policyEnforcesMfa
    ', notEnforceMfaCauses = ' notEnforceMfaCauses
| project env_time, policyIncludeAzurePortal, policyExcludesAzurePortal, policyEnforcesMfa, notEnforceMfaCauses, policy
```

---

## Scenario 18: Security Assessment Tools & ASC Export Reference
> 来源: onenote-security-assessment-tools.md | 适用: Mooncake ✅

### 脚本命令
```powershell
# Prerequisites
# install-module -name Azure
# install-module -name Az.ResourceGraph

$subscriptionID = "<subscription-id>"
$outputfilepath = "C:\output"

Add-AzAccount -Environment AzureChinaCloud
Set-AzContext -SubscriptionID $subscriptionID

$query = "
securityresources
| where type == 'microsoft.security/assessments'
| extend displayName = properties.displayName,
         resourceId = properties.resourceDetails.Id,
         severity = properties.metadata.severity,
         code = properties.status.code,
         remediation = properties.metadata.remediationDescription
| where code == 'Unhealthy'
| order by severity
| project displayName, resourceId, severity, code, remediation
"

$outputfile = $outputfilepath + '\asc_report_' + (Get-Date -format "yyyyMMddhhmm") + '.csv'
$results = Search-AzGraph -Query $query
$results | Export-Csv -Path $outputfile -NoTypeInformation
```

---
