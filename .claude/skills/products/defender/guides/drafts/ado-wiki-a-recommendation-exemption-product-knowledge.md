---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/Recommendation Exemption/[Product Knowledge] - Recommendation Exemption"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2FRecommendation%20Exemption%2F%5BProduct%20Knowledge%5D%20-%20Recommendation%20Exemption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Recommendation Exemption

This page helps explain the resource exemption workflow and the difference between exemptions in Microsoft Defender for Cloud.

# What is Exemption?  
Exemptions allow customers to exempt recommendations from the secure score calculation, effectively marking unhealthy resources as not applicable.

## Motivation
Allow users to exempt a resource from the secure score or disable it by findings (for supported recommendations). This way, if a resource or a certain finding is non-relevant or cannot be resolved, you can still prevent it from negatively impacting your secure score.

## Architecture - behind the scenes

The exemption feature in Microsoft Defender for Cloud is based on the Exemption feature of Azure Policy. When a user creates an exemption in Microsoft Defender for Cloud, an exemption is created in Azure Policy.
![Exemption Workflow](/.attachments/image-437eef54-810f-4053-937a-309fe17ae410.png)

## Finding the Exemption in Azure Support Center
You can view existing exemptions in Azure Support Center - Resource Explorer - select the Subscription - Policy tab:  
![Policy Tab](/.attachments/image-3bcc3f9d-8dc1-42b9-ac95-83aa6d47fea5.png)  
Then scroll down to the Exemption box:  
![Exemption Box](/.attachments/image-fcbdc198-21ba-4756-92c7-339d131ad8ca.png)

![Exemption Workflow GIF](/.attachments/20210223_130119-fdcd3c58-89a1-4460-ab8f-3b32fce5a093.gif)  
Once you have located the right policy exemption, you can copy the exemption raw data and format the JavaScript Object Notation (JSON) to make it readable.

Exemption categories:
- **Mitigated** (resolved through a third-party service)
- **Waiver** (risk accepted)

A policy exemption JavaScript Object Notation (JSON) looks like this:
```json
{
    "properties":{
        "policyAssignmentId":"/subscriptions/{SubscriptionId}/providers/microsoft.authorization/policyassignments/securitycenterbuiltin",
        "policyDefinitionReferenceIds":[
            "encryptionOfAutomationAccountMonitoring"
        ],
        "exemptionCategory":"waiver",
        "displayName":"ASC-Automation account variables should be encrypted"
    },
    "systemData":{
        "createdBy":!!00EMAIL_ADDRESS!!00,
        "createdByType":"User",
        "createdAt":"2021-02-22T07:21:09.3198418Z",
        "lastModifiedBy":!!00EMAIL_ADDRESS!!00,
        "lastModifiedByType":"User",
        "lastModifiedAt":"2021-02-22T07:21:09.3198418Z"
    },
    "id":"/subscriptions/{SubscriptionId}/providers/Microsoft.Authorization/policyExemptions/ASC-Automationaccountvariablesshouldbeencrypted-builtin",
    "type":"Microsoft.Authorization/policyExemptions",
    "name":"ASC-Automationaccountvariablesshouldbeencrypted-builtin"
}
```

## Creating exemptions using the Azure Command-Line Interface/Azure PowerShell
Note: Always reference the newest public doc of the cmdlet and always test.
1. Obtain the assignment ID of the Azure Security Benchmark/Microsoft Cloud Security Benchmark (MCSB) from the Azure Policy portal and the reference ID of the policy you want to exempt.
2. Navigate to Azure Policy -> Assignments -> Click "ASC Default/Microsoft Cloud Security Benchmark" -> Copy the **assignment ID** and the **Parameter ID** of the policy you want to exempt.
![Policy Assignment](/.attachments/Items-f6902c9f-84fb-4a53-9449-aa851ceaf1fd.jpg)

**Azure PowerShell:**

Sample command - targeting exemption to entire subscription:
```
$Subscription = Get-AzSubscription -SubscriptionName 'Visual Studio Enterprise Subscription'
$Assignment = Get-AzPolicyAssignment -id '/subscriptions/XXXXXXXXXXXXXXXX/providers/Microsoft.Authorization/policyAssignments/XXXXXXXXXXXXXXXXXXXX'
New-AzPolicyExemption `
  -Name "TESTExemption" `
  -PolicyAssignment $Assignment `
  -ExemptionCategory "Waiver" `
  -PolicyDefinitionReferenceId "gcWindowsDiskEncryptionMonitoring" `
  -DisplayName "TEST-MDC-Windows virtual machines should enable Azure Disk Encryption or EncryptionAtHost." `
  -Description "Test" `
  -Scope "/subscriptions/$($Subscription.Id)" `
  -ExpiresOn (Get-Date '2/25/2026 8:00:00 AM' -AsUTC)
```
Sample command - targeting exemption to single virtual machine:

```
$VM = Get-AzVM -Name 'SpecialVirtualMachine'
$Subscription = Get-AzSubscription -SubscriptionName 'Visual Studio Enterprise Subscription'
$Assignment = Get-AzPolicyAssignment -id '/subscriptions/XXXXXXXXXXXXXXXX/providers/Microsoft.Authorization/policyAssignments/XXXXXXXXXXXXXXXXXXXX'
    New-AzPolicyExemption `
      -Name "TESTExemption" `
      -PolicyAssignment $Assignment `
      -ExemptionCategory "Waiver" `
      -PolicyDefinitionReferenceId "gcWindowsDiskEncryptionMonitoring" `
      -DisplayName "TEST-MDC-Windows virtual machines should enable Azure Disk Encryption or EncryptionAtHost." `
      -Description "Test" `
      -Scope $SpecialVM.Id
      -ExpiresOn (Get-Date '2/25/2026 8:00:00 AM' -AsUTC)`
```

**Azure Command-Line Interface**

Sample command - targeting exemption to entire subscription:
 ```bash
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

Sample command - targeting exemption to single virtual machine:

 ```bash
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

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
