# ACR 防火墙与网络规则 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker pull from ACR fails (timeout/connection refused) when client runtime is b | When ACR vNET firewall is enabled, docker pull traffic routes through a regional | 1) Allow ACR REST endpoint (myregistry.azurecr.io). 2) Allow data endpoint: regi | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-006] |
| 2 | ACR Tasks fail with 403 Forbidden errors after June 2025 — tasks that previously | Default behavior change in ACR: the new networkRuleBypassAllowedForTasks flag de | 1) Explicitly enable the new flag: az acr update --name <registry-name> --set ne | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-041] |
| 3 | Unable to add VNET/Subnet from a different subscription to ACR firewall configur | The Microsoft.ContainerRegistry resource provider is not registered in the secon | Register Microsoft.ContainerRegistry RP in the second subscription: az login → a | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-045] |
| 4 | ACR image pull fails with 403 Forbidden when AKS uses selected networks - despit | Service Endpoint for Microsoft.ContainerRegistry created on AKS subnet forces tr | Remove the conflicting Service Endpoint for Microsoft.ContainerRegistry from the | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-052] |
| 5 | ACR pull/push fails with error 'client with IP is not allowed access. Refer http | ACR 'Selected Networks' firewall is enabled and the client's public IP address i | 1. Use Jarvis 'Get Registry Master Entity' action (same JIT as Private Endpoints | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-0146] |
| 6 | az acr build fails with "denied: client with IP X.X.X.X is not allowed access" w | az acr build uses ACR Tasks infrastructure which runs on Azure-managed compute,  | Option A (recommended, strict private-only): Create an ACR Dedicated Agent Pool  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-a-r1-001] |
| 7 | ACR login/pull fails with client with IP <ip-address> is not allowed access (403 | ACR built-in firewall is restricting public access - the client IP is not in the | Add the client IP to ACR firewall rules (Configure public IP network rules), or  | 🟢 8.0 — MS Learn交叉验证 | [acr-mslearn-005] |
| 8 | az acr build fails with error: 'client with IP x.x.x.x is not allowed access' ev | ACR Firewall is enabled but the IP ranges for the ACR build service (AzureContai | 1) Retrieve AzureContainerRegistry service tag IPs for your region: $serviceTags | 🟢 9.5 — OneNote交叉验证 | [acr-onenote-003] |

## 快速排查路径
1. 检查 → When ACR vNET firewall is enabled, docker pull traffic route `[来源: ADO Wiki]`
   - 方案: 1) Allow ACR REST endpoint (myregistry.azurecr.io). 2) Allow data endpoint: registry_name.region.dat
2. 检查 → Default behavior change in ACR: the new networkRuleBypassAll `[来源: ADO Wiki]`
   - 方案: 1) Explicitly enable the new flag: az acr update --name <registry-name> --set networkRuleBypassAllow
3. 检查 → The Microsoft.ContainerRegistry resource provider is not reg `[来源: ADO Wiki]`
   - 方案: Register Microsoft.ContainerRegistry RP in the second subscription: az login → az account set -s <su
4. 检查 → Service Endpoint for Microsoft.ContainerRegistry created on  `[来源: ADO Wiki]`
   - 方案: Remove the conflicting Service Endpoint for Microsoft.ContainerRegistry from the AKS subnet. Service
5. 检查 → ACR 'Selected Networks' firewall is enabled and the client's `[来源: ADO Wiki]`
   - 方案: 1. Use Jarvis 'Get Registry Master Entity' action (same JIT as Private Endpoints) to view IP Rules o

> 本 topic 有融合排查指南 → [完整排查流程](details/firewall-network-rules.md#排查流程)
