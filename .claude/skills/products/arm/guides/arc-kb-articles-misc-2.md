# ARM Azure Arc KB 文章合集 misc 2 — 排查速查

**来源数**: 12 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Deployment of a VM on vCenter via Azure Arc bridge using Bicep template fails with Resource type no… | Incorrect vminstance resource syntax in Bicep template. | Change vminstance resource: name from vmName to default, and replace dependsOn with scope: arcmachi… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 2 | Unable to onboard TKG (VMWare Tanzu Grid) Kubernetes cluster on Azure ARC due to Kyverno policy enf… | Kyverno policy enforced in TKG cluster requires CPU and memory resource requests for all workloads.… | Temporarily scale down Kyverno admission controller: kubectl scale deploy kyverno-admission-control… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 3 | Unable to delete stale Azure Arc resources via Azure portal or CLI. Resources show Expired status d… | Inactive Kubernetes clusters cause Expired status. Portal cannot handle deletion of stale resources. | Use Azure PowerShell: Remove-AzResource with -Force flag using the ARM ID of the cluster. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 4 | vCenter showing as Disconnected within Azure connected to Azure Arc Resource Bridge. | Outdated VMware credentials used by Arc resource bridge. | Update VMware credentials used by Arc resource bridge. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 5 | Azure Arc enable VMWare onboarding fails with error: tls failed to verify certificate x509 certific… | Devices do not trust the certificate received during communication with Microsoft sites. Often caus… | For transparent proxy: identify the intermediate device, export its CA certificate, and import it i… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 6 | Unable to Onboard vCenter to Azure Arc. | The error occurs only when there is a network issue, permission issue, or registry issue. There mig… | Running the onboarding script by using the FQDN of the vCenter instead of the IP address fixed the … | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 7 | While Executing Script to Connect vCenter to Azure, failed in step 3/5 "Installing Cluster Extensio… | VMware Cluster Extension URL "azureprivatecloud.azurecr.io" is not allowed over required port 443 a… | Allow / Whitelist the VMware Cluster Extension URL "azureprivatecloud.azurecr.io" over the Port 443… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 8 | Arc Appliance run command failed during Appliance deployment with an error "http2: server sent GOAW… | That happen due to some network call failing: C:\Windows\System32>curl -X POST "https://uksouth.dp.… | Enabling HTTP 2.0 through the firewall/proxy resolved the connectivity issue. Testing was completed… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 9 | Azure Connected Machine Agent updates published to WSUS/CM are not applicable on Windows Server 201… | The update metadata specified a minimum operating system version of Windows 2012 R2, which is versi… | This is an error in the published metadata because Windows Server 2012 is still supported with the … | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 10 | The customer encountered connectivity and permission issues with an Azure ARC-enabled Kubernetes cl… | Portal Not Using the Right Token: When the customer tries to open the Workload tab, the Azure porta… | The 599 error was transient and it is due to customer's proxy settings bocking the url. Below are s… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 11 | OpenSSL component (1.1.1) which part of akv secret provider extension, is no longer being supported… | AKV secret provider extension version 1.5.5 has monitor pod (akvsecretsprovider-arc-monitoring-xxxx… | Upgrade to next version of 1.5.6 where monitoring pod was removed in the version 1.5.6 az k8s-exten… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 12 | Connect VMware vCenter Server to Azure Arc by using the helper script keep asking for user and pass… | Script not accepting Upper Case "Y" for confirming the user and password | Use lower case "y" to confirm the credentials | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |

## 快速排查路径
1. Change vminstance resource: name from vmName to default, and replace dependsOn … `[来源: contentidea-kb]`
2. Temporarily scale down Kyverno admission controller: kubectl scale deploy kyver… `[来源: contentidea-kb]`
3. Use Azure PowerShell: Remove-AzResource with -Force flag using the ARM ID of th… `[来源: contentidea-kb]`
