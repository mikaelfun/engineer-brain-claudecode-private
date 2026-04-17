---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Diagrams"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FDiagrams"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Kubernetes Service Platform Diagrams

## Summary

A collection of diagrams on AKS features and flows — useful reference for understanding AKS architecture during troubleshooting.

## List of diagrams

|Name|Area of Interest|Link|Notes|
|---|---|---|---|
|AKS resource request flow|CRUD|[How AKS Request Is Processed](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ES1oeM_LDklCnYW76bRqAI0BER86uj3PQV86P585Qeykzg?e=87Sab4)|"Red" line covers request reception; "green" line covers consequent ARM calls RP sends during the operation|
|Traffic from pod to internet|Networking|[Traffic-Pod-Internet](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EfeELIWk1thPjk0vHcDjum0BbjpyO0X1K1yU8STamjedHQ?e=0XiaVP)|Double SNAT takes place|
|Relationship between Ids|Others/upstream|[Pod-Asso-Ids](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EZDbwGGCHOFInJ5pPRxX8TEBxRpsV-ytY_6N9aLwxezyqQ?e=cjgbKa)|Blue:obtained via KubeAPI;Yellow:obtained inside agent node|
|FQDNs of a cluster|Networking|[aks-access-fqdns](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ER1M4zBNFoNPoYzdu2e5pRMB7fITPM0S52pnj1c0cVKwpQ?e=U3DVHo)|BlueArea:user sub;YellowArea:pg sub|
|AKS traffic classification|Networking|[aks-traffic-maze](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EQzu1cHJAFxBrdVZUp3noUYBQTu_DBfqaK_d0w4q7wJ0qg?e=Titd4f)|NA|
|Config landscape|Management|[aks-config-landscape](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ERKXjtu56-FDuSXGXilfZxABNkUKUOtgBxR6dhmKdZ8zmw?e=A3KR2C)|Continuously updated|
|AKS and Prometheus|Observability|[prom-man-vs-byo](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EYd3Kig3NfBMslqsh-SU7sEBaA1F0bKn1wSZpscj93lWfg?e=WyvUeK)|NA|
|Private vs Public Cluster|Networking|[private-public-cluster](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EbH0q_3f8GxHnDGT_2rqZlgBX9a44WYxApanPWODaJPSuQ?e=42C4DG)|NA|
|Workflow of Disk CSI Driver|Storage|[csi-work-order](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EQFM1sHVEclGrwd9_ywjaWsBSBH4MDj8jtOvoPUsYw40Yg?e=fXwkGR)|NA|

## Annotations for each diagram

### AKS resource request flow

- When an AKS CRUD request arrives, ARM frontend logs the record in ARMHttpIncoming Kusto table with correlationId from the client.
- ARM worker then forwards the call to AKS RP frontend, and also logs the record in ARMHttpOutgoing table.
- Upon receiving the request, AKS RP frontend logs it in RP incomingRequestTrace table, assigning "operationId" field to the record.
- Most CRUD requests require async task forking. After async task is created for the operation, it logs all subsequent ARM calls(in Green), i.e. creating VMSS and LB, in outgoingRequestTrace.
- The async task keeps "operationId" in the outgoingReq table, but replaces all other Ids with new ones associated with the outgoing ARM request.
- For instance, a nodepool upgrade request from user has its own correlationId. OperationId is assigned upon processing start, and subsequent VMSS scaling/reimaging requests bear the same operationId but new correlationIds in AKS outgoingRequestTrace.

### Relationship between Ids

- Linux commands involved: pstree, crictl, ip netns, ip link, ip route, ps
- Pay attention to where you are through this maze of IDs.
- Crictl communicates with containerd on the node. The podId, in similar format with docker containerId, within is another matter than poduuid which K8s control plane is aware of.
- Each pod has its unique shim (dockershim in the past and containerdshim nowadays) process in the OS. Also, its unique "pause" process resides under the shim.
- Blue handwriting cmds can be interpreted as "you can get arrowEnd from arrowStart by exec the cmd".

### FQDNs of a cluster

- 1:AKS resource management requests; 2:KubeAPI calls; 3:cluster workload traffic.
- 4x FQDNs in this diagram: publicFQDN of cluster LB frontend; ARM; AKS-RP; api-server in ccp
- Note that "publicFQDN" can also be FQDN of private domain if on cluster internal LB frontend

### AKS traffic classification

- For pod-pod: No addr translation happens; difference lies on VFP rules hit.
- All pod egress -> external can be treated as iptables SNAT+normal VM egress. **Exception** egress to same vnet under AzureCNI: no SNAT.
- For different ext egress destination, the difference lies in both VFP rules hit and VFP pkt encapsulation.
- As incoming traffic all goes through either internal or public LB of the cluster, related troubleshooting can follow normal steps on any Azure LB.

### AKS and Prometheus

- "scraping targets" is a prom specific term. It refers to prometheus metric endpoints configured in prometheus server yaml.

### Workflow of Disk CSI Driver

- In AKS, "csi folder" on a node means this path under OS filesystem: /var/lib/kubelet/plugins/kubernetes.io/csi/disk.csi.azure.com
