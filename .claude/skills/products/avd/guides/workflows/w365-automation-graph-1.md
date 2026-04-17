# AVD W365 Graph API 自动化 (Part 1) — 排查工作流

**来源草稿**: ado-wiki-a-automation-solutions.md, ado-wiki-cloudpc-retargeting-oce-api.md, ado-wiki-w365-power-state-events-query.md
**Kusto 引用**: (无)
**场景数**: 12
**生成日期**: 2026-04-07

---

## Scenario 1: Supportability
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Procedure: Apps & Infra: PowerShell and Azure CLI support scenarios](https://internal.evergreen.microsoft.com/en-us/topic/0c41b3aa-3efc-422d-6a21-710bcd5f1499#bkmk_arm_templates_terraform_issues)
   - [Support scope and collaboration scenarios with ARM team](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/AzureDev/401912/Support-scope-and-collaboration-scenarios?anchor=terraform)

## Scenario 2: Cloud Academy
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Azure Bicep: Flexing Your Infrastructure-as-Code Muscles](https://platform.qa.com/learning-paths/azure-bicep-learning-path-3692/)
   - [Azure Developer ARM Specialist – What is Azure Bicep?](https://platform.qa.com/resource/azure-developer-arm-specialist-what-is-azure-bicep-1854-28072022054438/)
   - [Azure Developer ARM Specialist – Create your First Bicep Template](https://platform.qa.com/resource/azure-developer-arm-specialist-create-your-first-bicep-template-1854-28072022165445/)
   - [CSS Training: Bicep Templates Support for Repositories](https://platform.qa.com/resource/css-training-bicep-templates-support-for-repositories-1854/)

## Scenario 3: Public Docs
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Terraform on Azure documentation](https://learn.microsoft.com/en-us/azure/developer/terraform/)
   - [Troubleshoot common problems when using Terraform on Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/troubleshoot)

## Scenario 4: ARM Support Team Documentation
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Terraform Support Boundaries](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1997098/Terraform-Support-Boundaries)
   - [Terraform Support Structure](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495739/Terraform-Support-Structure_Deploy)
   - [Terraform Workflow](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495738/Terraform-Workflow_Deploy)
   - [Terraform Training](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495726/Terraform-Training_Deploy)

## Scenario 5: HashiCorp Resources
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Get Started – Azure Tutorials](https://developer.hashicorp.com/terraform/tutorials/azure-get-started)
   - [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language)
   - [Terraform Provider for ARM (GitHub)](https://github.com/hashicorp/terraform-provider-azurerm)
   - [Terraform Community](https://www.terraform.io/)

## Scenario 6: Engineering Hub
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Terraform Onboarding](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-cli-tools-azure-cli-powershell-and-terraform/azure-cli-tools/onboarding/terraform/overview)
   - [Terraform Development Guides](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-cli-tools-azure-cli-powershell-and-terraform/azure-cli-tools/devguide/terraform)
   - [Terraform Troubleshooting Guides](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-cli-tools-azure-cli-powershell-and-terraform/azure-cli-tools/tsgs/terraform)

## Scenario 7: Forum
> 来源: ado-wiki-a-automation-solutions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Terraform Forum (Stack Overflow for Microsoft)](https://stackoverflow.microsoft.com/posts/tagged/17224)

## Scenario 8: JIT Access Preparation
> 来源: ado-wiki-cloudpc-retargeting-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Enroll in SaaF Tours if not Torus enrolled
2. Join **CMDCPCSupport** eligibility in OSP Identity (8 hour provisioning)
3. JIT elevate (4 hour access): `Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"`
4. **[SAW Enforced]** Navigate to Geneva Action portal > CloudPC OCE > Provision Actions > Trigger generic action by SaaF

## Scenario 9: 1. Prepare OCE API parameters
> 来源: ado-wiki-cloudpc-retargeting-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Device ID** + **Tenant ID**: from Kusto query below
   - **Request ID**: randomly generated GUID
   - **Action Type**: `1`
```kql
let GetDataFrom = (clusterName:string) {
  cluster(clusterName).database('WVD').RDAgentMetadata
  | join kind=leftouter (cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV)
    on $right.DeviceResourceId == $left.AzureResourceId
  | where HostInstance contains "<Managed Device Name>"
  | top 1 by Timestamp desc
  | project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom('rdsprodgb.uksouth')
```
`[来源: ado-wiki-cloudpc-retargeting-oce-api.md]`

## Scenario 10: 2. Customer Lockbox approval
> 来源: ado-wiki-cloudpc-retargeting-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```powershell
Request-ElevatedAccess_V2.ps1 -Role AccessToCustomerData -Reason "CloudPC Retargeting - ICM number" -Tenant [TenantId] -RequestNumber [CaseNumber] -DurationHours 4
```
If customer has lockbox enabled, they must also approve. Approvals tracked via email.

## Scenario 11: Query
> 来源: ado-wiki-w365-power-state-events-query.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let CheckPowerActions = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where Day1 > Day2
| where env_time between (ago(Day1)..ago(Day2))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where * has CompanyID and Col1 !has "Device not Onboarded"
| where ApplicationName has_any ("prov-function","SchdlrFunction", "schdlr", "RMFunction")
| where ServiceName != "HermesService"
| where Col1 contains "CloudPCPowerStatusChanged"
| parse kind = regex flags = Ui Col1 with * "\\"resourceID\\":" WorkspaceID ',' *
| parse kind = regex flags = Ui Col1 with * "\\"Action\\":" Action ',' *
| parse kind = regex flags = Ui Col1 with * "\\"Reason\\":" Reason ',' *
| where WorkspaceID contains "<WorkspaceID>"
| project env_time, ActivityId, ComponentName, EventUniqueName, Action, Reason, WorkspaceID, Col1, OtherIdentifiers
| order by env_time desc
};
CheckPowerActions('<TenantID>', 15d, 0d)
```
`[来源: ado-wiki-w365-power-state-events-query.md]`

## Scenario 12: Usage
> 来源: ado-wiki-w365-power-state-events-query.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Replace `<WorkspaceID>` with target Cloud PC workspace ID
   - Replace `<TenantID>` with customer tenant ID
   - Adjust timespan parameters as needed
