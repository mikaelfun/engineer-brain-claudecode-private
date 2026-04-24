# VM Azure Image Builder (AIB) — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 11 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AIB build fails early with NoCustomizerScript provisioning error code. No customization.log file is  | Azure Policy restricts creation of AIB staging resources (IT_ staging resource g | Check subscription-level Operations tab in ASC, filter by resource group to find | 🔵 7.5 | AW |
| 2 | AIB build times out or fails before AIB timeout period is reached. Customization.log shows: Future#W | GitHub Actions OpenID token expires or GitHub Action is misconfigured, causing t | Redirect customer to GitHub support (https://support.github.com). Contact CSAM t | 🔵 7.5 | AW |
| 3 | AIB build fails early with NoCustomizerScript error code. No customization.log file is created. ASC  | Azure Policy restricts creation of necessary AIB staging resources (IT_ staging  | Check subscription Operations tab filtered by the image template resource group  | 🔵 7.5 | AW |
| 4 | AIB errorHandling property does not work or is not recognized in image template configuration. | API version is below 2022-07-01 (minimum required for errorHandling), or propert | Ensure API version >= 2022-07-01. Use exact spelling errorHandling with correct  | 🔵 7.5 | AW |
| 5 | AIB isolated image build with BYO subnet completes without errors, but auto-generated VNET/network r | New-AzImageBuilderTemplate PowerShell cmdlet does not support the apiVersion pro | Use custom ARM template deployment via Azure Portal or REST API instead of New-A | 🔵 6.5 | AW |
| 6 | AIB Isolated Image build completes without errors, but auto-generated VNET and network resources are | New-AzImageBuilderTemplate PowerShell cmdlet does not support the apiVersion pro | Use custom ARM template deployment via Azure Portal or REST API instead of New-A | 🔵 6.5 | AW |
| 7 | AIB start build fails with PurchasePlanNotProvided error when using Third-party Azure Marketplace im | PlanInfo is incorrectly defined as a standalone property instead of inside the S | Move PlanInfo inside the Source property in the ARM template. If issue persists, | 🔵 6.5 | AW |
| 8 | AIB start build fails with Error setting up networking pipeline for communication with build VM when | Azure Virtual Machine Image Builder service principal is missing Contributor rol | Use correlationId from Activity Logs to trace error via AIB Kusto (azcrp.kusto.w | 🔵 6.5 | AW |
| 9 | AIB start build fails with Provided staging resource group may be used by another image template Con | Staging RG has tags imageTemplateResourceGroupName and imageTemplateName from a  | Remove the existing imageTemplateResourceGroupName and imageTemplateName tags fr | 🔵 6.5 | AW |
| 10 | AIB provisioning fails with PrivateLinkService Network Policy is not disabled for the given subnet w | Subnet has privateLinkServiceNetworkPolicies set to Enabled. Azure Portal only e | Disable via CLI (cannot be done via Portal): az network vnet subnet update --nam | 🔵 6.5 | AW |
| 11 | VMs created from custom image with CIS security hardening stuck at 'creating' until provisioning tim | CIS security hardening rule 1.1.1.6 disables UDF filesystem driver. Azure requir | 1) If image already captured: enable UDF by commenting 'install udf /bin/true' i | 🔵 5 | ON |

## 快速排查路径

1. **AIB build fails early with NoCustomizerScript provisioning error code. No custom**
   - 根因: Azure Policy restricts creation of AIB staging resources (IT_ staging resource group, storage account). Policy deny acti
   - 方案: Check subscription-level Operations tab in ASC, filter by resource group to find policy deny actions. Identify blocking Azure Policy. Customer must up
   - `[🔵 7.5 | AW]`

2. **AIB build times out or fails before AIB timeout period is reached. Customization**
   - 根因: GitHub Actions OpenID token expires or GitHub Action is misconfigured, causing the authentication context to time out be
   - 方案: Redirect customer to GitHub support (https://support.github.com). Contact CSAM to re-route the case. Verify with customer they are using GitHub Action
   - `[🔵 7.5 | AW]`

3. **AIB build fails early with NoCustomizerScript error code. No customization.log f**
   - 根因: Azure Policy restricts creation of necessary AIB staging resources (IT_ staging resource group, storage account for logs
   - 方案: Check subscription Operations tab filtered by the image template resource group (includes IT_ staging RG). Identify the Azure Policy causing deny acti
   - `[🔵 7.5 | AW]`

4. **AIB errorHandling property does not work or is not recognized in image template **
   - 根因: API version is below 2022-07-01 (minimum required for errorHandling), or property name is misspelled. AIB service is cas
   - 方案: Ensure API version >= 2022-07-01. Use exact spelling errorHandling with correct camelCase. Values: onCustomizerError and onValidationError, each accep
   - `[🔵 7.5 | AW]`

5. **AIB isolated image build with BYO subnet completes without errors, but auto-gene**
   - 根因: New-AzImageBuilderTemplate PowerShell cmdlet does not support the apiVersion property, causing requests with older API v
   - 方案: Use custom ARM template deployment via Azure Portal or REST API instead of New-AzImageBuilderTemplate cmdlet, specifying API version 2024-02-01 or lat
   - `[🔵 6.5 | AW]`

