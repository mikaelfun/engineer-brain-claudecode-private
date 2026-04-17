# AKS Azure Policy — general -- Quick Reference

**Sources**: 4 | **21V**: All | **Entries**: 13
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | In Mooncake, user cannot disable Azure Policy add-on on the Azure Portal; the op... | Mooncake portal limitation/bug - disable toggle for Azure Po... | Use CLI workaround: az aks disable-addons --addons azure-pol... | [G] 9.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Deployment Safeguards (Guardrails) policy assignment does not appear on cluster ... | Expected behavior - Azure Policy assignment propagation to t... | Wait up to 75 minutes for the assignment to appear. Verify v... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Deployment%20Safeguards%20%28Azure%20Policy%29) |
| 3 | Azure Backup extension appears installed (extension-agent/operator pods running ... | 1) Azure Policy in enforced mode blocks pods with admin role... | 1) Add 'dataprotection-microsoft' to Azure Policy exclusion ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting) |
| 4 | AKS cluster operations fail with error RequestDisallowedByPolicy. Cluster enters... | Azure Policy assignments (e.g. Require specified tag) block ... | 1) Identify blocking policy from error message. 2) Update re... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Azure%20Policy%20blocks%20cluster%20operations) |
| 5 | Terraform policy assignment fails with 'Policy definition not found' when using ... | The azurerm_policy_set_definition resource is not yet create... | Add depends_on = [azurerm_policy_definition.policies] to the... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/error-in-policy-assign-main-file-terraform) |
| 6 | Pods with system-cluster-critical or system-node-critical priority class names a... | Expected behavior by design; system-critical priority classe... | No action required; this is intentional and not a security r... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/pods-created-user-namespaces) |
| 7 | Azure Policy cannot exclude privileged containers from AKS clusters | Azure built-in policies lack container exclusion parameters ... | Create an exemption in default Azure Security Center policy,... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/privileged-container-exclusion-not-working) |
| 8 | Azure Arc-enabled Kubernetes clusters should have the Azure Policy extension ins... | - | The reported error indicates that the Azure Policy extension... | [B] 6.5 | [ContentIdea#199286](https://support.microsoft.com/kb/5053395) |
| 9 | Azure Policy evaluating VMSS imageReference properties breaks after AKS upgrade;... | AKS converted VHD images to Shared Image Gallery (SIG). SIG ... | 1) Update Azure Policy to not rely on VMSS imageReference. 2... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | Custom Azure Policy for validating controllers fails on AKS cluster | The custom policy definition uses incorrect syntax that prev... | Use the Visual Studio Code extension for Azure Policy to gen... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/custom-policy-for-validating-controller-not-working) |
| 11 | AKS upgrade fails when blocked by Azure custom policy - portal shows compliant b... | During AKS upgrade, the policies evaluated differ from those... | Use Azure portal instead of Azure CLI to start the AKS upgra... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/custom-policy-prevents-aks-upgrade) |
| 12 | Azure Policy failure alert shows empty list of affected resources in AKS cluster | Delay or Graph API issue causing alert to display empty reso... | Wait for system to auto-update alert status; if persists >1 ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/policy-failure-alert-show-empty-list-of-affected-resources) |
| 13 | Azure Security Center alerts for overridden/disabled AppArmor profiles in AKS cl... | Azure Policy auditing AppArmor profiles is missing one or mo... | SSH to node, run 'sudo aa-status' to list profiles in use. N... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FSecurity%20Center%20alerts%20on%20invalid%20AppArmor%20profiles) |

## Quick Troubleshooting Path

1. Check: Use CLI workaround: az aks disable-addons --addons azure-policy --name <cluster> --resource-group <r `[source: onenote]`
2. Check: Wait up to 75 minutes for the assignment to appear `[source: ado-wiki]`
3. Check: 1) Add 'dataprotection-microsoft' to Azure Policy exclusion list `[source: ado-wiki]`
