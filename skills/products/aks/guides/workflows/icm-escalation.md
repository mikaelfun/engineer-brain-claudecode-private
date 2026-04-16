# AKS ICM 与升级 — 排查工作流

**来源草稿**: ado-wiki-a-Microsoft-KubernetesConfiguration-Escalation.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft.KubernetesConfiguration / AKS Extension Escalation
> 来源: ado-wiki-a-Microsoft-KubernetesConfiguration-Escalation.md | 适用: 适用范围未明确

### 排查步骤

#### Microsoft.KubernetesConfiguration / AKS Extension Escalation

#### Required Data for Escalation

Include the output from as many of the following commands as possible from the customer cluster:

1. `kubectl get ec -A -o yaml`
2. `kubectl describe deployments -n flux-system`
3. `kubectl logs -n <extension-manager-pod-name> -c manager`
4. `kubectl logs -n <extension-agent-pod-name> -c config-agent`
5. `az k8s-extension show -g <resource-group> -c <cluster-name> -n <extension-name>`

Also collect:
- **Kubernetes Version**
- **Extension Manager Version**

#### Escalation Paths

**Flux related issues** — file ICM via:
[Microsoft.KubernetesConfiguration Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=vCxHR2)

**Extension related issues** — file to AKS RP:
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=M3Q2u0)

---
