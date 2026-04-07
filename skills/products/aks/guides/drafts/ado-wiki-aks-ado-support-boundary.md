---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Other/AKS ADO"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FAKS%20ADO"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support boundary for Azure DevOps related cases

## Summary

This document is focused on troubleshooting issues when Azure DevOps cases land in the AKS queue and outlines the necessary steps to perform before engaging the Azure DevOps team. This wiki was created by mutual agreement from both DevOps TA's and AKS team.

### Architecture and Involved Components

- Azure DevOps (ADO) Services/Agents
- Azure Kubernetes Service (AKS) Cluster
- Pipelines (YAML/Classic)
- Kubernetes components (Pods, Secrets, etc.)
- Helm/kubectl

### Isolate the issue from AKS perspective

- Verify if the AKS platform is healthy
- Identify the AKS component which will be deployed into AKS by the pipeline (Pods, secrets, etc.). Check the health of these components and verify if they can be deployed directly without pipeline
- Check and analyze the logs of the deployment at AKS end for the service or pods and identify if the failure is related to AKS or not
- Assist in verifying the connection between the ADO service/Agent and AKS cluster
- Ask the customer to perform a manual deployment (outside of the pipeline) using the same manifests or deployment commands. If the manual deployment is successful but fails when running via the pipeline, the issue likely lies within the pipeline configuration and is ADO-owned. If the manual deployment fails, the issue needs to be investigated by AKS engineer.

## Scenarios Owned by Azure DevOps Engineer

These scenarios are fully within the DevOps domain. If the failure/issue is before step numbers 5 and 7, they need to be owned by the DevOps team.

1. **Pipeline YAML/Classic Configuration Issues** - Syntax errors, stage/job/task misconfiguration, or missing environment variables.
2. **Service Connection Issues (Kubeconfig, Azure Resource Manager)** - Misconfigured or expired service connections. Service connection configuration and troubleshooting for AKS is owned by ADO team; however, for AKS cluster where local accounts are disabled and RBAC is enabled, help from AKS team in collaboration is needed for role-binding and role assignment.
3. **Pipeline Agent Issues** - Pipeline not picking up jobs, agent capabilities mismatched, or agent startup issues.
4. **Deployment Step Failures** - Helm/kubectl ADO task failures due to wrong parameters, chart paths, or missing binaries.
5. **DevOps Variable/Substitution/Secrets Scope Issues** - Errors in secret substitution or scoped variables during AKS deployment.
6. **Helm Chart Packaging, Publishing and deployment** - Supported by ADO team only if the process fails through the pipeline using Helm tasks/commands but succeeds locally. Helm custom graph support is not provided by either team (best-effort basis).
7. **Agent Configuration on AKS Clusters** - Responsibility of Azure DevOps support team.
8. **Nested Scenarios** - Running ADO agents inside an ADO agent Pod is not supported.

## Scenarios to be Owned by AKS Team

1. **Cluster Provisioning Failures (AKS API Errors)** - e.g., `aks create` fails or clusters stuck in Updating/Failed state.
2. **Node Pool Scaling/Upgrade/Autoscaler Issues** - e.g., Cluster autoscaler not functioning; node pool fails to scale or upgrade.
3. **Kubelet/Docker/Containerd Errors at Node Level** - e.g., Pods crashing due to runtime errors or node misconfiguration.
4. **AKS-Specific Networking Issues (CNI/Calico/Overlay)** - e.g., Pods can't reach external services due to overlay networking problems.

## Scenarios Requiring Collaboration with AKS Engineers

1. **Deployment Failures Due to Cluster Misconfiguration** - Pipeline deploys fine but pods fail due to node taints, pod security policies, or misconfigured namespaces.
2. **Agent Pool Issues with Self-Hosted Agents on AKS** - Self-hosted DevOps agents deployed on AKS are not connecting or showing offline.
3. **Intermittent Pipeline Failures with Cluster-Level Events** - Pods evicted during builds due to resource pressure, node restarts, or AKS upgrades.
4. **Permissions or RBAC Issues Between Pipeline and AKS** - Pipeline fails with RBAC errors (forbidden, no permissions to list pods).
5. **Network or DNS Issues Affecting Pipeline to AKS Access** - Pipelines hang/fail when accessing AKS due to DNS or VNET misconfigurations.

**Tip:** A good practice is to validate:
- If the issue is inside the cluster → likely AKS team.
- If it's before/during deployment or DevOps agent-related → DevOps engineer owns it.
- If it spans both → open a collaboration case, tag both teams and work in parallel.

## Escalation Paths

DevOps TA: Aditya Ranjan, Shiva Kumar
AKS SME: Vinay Choudhary, Sanath Shetty

## References

> https://learn.microsoft.com/en-us/azure/architecture/guide/aks/aks-cicd-azure-pipelines
