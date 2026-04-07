# ARM Azure Arc KB 文章合集 misc 3 — 排查速查

**来源数**: 13 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Arc-enabled Kubernetes clusters should have the Azure Policy extension installed | — | The reported error indicates that the Azure Policy extension could not be installed on the Azure Ar… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 2 | When attempting to onboard an OpenShift cluster to Azure Arc, the kube-aad proxy deployment and the… | The error is caused by missing SCC permissions&nbsp; | To resolve this issue, grant the necessary permissions and restart the kube-aad proxy pod by follow… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 3 | Arc resource bridge deployment fails using a deployment script. The script errors out and ends afte… | Azure CLI v2.70.0 released a breaking change which triggers this error in arcappliance CLI extensio… | When      trying to deploy the Arc Resource Bridge using a template, the deployment      fails with… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 4 | Trying to deploy arc resource bridge to vmware vcenter but the script times out with error &quot;Wa… | The problem is that&nbsp;Vsphere FQDN was not resolvable by the dnsservers  &quot;Reconciler error&… | The client added an A record in the DNS for the vSphere host to be reachable. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 5 | Onboarding of Rancher Kubernetes Engine cluster to Azure Arc is failing with below error.  WARNING:… | storage.googleapis.com is used to download kubectl release in case the kubectl is not present in th… | From Azure CLI version&nbsp;2.68.0 onwards, CLI&nbsp;is downloading the binary from&nbsp;dl.k8s.io/… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 6 | Can I safely rename the Azure Arc Resource Bridge virtual appliance in VMware vCenter after deploym… | The name of the appliance is tied to the underlying Azure resource registration, and renaming it in… | No. Renaming the Resource Bridge appliance in vCenter is not supported | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 7 | Issue deploying an Azure Arc Resource Bridge: Timeout due to management machine unable to reach app… | The error during the deployment were caused by IP conflicts. Unfortunately, the network administrat… | Re-enrollment of the Azure Arc Resource Bridge with the assignment of new IP addresses. | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 8 | The Arc resource bridge is offline.&nbsp; | The ARB pods were not scheduled because of taints.&nbsp; | #SSH into the controlplane VM IP&nbsp; ssh clouduser@127.0.0.1 -i .\logkey - Check if the pods are … | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 9 | Unable to deploy persistent volume claim by using a custom storage class.&nbsp; | — | - Need to explicitly add the storage path id parameter and remove it from container parameter then … | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 10 | Unable to onboard the VMware VMs to the Azure portal.&nbsp; | After redeploying VMs in vcenter and when we try to enable guest management in vcenter it will fail… | Delete the ARM resource and reenable, It only deletes the VM from Azure and will not delete the VM … | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 11 | Existing ARC VMware Resource Bridge appears offline in Azure Portal; however, it appears as running… | Due to some infra issue on cx environment or credential change. | 1-Reboot VM on Vmware  2-update the credentials using the following Command: &nbsp; az connectedvmw… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 12 | After VM successful deletion, the VM still showing up on the azure portal though it was showing suc… | — | To resolve the issue execute the below AZ Script over elevated PowerShell (replace X's by the VM na… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |
| 13 | Upgrading Azure Connected Machine agent fails. Azure Connected Machine Agent cannot be upgraded wit… | Corrupt installation. | 1- Download the appropriate version (which was exactly installed on server, and you want to remove)… | 🔵 7.0 — contentidea-kb+21V适用 | [KB] |

## 快速排查路径
1. The reported error indicates that the Azure Policy extension could not be insta… `[来源: contentidea-kb]`
2. To resolve this issue, grant the necessary permissions and restart the kube-aad… `[来源: contentidea-kb]`
3. When      trying to deploy the Arc Resource Bridge using a template, the deploy… `[来源: contentidea-kb]`
