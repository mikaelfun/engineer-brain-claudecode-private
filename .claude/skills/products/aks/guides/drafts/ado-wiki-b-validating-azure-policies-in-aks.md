---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/Validating Azure Policies in AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FValidating%20Azure%20Policies%20in%20AKS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Validating Azure Policies in AKS

## Summary

Guide for validating and testing Azure Policy definitions in AKS using the Rego Playground. Useful when reproducing policy issues or verifying ConstraintTemplate/CRD definitions without needing a live cluster with policies enabled.

## Existing Policies and How to Get Their Definition

List policies on a cluster:
```bash
kubectl get constrainttemplate
```

Built-in policy code available at: https://docs.microsoft.com/en-us/azure/aks/policy-reference

To get the Rego code:
1. Open a policy definition from the built-in list
2. Look for the `constraintTemplate` property and open the URL
3. In the YAML, copy the content after `rego: |` - this is the policy code

### Alternative Way (from cluster)
```bash
kubectl describe constrainttemplate k8sazureenforceapparmor
```

## Testing with Rego Playground

1. Paste the Rego code into the left pane of the [Rego Playground](https://play.openpolicyagent.org/)
2. In the top right pane, paste a pod definition in JSON format (from `kubectl get pod <POD_NAME> -o json`)
3. Hit "Evaluate" button
4. Check the Output pane at the bottom left for results

From there you can modify the pod definition to test what configurations trigger or pass the policy.

## Samples

- AppArmor: https://play.openpolicyagent.org/p/EDFuwLv3L8
- Container Allowed Ports: https://play.openpolicyagent.org/p/5ZMFtiMyPu

## References

- Secure your cluster with Azure Policy: https://docs.microsoft.com/en-us/azure/aks/use-azure-policy
- Azure Policy built-in definitions for AKS: https://docs.microsoft.com/en-us/azure/aks/policy-reference
- The Rego Playground: https://play.openpolicyagent.org/
