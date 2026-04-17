---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Service Updates"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FService%20Updates"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[comment]: # (When editing this page, add the latest updates to the top)

[[_TOC_]]

##08/11/2023
### Policy exemptions in ARG
Policy exemptions are now available in Azure Resource Graph.

### DenyAction effect is now GA
DenyAction policies applicable resources will now have a **Protected** state in policy compliance.

##04/04/2023
### Export to GitHub option has been removed
The feature has been deprecated. PG will be working on updating the documentation to remove any references and provide a PS script that accomplishes the same functionality.

Statement for customers asking about the functionality: "Due to scalability issues with the feature, Policy and GitHub team have decided to deprecate the UI focused experience and are looking to introduce a SDK version of the feature."

##12/02/2022
### DenyAction effect (public preview)
[Prevent accidental deletions at scale using Azure Policy](https://techcommunity.microsoft.com/t5/azure-governance-and-management/prevent-accidental-deletions-at-scale-using-azure-policy/ba-p/3689186)

A new effect to prevent actions on resources that meet a set of conditions has been released. Documentation can be found at [[LEARN] Understand Azure Policy effects - DenyAction (preview)](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects#denyaction-preview).

[[ARCH] How control plane effects work](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623661) has been updated with information about this effect as well.

##10/12/2022
[Azure Policy announces enhancements for gradual rollout, custom evaluations & Kubernetes policy!](https://techcommunity.microsoft.com/t5/azure-governance-and-management/azure-policy-announces-enhancements-for-gradual-rollout-custom/ba-p/3645336)
### GA for custom AKS policies
This release does not change anything into how we work these cases. See [[ARCH] Policy RP integrations - AKS and Azure ARC enabled Kubernetes dataplane policies](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623664/AKS-and-Azure-ARC-enabled-Kubernetes-dataplane-policies) for information on these functionality.

### Selectors and overrides public preview
See [[ARCH] Selectors & Overrides [Public Preview]](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623677/).

### Manual attestation policies public preview
See [[ARCH] Manual attestation policies [Public Preview]](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623662/).

##12/02/2021
### Improvements to remediation tasks
Added properties:
- **resourceCount:** How many resources to remediate. Default value 500, maximum is 10000.
- **parallelDeployments:** How many deployments to run in parallel. Default value is 10, allowed range is from 1 to 15.
- **failureThreshold:** How many resources can fail to remediate before the remediation task is interrupted. Range from 0 to 1 (percentage).

These properties are currently available through API as of 12/02/2021, will be available soon in UI.

### Policy resources in ARG
Definitions, Initiatives, and Assignments can now be queried from Azure Resource Graph.

## 09/10/2021
### UAMI support for Policy assignments
Policy assignments now support User Assigned Managed Identities.

### Initiative parameter limit set to 300
Initiative parameter limit increased from 250 to 300.

## 09/01/2021
### Custom policies for AKS dataplane
Custom policy support has been released for AKS. 

More information:
- [[Azure Updates] Custom AKS policy support - now public preview](https://azure.microsoft.com/en-us/updates/custom-aks-policy-support-now-public-preview/)
- [[Process] AKS and Azure ARC enabled Kubernetes dataplane policies](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623664/AKS-and-Azure-ARC-enabled-Kubernetes-dataplane-policies)

## 07/01/2021
### Support for evaluationDelay property in DINE policies
DINE evaluation for automatic remediation happens 10 minutes after the create/update request by default. This property allows customers to customize that time window. See [[LEARN] DeployIfNotExists properties](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects#deployifnotexists-properties).

## 06/21/2021
###  [Applicability Logic changes](https://azure.microsoft.com/en-us/updates/general-availability-update-in-policy-compliance-for-resource-type-policies/)
