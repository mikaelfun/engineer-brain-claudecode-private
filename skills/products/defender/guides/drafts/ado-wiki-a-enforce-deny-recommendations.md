---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Product Knowledge] - Enforce Recommendations & Deny rules"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProduct%20Knowledge%5D%20-%20Enforce%20Recommendations%20%26%20Deny%20rules"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enforce Recommendations and Deny Rules

## Description

Defender for Cloud provides the ability to prevent misconfigurations of new resources for specified recommendations using Azure Policy effects.

## Instructions to Deny/Prevent Resource Creation

- Select a scope and change the Azure policy to a **Deny** effect
- Prevents creation of resources that do not satisfy the recommendation
- [Azure Policy deny effect docs](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/effects#deny)

## Instructions to Enforce Secured Configuration

- Assign a built-in Azure policy with **DeployIfNotExists** effect
- Automatically executes a template deployment with desired configuration
- Monitor assignment and results in Azure Policy compliance blade
- **Note:** The default initiative will not be changed; policy must be assigned manually
- [Azure Policy DeployIfNotExists effect docs](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/effects#deployifnotexists)

## Supported Recommendations

### Enforce: Deploy if not exist
- Diagnostic logs in Logic Apps / Data Lake Analytics / IoT Hub / Batch accounts / Stream Analytics / Service Bus / Search services / Event Hub / VMSS / Key Vault
- Auditing on SQL server
- Microsoft Defender for SQL for unprotected Azure SQL servers

### Deny resource creation
- VMs/Storage accounts should be migrated to new Azure Resource Manager
- All authorization rules except RootManageSharedAccessKey should be removed from Event Hub/Service Bus namespace
- Secure transfer to storage accounts
- Only secure connections to Redis Cache
- Automation account variables should be encrypted
- Service Fabric: AAD for client auth, ClusterProtectionLevel EncryptAndSign
- Audit unrestricted network access to storage accounts
