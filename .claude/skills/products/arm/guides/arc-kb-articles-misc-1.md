# ARM Azure Arc KB 文章合集 misc 1 — 排查速查

**来源数**: 11 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Unable to download helm charts in Azure Arc. | The issue is with spec. | Check the YAML file where you have mentioned to download the helm charts from helm repository the s… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 2 | Fluentd monitoring container keeps getting crashed | Fluentd container gets crash with out of memory error because the version 1.2.1 has limit of 100Mi. | The next version 1.3.0 has a fix where the limits of memory increased from 100Mi to 150Mi for the f… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 3 | Azure Arc Resource Bridge installation fails with KVAError or PrepareKvaTimeoutError when using 32-… | Resource Bridge deployment requires 64-bit Azure CLI. The installation failed when attempted with t… | Uninstall the 32-bit Azure CLI, download and install Python 3.8.8 64-bit, then install Azure CLI vi… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 4 | During Azure Arc resource bridge onboarding for VMware, Appliance creation fails with error Applian… | Known bug for vSphere where backslash in credentials causes interpretation error in one of the pods… | As a workaround, create an account without backslash character and use that to deploy the appliance… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 5 | Customer was facing issue while deploying Google Kubernetes Engine cluster on Azure ARC. Customer w… | Google Kubernetes Engine cluster with Auto-Pilot mode is not supported yet. The failure was due to … | Issue was fixed after deploying Google Kubernetes Engine k8s cluster in standard mode. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 6 | Year 4 Extended Security Updates fail to install on Azure Arc hosted Windows Server 2012 and 2012 R… | Manually installed intermediate certs have an expiration date of June 26, 2024. After expiration, y… | Open connectivity to https://www.microsoft.com/pkiops/certs endpoint to allow Azure Arc to download… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 7 | While installing Azure monitoring agent on Azure ARC enabled Kubernetes cluster with worker nodes r… | The infrastructure running on Oracle Linux 9.2 did not auto-load the iptable_nat module required fo… | Manually load the iptable_nat module on every node and restart: sudo modprobe iptable_nat. Verify w… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 8 | PowerShell script designed to enable ARC for virtual machines (VMs) in a vCenter in batch. Useful f… | — | Use the PowerShell script from https://github.com/Azure/azure-arc-for-vmware-scripts/tree/main/batc… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 9 | Onboarding script to connect VMware vCenter server to Azure Arc stuck at Step 2/5: Creating the Arc… | The arc appliance extension was not installed because the download from PyPI was failing. The arc a… | Trust PyPI on the client machine so the arc appliance extension can be downloaded and installed. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 10 | GitOps Flux V2 extension installation failed with error Helm Installation failed on Azure ARC Red H… | Customer did not add the security context constraint for OpenShift cluster as mentioned in the docs. | Add security context constraints: oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:k… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 11 | Azure Arc ESU guidance for customers that manually installed intermediate certs with June 27, 2024 … | — | Install or update the Azure Arc agent to version 1.4.0 or newer. Verify version with azcmagent vers… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |

## 快速排查路径
1. Check the YAML file where you have mentioned to download the helm charts from h… `[来源: contentidea-kb]`
2. The next version 1.3.0 has a fix where the limits of memory increased from 100M… `[来源: contentidea-kb]`
3. Uninstall the 32-bit Azure CLI, download and install Python 3.8.8 64-bit, then … `[来源: contentidea-kb]`
