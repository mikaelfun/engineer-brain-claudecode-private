# AKS DNS 解析排查 — general — 排查工作流

**来源草稿**: ado-wiki-a-AGIC-Troubleshooting-Guide.md, ado-wiki-a-AGIC-Troubleshooting-SSL-Configuration-Issues.md, ado-wiki-a-AKS-Storage-Troubleshooting-Methodology.md, ado-wiki-a-CIFS-Credits-Troubleshooting.md, ado-wiki-a-VM-Restart-Troubleshooting-guideline.md, ado-wiki-a-Windows-Node-Troubleshooting-Tips.md, ado-wiki-a-Windows-On-AKS.md, ado-wiki-a-aci-terminologies-troubleshooting.md, ado-wiki-a-agic-troubleshooting-404.md, ado-wiki-a-agic-troubleshooting-502.md, ado-wiki-a-agic-troubleshooting-504.md, ado-wiki-acr-troubleshooting-using-asi.md, ado-wiki-agic-troubleshooting-wrong-backend.md, ado-wiki-aks-collect-cpu-usage-node-pod-mapping.md, ado-wiki-aks-dns-troubleshooting-workflow.md, ado-wiki-aks-kusto-node-info-metrics-dashboards.md, ado-wiki-aks-network-troubleshooting-methodology-overview.md, ado-wiki-aks-per-node-publicip-use-examples.md, ado-wiki-aks-troubleshooting-dns-issues-lab.md, ado-wiki-aks-troubleshooting-egress-issues.md, ado-wiki-b-AKS-AD-First-Basic-troubleshooting-steps.md, ado-wiki-b-aci-troubleshooting-basics.md, ado-wiki-b-troubleshooting-k8s-service-account-tokens.md, ado-wiki-c-Static-Egress-Gateway-IP.md, ado-wiki-c-VM-Availability-Troubleshooting-guideline.md, ado-wiki-collaborations-aks-network-troubleshooting.md, ado-wiki-customizing-node-hosts-file.md, ado-wiki-preserving-node-logs-rca.md, ado-wiki-ssl-certificate-validation-in-aks.md, mslearn-aks-cluster-startup-troubleshooting.md, mslearn-basic-troubleshooting-outbound-connections.md, onenote-aks-node-access-methods.md, onenote-aks-node-log-collection.md
**Kusto 引用**: 无
**场景数**: 33
**生成日期**: 2026-04-07

---

## Scenario 1: AGIC Troubleshooting Guide (Main Workflow)
> 来源: ado-wiki-a-AGIC-Troubleshooting-Guide.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC Troubleshooting Guide (Main Workflow)

Entry point for all Application Gateway Ingress Controller troubleshooting.

#### [1] Troubleshoot AKS cluster issues first

Use AppLens, Azure Service Insights, ASC TSGs, AKS Ava Teams channel.

#### [2] Determine AGIC deployment type

- **AKS Addon**: Portal > AKS > Networking > "Enable ingress controller". ASC: Addon Profiles > Ingress Application Gateway Enabled. Pod label: `kubernetes.azure.com/managedby=aks`
- **Helm**: No managed-by label. Customer manages installation, identities, updates.

#### [3] Helm deployment issues

See: Azure Networking Pod Wiki - Troubleshooting Helm, AGIC GitHub Troubleshooting Guide.

#### [4] Is AGIC pod healthy?

```bash
kubectl get pod -l app=ingress-appgw -n kube-system
```

Check: READY=1/1, STATUS=Running, RESTART count stable.

#### [5] AGIC pod not healthy

See: [TSG] AGIC Troubleshooting AGIC Pod Not Healthy

#### [6] Is AppGW receiving config updates from AGIC?

See: [TSG] AGIC Is The AppGW Receiving Configuration Updates From AGIC

#### [7] AGIC/AppGW integration issues

See: [TSG] AGIC Troubleshooting AGIC AppGw Integration Issues

#### [8] SSL configuration issues

See: Troubleshooting SSL Configuration Issues workflow

#### [9-11] HTTP error codes

- [9] 404 Not Found workflow
- [10] 502 Bad Gateway workflow
- [11] 504 Gateway Timeout workflow

#### [12] Frontend connectivity

- nslookup/dig: Verify FQDN resolves to AppGW IP
- telnet/netcat: Verify port reachability

#### [13-14] Backend routing

Check if request reaches correct backend. See routing verification workflow.

#### [15] Backend application issues

See: Troubleshooting Backend Application Issues

#### [16] Sanity check with test workload

Deploy google-samples/hello-app:2.0 with AGIC ingress to isolate AGIC vs application issues.

---

## Scenario 2: Troubleshooting SSL Configuration Issues
> 来源: ado-wiki-a-AGIC-Troubleshooting-SSL-Configuration-Issues.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting SSL Configuration Issues

Workflow for scenarios where TLS behavior is wrong or incorrect SSL certificate is presented.

#### [1] Is the ingress TLS specification correct?

Ingress must include TLS section referencing secret name and optionally hostnames. See: AGIC tutorial - Expose services over HTTPS.

#### [2] Is the TLS secret properly configured?

Verify certificate contents:
```bash
kubectl get secret <SECRET_NAME> -n <NAMESPACE> -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text
```

Verify thumbprint:
```bash
kubectl get secret <SECRET_NAME> -n <NAMESPACE> -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -fingerprint -noout
```

Note: CSS cannot access TLS secret data per Microsoft privacy standards.

#### [3] Fix TLS secret

Delete existing secret, create new one with correct cert+key. See: Kubernetes TLS Secrets documentation.

#### [4] Is AppGW Listener configured with certificate?

Portal: Application Gateway > Listeners > select listener. Check:
- Protocol = HTTPS
- Port = 443
- Certificate = cert-default-<SECRET_NAME>
- Host names match ingress spec

CSS: ASC > HTTP Listeners panel.

#### [5] AGIC/AppGW integration issues

See: Troubleshooting AGIC AppGw Integration Issues workflow.

---

## Scenario 3: AKS Storage Troubleshooting Methodology
> 来源: ado-wiki-a-AKS-Storage-Troubleshooting-Methodology.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Storage Troubleshooting Methodology

#### Summary

Kubernetes provides an abstraction layer for storage, allowing developers to work with storage resources in a consistent way, regardless of the underlying infrastructure. It includes:

- Persistent Volumes (PVs) and Persistent Volume Claims (PVCs), which are used to define and request storage resources.
- Storage Classes, which allow administrators to define options for different types of storage resources.
- Volume Plugins like CSI (Container Storage Interface), which are responsible for implementing the different types of supported storage.

**The objective of this page is to isolate AKS storage related topics, including the usage of CSI and container storage drivers.**

#### Storage drivers supported in AKS

Supported storage drivers (all other drivers are not supported by AKS/Azure Container Storage team):

- Azure Blob Storage CSI driver
- Azure Disk CSI driver
- Azure File CSI driver
- Azure Container Storage driver with Azure Disk
- Azure Container Storage driver with Elastic SAN
- Azure Container Storage driver with Ephemeral Disk NVMe
- Azure Container Storage driver with Ephemeral Disk temp SSD

#### Methodology for troubleshooting AKS storage - Storage Boundaries v2

Scope limited to Azure storage drivers for blob, disk, file and san storage (does NOT encompass secret store or azurelustre CSI drivers).

##### Responsibility Matrix

| # | Task | Responsible Team | Notes |
|---|------|-----------------|-------|
| 1 | Fully Understand the Issue | AKS POD | Customer Communication |
| 2a | CSI driver issues (install, mount, provision, performance, snapshots) + Azure Container Storage (diskpools, storagepools, OpenEBS) | AKS POD -> Xstore/Triage (Container Storage) | Can directly escalate via IcM: set "Transfer Team" to "Container Storage", provide cluster name + CCP namespace |
| 2b | Isolate CRP issue | AKS POD + Azure IaaS VM POD | Use ASI, ASC |
| 2c | Performance/IOPS throttling for cluster nodes (VMs) | AKS POD + Azure IaaS VM POD | May need Linux escalation team collaboration. If isolated to AgentBaker component, AKS POD owns it |
| 2d | Mount issues (NFSv4.1), performance/connectivity isolated to Azure blob/disk/file/SAN | AKS POD + Azure IaaS VM POD (storage team) | SAP: Routing Azure Storage |

##### Key TSG Links by Driver

**Azure Disk CSI:**
- csi-debug: https://github.com/kubernetes-sigs/azuredisk-csi-driver/blob/master/docs/csi-debug.md
- Azure Disk Case Collection (eng.ms)
- Azure Disk CSI Driver TSG (eng.ms)
- Multi-Attach error guide

**Azure File CSI:**
- csi-debug: https://github.com/kubernetes-sigs/azurefile-csi-driver/blob/master/docs/csi-debug.md
- Azure File Case Collection (eng.ms)
- Azure File CSI Driver TSG (eng.ms)

**Azure Blob CSI:**
- csi-debug: https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/csi-debug.md
- Blob CSI Driver TSG (eng.ms)

##### Escalation Path for Container Storage Issues

1. Set "The incident is related to" to "I know exactly which Xstore component team to transfer"
2. Set "Transfer Team" to "Container Storage"
3. Provide the AKS cluster name and CCP namespace

---

## Scenario 4: CIFS low credits troubleshooting for intermittent SMB/CIFS connectivity issues
> 来源: ado-wiki-a-CIFS-Credits-Troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### CIFS low credits troubleshooting for intermittent SMB/CIFS connectivity issues

Author: @Author


#### Summary

For intermittent SMB/CIFS connectivity issues this TSG should assist in identifying if nodes in a cluster are running out of credits when attempting to connect to a storage account

##### Symptoms

- The most common symptom we have experienced are 'host is down' errors intermittently showing up requiring a restart of a pod before being resolved
- Some light storage account throttling (this was only reported in a single case at this point)

#### Cause

Per our SMB dev team:

    The SMB protocol uses credits as a mechanism to limit the number of outstanding requests on a connection at any time.

    Due to a regression on the Linux SMB client introduced in the 5.10 kernel,  the number of outstanding requests accounted by the client can go wrong. Following this event, the client accounted SMB credits on this connection can slowly decrease until it reaches a point where the client starts failing requests due to what the client thinks is insufficient number of credits. We have submitted an upstream fix for this issue to the mainline kernel version 6.5, and we are following up with requests for various distributions like Ubuntu/SLES/RHEL to backport this fix into their stable kernels. We expect the kernel update to be available during the next update cycle.

    Ref:

    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=69cba9d3c1284e0838ae408830a02c4a063104bc

    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e8eeca0bf4466ee1b196346d3a247535990cf44d

#### Identification Steps, Temporary Mitigation, & Email Template

 1. Have your customer implement one of the following daemonsets within
    their cluster(both should be identical). By default it will log all CIFS debug data to "/tmp/cc_logs", these debug logs do rotate, however if a low CIFS credit alert is triggered, it will log to /var/log/syslog (which also rotates just not as frequently as the CIFS debug logs):

    ![Logging-to-syslog-for-cifs-credits-issues.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-code-snip.jpg)
     - <https://github.com/jamesonhearn/daemonset-repro/blob/main/cifs-debug.ds.yaml>

     - <https://github.com/Jtaylorthegreat/Kubernetes-References/blob/master/CIFS-Node_troubleshooting-Daemonset/cifs-debug.ds.yaml>

 2. Once a reproduction of the behavior has occurred, have your customer upload all the logs from /tmp/cc_logs as well as all /var/log/syslog files (this includes all the syslog files in rotation syslog.2.gz, syslog.3.gz, etc.)
 3. When examining the logs there are a few key indicators that indicate they have ran into a low cifs credits alert on that node, the best indicator would be when checking /var/log/syslog for "CIFS_CREDIT_ALERT", an example from an earlier case that ran into this issue would look like so:

![reading-var-log-syslog-for-low-credit-alerts.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot.jpg)

An easier way to look for this line through all syslog files including the .gz files from WSL or a Linux jump box would be to run the following command in BASH:

```zgrep 'CIFS_CREDIT_ALERT' syslog.*```

You can also get a count of how many instances this happened overall by running the following :

```zgrep 'CIFS_CREDIT_ALERT' syslog.* | wc -l```

![zgrep-for-low-credits-alerts-in-syslog.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot2.jpg)

![get-count-of-low-credit-alerts-in-syslog.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot3.jpg)

4. Another indicator you can check when looking through the cc_logs received from the customer is the "cifs_credit_history" file, you may be able to see which storage account hostnames they were running into low credit alerts with:

![reading-through-cifs_credit_history-log.jpg](./.attachments/cifs-credits-attachments/CIFS-credits-screenshot4.jpg)

5. Once Properly Identified by finding either "CIFS_CREDIT_ALERT" entries in /var/log/syslog  or "LOWCRED" alerts in the cifs_credit_history file of the host node, you can reference the following icm and use the template below to send out to the customer:
<https://portal.microsofticm.com/imp/v3/incidents/details/405877736/home>

Template you can use to send to customer:

    Per our SMB dev team:

    The SMB protocol uses credits as a mechanism to limit the number of outstanding requests on a connection at any time.

    Due to a regression on the Linux SMB client introduced in the 5.10 kernel, the number of outstanding requests accounted by the client can go wrong. Following this event, the client accounted SMB credits on this connection can slowly decrease until it reaches a point where the client starts failing requests due to what the client thinks is insufficient number of credits. We have submitted an upstream fix for this issue to the mainline kernel version 6.5, and we are following up with requests for various distributions like Ubuntu/SLES/RHEL to backport this fix into their stable kernels. We expect the kernel update to be available during the next update cycle.

    Ref:

    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=69cba9d3c1284e0838ae408830a02c4a063104bc

    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=e8eeca0bf4466ee1b196346d3a247535990cf44d

    In the meantime if the Linux client bug is seen again then the recommended mitigation is to reboot the client VM, (or in this case reboot the pod).

#### Disclaimer

***Please note if you do not see either a CIFS_CREDIT_ALERT in the syslog files or a LOWCRED alert when looking at cifs_credit_history there is a chance that they may not be running into this particular issue, in which case you can take all the acquired logs and escalate via ICM to the EEE AKS team with an ask to request assistance from the storage team for triage of CIFS data**_

Further SMB/CIFS troubleshooting tools can be found here:

<https://github.com/Azure-Samples/azure-files-samples/tree/master/SMBDiagnostics>

#### Owner and Contributors

**Owner:** Justin Taylor <jutayl@microsoft.com>
**Contributors:**

- Justin Taylor <jutayl@microsoft.com>

---

## Scenario 5: Virtual Machine Restart Troubleshooting
> 来源: ado-wiki-a-VM-Restart-Troubleshooting-guideline.md | 适用: 适用范围未明确

### 排查步骤

#### Virtual Machine Restart Troubleshooting

#### Summary

Every time customers request why a VM was restarted, preemptive checks can be done before opening collabs to VM team.

#### What should we do?

**1.** Open the Node in ASC or ASI
   - In ASI: Select the affected node, check the field "VMA Impacting Events", click on the box to see Failure Signature message.
   - In ASC: Select the affected node and see the Health tab.
   - In ASC (VMSS): Select the VMSS → Health tab to check all VMs.

**2.** Check Failure Signature message, then cross-reference with the VM POD wiki: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/513106/VMs-and-VMSS

   a. If event is one-of-a-kind → send RCA to customer
      - "Customer initiated" Failure Signature: usually caused by OS/app processes (e.g., kured)
      - In ASC → Diagnostics tab → run InspectIaaSDisk to collect OS logs
      - ⚠️ Ephemeral OS disk: cannot collect OS logs — ask for session or request customer to send node logs

   b. If customer has multiple events for same node related to Hardware → open collab with VM team

#### Owner
Adam Margherio (amargherio@microsoft.com)

---

## Scenario 6: Windows Node Troubleshooting Tips
> 来源: ado-wiki-a-Windows-Node-Troubleshooting-Tips.md | 适用: 适用范围未明确

### 排查步骤

#### Windows Node Troubleshooting Tips

#### Garbage Collection Thresholds
- Location: `/var/lib/kubelet/kubeadmn-flags.env`
- Keys: `image-gc-low-threshold`, `image-gc-high-threshold`

#### Finding Disk Space Usage (OS Disk) — du.exe from Sysinternals
Download in PowerShell session:
1. `curl -Uri https://download.sysinternals.com/files/DU.zip -UseBasicParsing -OutFile DU.zip`
2. `Expand-Archive .\DU.zip`
3. `.\du.exe /accepteula`
4. Check directory size: `.\du.exe -l 1`

#### Log and Config Locations on Windows Nodes
- containerd: `C:\ProgramData\containerd
oot`
- Kubelet and related logs: `C:\k`

#### Correlating Snapshot ID to Container
Reference file: `C:\ProgramData\containerd
oot\io.containerd.snapshotter.v1.windows\metadata.db`
Maps snapshot IDs to specific containers.

---

## Scenario 7: Windows On AKS — Comprehensive Guide
> 来源: ado-wiki-a-Windows-On-AKS.md | 适用: 适用范围未明确

### 排查步骤

#### Windows On AKS — Comprehensive Guide

> Windows Server 2019 deprecated March 13, 2023 (EoL March 13, 2026).
> Docker on Windows deprecated March 2023, removed May 1, 2023.
> Containerd is the only supported container runtime for Windows nodes since May 1, 2023.

#### Checklist

1. **Is Windows deployed?** Use `Cluster Health Summary` detector in AppLens.

2. **Are containers built with compatible Windows version?**
   - SSH into Windows node: `ver` to see OS version
   - `crictl images` to list all images
   - `crictl inspecti --output go-template --template 'Name: {{.status.repoTags}}, OS Version {{index .info.imageSpec "os.version"}}' <imageId>`

3. **Node selector set correctly?**
   - `kubectl get pods -o wide`
   - `kubectl describe node <nodename>` and `kubectl describe deployment <deployment>` to verify labels match selectors

4. **Windows nodes healthy?**
   - `Get-Service *containerd*` → should return Running
   - `Get-Process *containerd*` → ensure process running
   - Same for kubelet and kube-proxy
   - ⚠️ Do NOT restart kubelet or kube-proxy directly on Windows — restart the node instead (extra cleanup scripts run at node restart)

5. **Is it Supported?** Check https://kubernetes.io/docs/setup/production-environment/windows/intro-windows-in-kubernetes/#supported-functionality-and-limitations

#### Key File Locations

| Purpose | Path |
|---------|------|
| Setup script log | `C:\AzureData\CustomDataSetupScript.log` |
| Kubernetes binaries | `C:\k` |
| Configuration/logs | `C:\AzureData`, `C:\k`, `C:ar` |

#### Escalation Path

1. Create CRI to `Azure Kubernetes/RP` using the ICM template
2. If RP determines Windows team escalation needed → create collab from Service Desk

#### Collecting Windows Logs

```powershell
Invoke-WebRequest -UseBasicParsing https://raw.githubusercontent.com/Azure/aks-engine/master/scripts/collect-windows-logs.ps1 | Invoke-Expression
```

Copy from Windows node to local machine via Linux debug pod + SCP + kubectl cp.

#### Not Currently Supported (as of 2023-12-11)
- Pod Identity (use Workload Identity instead)
- Kubenet
- Rotating Service Principals (use MSI or create new nodepool)

#### Exit Codes Reference
- Windows pod exit codes: https://windowsinternalservices.azurewebsites.net/Static/Errors/

---

## Scenario 8: ACI Terminologies for Troubleshooting
> 来源: ado-wiki-a-aci-terminologies-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### ACI Terminologies for Troubleshooting


#### Purpose

We created this document to familiarize the ACI Support team with some of the commonly used terminologies related to Azure Container Instances (ACI) used during the investigation of issues related to containers deployed in the ACI Platform.

#### Container Group Name (CG Name)

A container group is a collection of containers that get scheduled on the same host machine. The containers in a container group share a lifecycle, resources, local network, and storage volumes. It's similar in concept to a pod in Kubernetes.

How to get the Container Group Name: customer should provide the complete resource URI for the Container Group from the portal.

#### Cluster Deployment Name (caas name)

Cluster deployment refers to the active instance of a Container Group. There is only one active instance at a time. Execution cluster logs require the cluster deployment name (e.g., caas-xxx) as a reference.

##### Using Kusto Helper

Open [Kusto Helper](https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper) and update SubscriptionId, resourceGroup and containerGroup values. Get the corresponding cluster Deployment name from 'subscription Deployments' widget (task 0 must match).

##### Using Kusto Query

```sql
let BT = datetime(2023-04-14);let ET = datetime(2023-07-16);
let resURI = '/subscriptions/<<sub id>>/resourcegroups/<<rg name>>/providers/Microsoft.ContainerInstance/containerGroups/<<cg name>>';
cluster('accprod').database("accprod").SubscriptionDeployments
|where PreciseTimeStamp between (BT ..ET)
|where subscriptionId =~ split(resURI, "/")[2] and resourceGroup =~ split(resURI, "/")[4] and containerGroup =~ split(resURI, "/")[8]
|project PreciseTimeStamp,TaskName,clusterDeploymentName,containers,features,restartPolicy,ipAddress
```

> Tip: Choose the correct cluster deployment name matching the customer's reported timestamp. Name shown as caas-xxxx.

#### Execution Cluster (Service Fabric Cluster) ID

ACI RP leverages the Atlas platform. Each regional Atlas platform comprises hundreds of Service Fabric Clusters (execution clusters).

##### From Atlas Helper

Open [Atlas Kusto Helper](https://portal.microsoftgeneva.com/s/7892D386) and update the cluster deployment name under 'AppName'. Check the clusterId under the Application Deployments widget.

##### From Kusto Query

```sql
let caasname ='caas-8344afa1f75f452b8b179eea74439e5f';
let BT = datetime(2023-07-14);let ET = datetime(2023-07-15);
cluster('sflogs').database('telemetry').ApplicationDeploymentStartedEvent
|where PreciseTimeStamp between (BT .. ET)
| join kind=leftouter (cluster('sflogs').database('telemetry').ApplicationProvisioningTerminalEvent | where PreciseTimeStamp between (BT .. ET)) on resourceId, Tenant
| where resourceId has caasname
| project PreciseTimeStamp, Tenant,appStatus, poolId , clusterId, resourceId
```

#### Single Instance Name

The corresponding running application in the execution cluster is called Single Instance.

##### From Kusto Query

```sql
let caasname= 'caas-8344afa1f75f452b8b179eea74439e5f'; let poolname = '/pools/aci/clusters/60120f48a7cc48caa3586c1c4fc6b096-p-0';
let BT = datetime(2023-07-14);let ET = datetime(2023-07-15);
cluster('sflogs').database('telemetry').SbzExecSFEvent
|where PreciseTimeStamp between (BT .. ET)
| where TaskName == "Hosting"
| where Message has caasname
| parse EventMessage with stuff "Entity={ Id=" SingleInstanceName ",ApplicationName=fabric:/" appName ",InstanceId=" instanceid
| where appName =~ caasname
| where SingleInstanceName !contains "servicePkg"
| distinct SingleInstanceName
```

#### ACI Features Acronyms (Key)

- **BYOVNet**: Bring Your Own VNet deployment
- **Atlas**: Service Fabric based ACI platform
- **JobContainerGroup**: Container with restart policy Never/OnFailure
- **LogUploader**: Log Analytics workspace integration via Key
- **ManagedIdentity**: MSI for container identity
- **AzureFileVolume**: Azure Files volume mount
- **BigContainerGroups**: CGs with >16GB memory (subscription-enabled)
- **Confidential**: Confidential containers feature
- **DNSNameLabel**: Custom DNS name for public CG
- **EmptyDirVolume**: Ephemeral in-memory volume
- **GPU**: K8S-based (preview only)
- **InitContainers**: Initialization containers
- **L1VH**: Bare metal VM child resource hosting
- **MultiProtocols**: TCP and UDP enabled
- **Spot**: Spot/preemptible containers
- **UDP**: UDP protocol support

---

## Scenario 9: AGIC: Troubleshooting 404 Not Found
> 来源: ado-wiki-a-agic-troubleshooting-404.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Troubleshooting 404 Not Found

#### Workflow

```
Request → 404 Not Found
  ├─ Is request routed to correct backend? (see routing verification guide)
  │   ├─ NO → Troubleshoot wrong backend application reached
  │   └─ YES → Is backend application returning 404?
  │       ├─ YES → Troubleshoot backend application issues (see backend guide)
  │       └─ NO → Solve request path issues (see below)
```

#### Request Path Issues

When the 404 is caused by path mismatch, consider:

1. **Fix the request URL** to match application's expected paths
2. **Reconfigure the application** to listen on the requested path (customer dev team responsibility)
3. **Use `backend-path-prefix` annotation** to rewrite the path:
   ```yaml
   annotations:
     appgw.ingress.kubernetes.io/backend-path-prefix: "/actual-app-path"
   ```
   This maps external URLs to internal application paths. See: https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-annotations#backend-path-prefix

#### Related Guides

- [AGIC Request Routing Verification](./ado-wiki-a-agic-request-routing-verification.md)
- [AGIC Backend Application Issues](./ado-wiki-a-agic-backend-application-issues.md)

---

## Scenario 10: AGIC: Troubleshooting 502 Bad Gateway
> 来源: ado-wiki-a-agic-troubleshooting-502.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Troubleshooting 502 Bad Gateway

#### Overview

HTTP 502 in AGIC/AppGW setup: Application Gateway cannot reach any healthy backend to handle the request.

#### Workflow

```
Request → 502 Bad Gateway
  ├─ Are there healthy backend pool members?
  │   ├─ YES → Is this during rolling deployments?
  │   │   ├─ YES → Implement "Minimizing Downtime During Deployments" recommendations
  │   │   └─ NO → Troubleshoot backend application issues
  │   └─ NO → Troubleshoot backend health probe issues
```

#### Check Backend Health

##### Azure Portal (Customer)
Application Gateway → **Monitoring | Backend health** dashboard

##### Azure Support Center (CSS)
Application Gateway → **Backend Address Pools** panel

#### Minimize Downtime During Deployments

For 502 errors during rolling updates, follow:
https://azure.github.io/application-gateway-kubernetes-ingress/how-tos/minimize-downtime-during-deployments/

#### Related Guides

- [AGIC Backend Application Issues](./ado-wiki-a-agic-backend-application-issues.md)

---

## Scenario 11: AGIC: Troubleshooting 504 Gateway Timeout
> 来源: ado-wiki-a-agic-troubleshooting-504.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Troubleshooting 504 Gateway Timeout

#### Overview

Application Gateway enforces a request timeout. If backend does not respond within the timeout, HTTP 504 is returned to client.

#### Workflow

```
Request → 504 Gateway Timeout
  ├─ Check configured request timeout
  │   ├─ Is 504 response time ≈ configured timeout?
  │   │   ├─ YES → Backend is too slow, troubleshoot backend app
  │   │   └─ NO → Investigate other network/infra issues
```

#### Check Request Timeout

##### Kubernetes Ingress Annotation
```bash
kubectl describe ingress <INGRESS_NAME> -n <NAMESPACE>
```
Look for: `appgw.ingress.kubernetes.io/request-timeout` (default: 30 seconds)

##### Azure Portal
Application Gateway → **Backend Settings** → Request timeout value

##### Azure Support Center (CSS)
Application Gateway → **Backend HTTP Settings Collections** → Request timeout

#### Diagnosis

Compare the 504 response time (time from request to 504 response) with the configured timeout:
- **Match** → Timeout is working as expected; backend is genuinely slow
- **Mismatch** → Investigate network path or AppGW configuration issues

#### Resolution

- Increase `request-timeout` annotation if backend legitimately needs more time
- Or investigate and fix backend application slowness

Ref: https://azure.github.io/application-gateway-kubernetes-ingress/annotations/#request-timeout

---

## Scenario 12: Troubleshooting using ASI
> 来源: ado-wiki-acr-troubleshooting-using-asi.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting using ASI

This page is to bring awareness of an aggregate of resources about ACR within Azure Service Insights (ASI). Check out the [page for ACR within ASI](https://asi.azure.ms/services/Azure%20Container%20Registry/pages/ACR%20Home) and familiarize yourself with the existing troubleshooting resources.

#### Getting Started

1. Navigate to the ACR page within ASI
2. Click on "Search for a Registry"
3. Set the time range for analysis
4. Enter the container registry identifier:
   - URI (ie: /subscriptions/<subscription-id>/resourceGroups/rg-name/providers/Microsoft.ContainerRegistry/registries/crname)
   - Login server (example: crname.azurecr.io)
   - Partial registry name (example: crname)
5. Click the Play icon or hit Enter on the Search box to execute the query

#### Key Features

- Graphic representation of registry data
- Quick query capabilities
- Hub of resources in a single interface
- Various queries available in the results table (e.g., Private endpoints data)
- Links to documentation and prefilled Jarvis actions

#### Important Notes

- ASI imposes a limit of 5000 rows on Kusto results
- Set a good timestamp to avoid missing entries due to an ample analysis period generating more than 5000 rows
- Data availability depends on enabled features and available data

#### Owner and Contributors

**Owner:** Walter Lopez <walter.lopez@microsoft.com>

---

## Scenario 13: Troubleshooting Wrong Backend Application Reached
> 来源: ado-wiki-agic-troubleshooting-wrong-backend.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Wrong Backend Application Reached

The following workflow can be used to troubleshoot AGIC cases where the requests are found to be reaching the wrong backend application.

#### [1] Is the DNS resolution for the FQDN used in the URL OK?

1. Confirm the IP address to which the FQDN used in the request is actually resolving to. Use standard DNS lookup tools such as `dig` or `nslookup`.

2. Use the following kubectl command to check the public IP address assigned to the AppGW frontend:

    ```bash
    kubectl get ingress -A
    ```

#### [2] Are there multiple matching ingress rules for the request?

Having multiple rules matching a given request can lead to inconsistent and/or undesired behavior. Use the following command to display the existing ingress rules:

```bash
(echo "NAMESPACE INGRESS HOST PATH SERVICE PORT" && kubectl get --all-namespaces ingress -o json | jq -r '.items[] | . as $parent | .spec.rules[] | .host as $host | .http.paths[] | ($parent.metadata.namespace + " "  + $parent.metadata.name + " " + ($host // "*") + " " + .path + " " + .backend.service.name + " " + (.backend.service.port.number // .backend.service.port.name | tostring))') | column -s\  -t
```

Based on this output check for the following common scenarios:

- Check that there are no 2 rules (specified in the same or different ingress resources) which share the same value for both host and path
- Check that there are no 2 rules (specified in the same or different ingress resources) which do not specify host and share the same value for path (if no host is specified, the rule matches all inbound HTTP traffic arriving at the specified IP address as long as the rule's path matches the request's path)

---

## Scenario 14: Collect the CPU usage on Node and find the mapping relations
> 来源: ado-wiki-aks-collect-cpu-usage-node-pod-mapping.md | 适用: 适用范围未明确

### 排查步骤

#### Collect the CPU usage on Node and find the mapping relations

#### Summary

This guide provides multiple methods for collecting and analyzing CPU usage on AKS nodes, with techniques to map CPU consumption to specific pods/containers.

#### Method 1: Collect Perf metrics from Log Analytics (Container Insights)

**Prerequisites**: Container Insights enabled on the AKS cluster.

1. In ASC, find the relevant LA workspace of the AKS cluster
2. Navigate to LA workspace → "Query Customer Data"
3. Use KQL to collect Perf metrics:

```kql
let clusterName = "<clusterName>";
let podName = "<podName>";
let namespaceName = "<namespaceName>";
let splictDeli = strcat(clusterName,"/");
KubePodInventory
| where ClusterId contains clusterName
| where Name contains podName and Namespace contains namespaceName
| extend container = tostring(split(ContainerName, "/")[1])
| distinct Name, container, ContainerName
| join
(
    Perf
    | where ObjectName == "K8SContainer" and CounterName contains "cpuUsageNanoCores"
    | extend ContainerName = tostring(split(InstanceName, splictDeli)[1])
    | extend millicore = CounterValue/1000000
)
on ContainerName
| summarize percentile(millicore, 95) by container, bin(TimeGenerated, 1m)
| sort by TimeGenerated asc
//| render timechart
```

**Note**: This method is helpful when analyzing deleted pods (Insights UI only shows existing containers).

#### Method 2: Collect Perf metrics via script on specific node

Use the `podMetricsInNode.sh` script to collect real-time CPU/Memory metrics per pod on a specific node.

Script: https://raw.githubusercontent.com/SnoWolfT/code/main/podMetricsInNode.sh

#### Method 3: Privileged debug pod + collect_cpu.sh

For detailed per-process CPU mapping on a node:

1. Deploy a privileged debug pod using a YAML manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debugger-<nodeName>
  labels:
    func: troubleshoot
    debug: node
spec:
  containers:
  - name: debugger
    image: mcr.microsoft.com/dotnet/runtime-deps:6.0
    stdin: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: host-root-volume
      mountPath: /host
  volumes:
  - name: host-root-volume
    hostPath:
      path: /
  hostNetwork: true
  hostPID: true
  restartPolicy: Always
  nodeName: <nodeName>
```

2. Apply: `sed "s/<nodeName>/aks-userpool-xxx/g" debug.yaml | kubectl apply -f -`
3. Access node: `chroot /host && bash`
4. Create `collect_cpu.sh` script:

```bash
#!/bin/bash
DATE=`date +"%m%d_%H"`
(echo "++++++++++++++++++++++++++++";date;ps -eo pcpu,pmem,pid,pidns,comm,user,uid --forest | awk 'NR==1 {printf "hostname/podName\t";print $0} NR>1 {cmd="nsenter -t "$3" -u hostname 2>/dev/null"; cmd|getline output; close(cmd); printf "%s\t%s\n", output, $0}';echo "========CPU cores Usage:";mpstat -P ALL 2 1|grep Average) >> /tmp/collect_cpu_${DATE}
```

5. Schedule with crontab: `* * * * * /tmp/collect_cpu.sh`
6. Results show hostname/podName mapped to CPU/memory per process

**Key feature**: Uses `nsenter -t <PID> -u hostname` to map process PIDs to pod names.

---

## Scenario 15: Troubleshooting Flow
> 来源: ado-wiki-aks-dns-troubleshooting-workflow.md | 适用: 适用范围未明确

### 排查步骤

##### 1 - Collect the facts

---

## Scenario 16: Kusto query to get the info of AKS nodes and the metric dashboard links
> 来源: ado-wiki-aks-kusto-node-info-metrics-dashboards.md | 适用: 适用范围未明确

### 排查步骤

#### Kusto query to get the info of AKS nodes and the metric dashboard links

#### Summary and Goals

This WIKI provides one quick method to get the information of AKS nodes and the metric dashboard links.

##### Prerequisites

The entitlement, AKS Kusto Partners, to access the database, AKSccplogs.
The entitlement, FC Log Read-Only Access, to access the database, AzureCM.

##### Involved Components

* ASC/ASI - get the resource ID or the Control Plane ID

#### Implementation Steps

##### Query 1: Get AKS node info + metrics dashboard by Control Plane ID

Uses `AKSccplogs` and `AzureCM` databases. Requires Control Plane ID as input.

Key tables:
- `AgentPoolSnapshot` — node pool metadata (vmSize, osSku, orchestratorVersion)
- `LogContainerSnapshot` — infra info (virtualMachineUniqueId, region)
- `KubeAudit` — node objects from audit logs

The query:
1. Fetches node pool metadata from `AgentPoolSnapshot`
2. Joins with `LogContainerSnapshot` for VM unique IDs and region info
3. Maps region to AzComputeShoebox account name
4. Constructs Geneva VMPerf dashboard links per node
5. Uses `KubeAudit` to enumerate current nodes and their properties
6. Outputs: pool, vmSize, base36 name, roleInstanceName, creation time, VM unique ID, region, and clickable vmPerf dashboard link

Parameters:
- `qCCP` — Control Plane ID
- `qNodePool` — (optional) filter to specific node pool
- `qInstance` — (optional) filter to specific instance

Output columns: pool, vmSize, base36, roleInstanceName, creationTime, virtualMachineUniqueId, RegionFriendlyName, AzComputeShoebox, vmPerf, nodeId, containerId

##### Query 2: Get node pool metrics by Subscription ID and VMSS name

Uses `AzureCM.LogContainerSnapshot` and `AzureDCMDb.ResourceSnapshotHistoryV1`.

This query:
1. Finds all VMs matching the VMSS name in the subscription
2. Joins with DCM data for SocNodeId and CpuArchitecture
3. Generates per-VM and all-VM Geneva VMPerf dashboard links

Parameters:
- `subscription` — Subscription ID
- `vmname` — VMSS name

##### Multi-node dashboard

To check multiple AKS nodes in one dashboard, concatenate virtualMachineUniqueId values with commas in the Geneva dashboard URL.

#### Tips

- ASI Kusto queries are a good reference for building custom queries
- The RegionMap datatable maps Azure region names to AzComputeShoebox account names for Geneva dashboards

#### Owner

Tom Zhu <zhuwei@microsoft.com>

---

## Scenario 17: AKS and Network Team Common Troubleshooting — Overview
> 来源: ado-wiki-aks-network-troubleshooting-methodology-overview.md | 适用: 适用范围未明确

### 排查步骤

#### AKS and Network Team Common Troubleshooting — Overview

Author: @mosbah.majed (aks), @mariochaves (aks), @lesantos (net)

One-stop guide for troubleshooting **Networking** cases from an **AKS support engineer** perspective.

#### Sub-sections

1. Troubleshoot AKS cluster issues
2. What is the Network deployment type used in the AKS cluster
3. Troubleshoot Common issues when working with customer
4. Troubleshooting checklists
5. Troubleshoot Connectivity issues
6. Troubleshoot Performance issues
7. Troubleshoot Azure Firewall
8. Troubleshoot Azure ExpressRoute
9. Troubleshoot Azure Loadbalancer Health and Health Probes
10. Troubleshoot Network Virtual Appliances and routing
11. Troubleshoot NSG Common Scenarios
12. Troubleshoot DNS Common Scenarios
13. Common Troubleshoot Steps
14. Common Troubleshoot tools and command lines

#### How kubectl apply works (Kubernetes Control Plane Flow)

```
User → API Server → etcd (save state)
Controller Manager → API Server (check changes)
Scheduler → API Server (watch unassigned pods)
API Server → Scheduler (notify pod with nodeName="")
Scheduler → API Server (assign pod to node)
API Server → etcd (save state)
Kubelet → API Server (look for newly assigned pods)
API Server → Kubelet (bind pod to node)
Kubelet → Container Runtime (start container)
Kubelet → API Server (update pod status)
API Server → etcd (save state)
```

#### Approach

- Main workflow = entry point for ALL networking cases troubleshooting
- Secondary workflows derive from main workflow addressing specific error conditions
- Each sub-section handles a specific networking domain (firewall, LB, NVA, NSG, DNS, etc.)

---

## Scenario 18: Working example for using the per node public IP feature for access to a container
> 来源: ado-wiki-aks-per-node-publicip-use-examples.md | 适用: 适用范围未明确

### 排查步骤

#### Working example for using the per node public IP feature for access to a container

Recently we released a feature that allows for each node in an AKS cluster to get assigned a unique public IP. This doc covers two use examples: NodePort service and hostNetwork with node selector.

#### Pre-requisite

Requires an AKS cluster or nodepool created with `--enable-node-public-ip`:

- Cluster: `az aks create -g MyResourceGroup -n MyCluster -l eastus --enable-node-public-ip`
- Node pool: `az aks nodepool add -g MyResourceGroup --cluster-name MyCluster -n nodepool1 --enable-node-public-ip`

If created with the feature, `kubectl get nodes -o wide` shows public IPs in the "External-IP" column.
If the feature is added to a new nodepool on an existing cluster, use `az vmss list-instance-public-ips` instead.

#### Example 1 — NodePort Service

1. Deploy app with a `type: NodePort` Service
2. Check which node the pod runs on, the node's public IP, and the assigned NodePort
3. Modify the AKS NSG: restrict Source to your IP, Destination to cluster subnet, Destination port = NodePort
4. Access app via `http://<node-public-ip>:<nodeport>`

#### Example 2 — hostNetwork + nodeSelector

1. Deploy with `hostNetwork: true` and `nodeSelector` targeting a specific node
2. Pod listens directly on the node's network interface (port 80)
3. Open NSG for port 80 to the node's public IP
4. Access via `http://<node-public-ip>:80`

Key: hostNetwork pods can communicate with all pods on all nodes without NAT.

Both examples require NSG rules to allow inbound traffic to the node's public IP.

---

## Scenario 19: Troubleshooting Flow
> 来源: ado-wiki-aks-troubleshooting-dns-issues-lab.md | 适用: 适用范围未明确

### 排查步骤

DNS resolution layers to check (top to bottom):
1. CoreDNS pods
2. CoreDNS service
3. Nodes
4. VNET DNS

##### 1. Testing at CoreDNS pod level

Deploy test pod:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: aks-test
spec:
  containers:
  - name: aks-test
    image: sturrent/debian-ssh
    command: ["/bin/sh"]
    args: ["-c", "while true; do sleep 1000; done"]
EOF
```

Get CoreDNS pod IPs and test resolution:

```bash
kubectl -n kube-system get po -l k8s-app=kube-dns -o wide
FQDN="db.contoso.com"; DNS_SERVER="<COREDNS_POD_IP>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

##### 2. Testing at CoreDNS service level

```bash
kubectl -n kube-system get svc kube-dns
FQDN="db.contoso.com"; DNS_SERVER="<KUBEDNS_SERVICE_IP>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

##### 3. Testing at Node level

```bash
grep ^nameserver /etc/resolv.conf
FQDN="db.contoso.com"; DNS_SERVER="<DNS_SERVER_IN_NODE_CONF>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

##### 4. Testing at VNET DNS level

Check VNET DNS server configuration and verify each server can resolve the target record.

---

## Scenario 20: Troubleshooting Flow
> 来源: ado-wiki-aks-troubleshooting-egress-issues.md | 适用: 适用范围未明确

### 排查步骤

```
Start
  → Identify the connectivity path (source, destination, hops)
  → Review health/performance of nodes and outbound appliances (SLB, NATGW)
  → Review health/performance of CoreDNS pods
  → Review security layer (Firewall, NSG, Network policies)
  → Capture traffic and review connectivity status
  → Develop hypothesis
  → Is issue external to AKS?
    Yes → Identify support groups → Collaborate → Action plan
    No → Action plan
  → Implement action plan and observe results
  → Resolved? Yes → Document findings. No → Escalation → restart
```

---

## Scenario 21: Troubleshooting Flow
> 来源: ado-wiki-b-AKS-AD-First-Basic-troubleshooting-steps.md | 适用: 适用范围未明确

### 排查步骤

##### Determining if RBAC is enabled in the cluster

The customer can confirm the RBAC configuration of the cluster by looking at the cluster attributes on the Overview blade in Azure Portal.

They can also find the setting by running the following Azure CLI command: `az aks show -g <resource-group> -n <cluster-name> -o tsv --query "enableRbac"`.

##### Checking for Service Principals or Managed Identities

Within ASC, we can identify if the cluster is using a Service Principal or Managed Identity by looking at the `Identity` and `IdentityProfile` properties of the cluster. If these properties have `UserAssignedIdentity` or `SystemAssignedIdentity`, the cluster is using managed identities; if the fields only have object and client IDs, the cluster is using a Service Principal.

We can verify by using Tenant Explorer in ASC to check the object or client IDs found in the properties mentioned above.

Using Azure CLI, we can get the identity information for the cluster using the following commands:

```bash
az aks show -g <resource-group> -n <cluster-name> --query "identity" # Get the AKS cluster identity
az aks show -g <resource-group> -n <cluster-name> --query "identityProfile" # Get the AKS kubelet identity (if different than the cluster identity)
```

The output from Azure CLI will resemble the following:

```json
// If the cluster has a single identity:
{
  "principalId": null,
  "tenantId": null,
  "type": "UserAssigned",
  "userAssignedIdentities": {
    "/subscriptions/.../Microsoft.ManagedIdentity/userAssignedIdentities/ccp-identity": {
      "clientId": "48c738d2-xxxx-xxxx-xxxx-96337e34d3e0",
      "objectId": "dcee7924-xxxx-xxxx-xxxx-599cdb19addd"
    }
  }
}

// If the cluster has a separate kubelet identity:
{
  "kubeletidentity": {
    "clientId": "48c738d2-xxxx-xxxx-xxxx-96337e34d3e0",
    "objectId": "dcee7924-xxxx-xxxx-xxxx-599cdb19addd",
    "resourceId": "/subscriptions/.../Microsoft.ManagedIdentity/userAssignedIdentities/gp-kubelet-identity"
  }
}
```

We can also find these properties by running a `GetManagedCluster` command in Jarvis.

##### Checking for AAD integration

Checking the cluster in ASC, if the cluster has an AAD integration the `Aad Profile` attribute on the cluster will be non-null. If the cluster was integrated with AAD using the legacy integration, `aadProfile.Managed` will be false; if they're using the managed AAD integration, `aadProfile.Managed` will be true.

Using Azure CLI, the `az aks show -g <resource-group> -n <cluster-name> --query aadProfile` command will return the integration details if the cluster is integrated.

Using ASI, the feature checkboxes at the bottom of the main pane (above the timeline) will have either the `AAD (legacy)` or `AAD (managed)` checkbox checked.

#### Legacy Integration - Identity Information

If the cluster is using a legacy AAD integration, the server application ID, client application ID, and server application secret will be displayed in ASC as part of the AAD Profile attribute.

##### Checking for authentication issues in Kusto

Using the following Kusto query, you can check for authentication issues in the `guard` pod that runs in the cluster control plane:

```sql
//checks for control plane, guard pod errors. database: AKSccplogs
cluster("AKSccplogs").database("AKSccplogs").ControlPlaneEventsAll
| ccpNamespace == "{ccp-namespace-of-cluster}"
| where TIMESTAMP > ago(1d)
| where category=="guard"
| project TIMESTAMP, properties
| where properties contains "error"
```

---

## Scenario 22: Troubleshooting Basics
> 来源: ado-wiki-b-aci-troubleshooting-basics.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Basics


[Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/ACC/Kusto%2520Helper)

In order to find whether a ContainerGroup deployment instance is on k8 or Atlas you just need to go to the second table in Kusto Helper titled **SubscriptionDeployments,** find the **SubscriptionDeploymentStart** that took place on the time of your incident (or before if you are investigating something that went wrong last) and look at the **clusterId** column of it.

If the cluster id looks like "**caas-prod-westus2-linux-55**" then the deployment is on **K8**, this will be the name of the cluster in our backend, and the node column to it's right will be the name of the node that the deployment is running on.

If the cluster id looks like "**caas-prod-westus2-atlas-azurecontainerinstance-13015978-0561-4f4c-bf5a-87b779ecd009**" then this is an **Atlas** deployed container group.

For **K8** deployments, most of the things you will need are in the kusto helper dashboard. For **Atlas** based deployments you will need to move on over to the [Atlas Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/AzureSeabreeze/Seabreeze/Atlas%2520Kusto%2520Helper) in addition to the Kusto Helper dashboard.

#### Kusto Helper

[Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/ACC/Kusto%2520Helper)

Kusto helper dashboard is basically a bunch of very common kusto queries that we used to run in dashboard form.

Usually when investigating something you will start with 1 piece of information (like containerGroupName or correlationId) and plug it in the parameter filters at the top. Then as you investigate more and more you will get other pieces to plug in (like an activityId)

Here are the important tables that it has:

##### Http Incoming

This is for seeing what the requests that came in were. Useful columns are correlationId and activityId. You can either grab them from an incoming request to follow through the traces in the other tables or grab from other tables to filter the incoming request to find the corresponding http request.

##### SubscriptionDeployments

This is probably the most commonly needed table. Here you will find all operations that the ContainerGroup underwent, like start/stop/nodeassigned/deleted. Here you will find the clusterId column and clusterDeploymentName to be helpful. For **Atlas** deployments the **clusterDeploymentName** will be the Atlas resources' name. You will also find all kinds of metadata about the ContainerGroup here, like cpu, containers, restartPolicy, features, vnet, etc.

##### SubscriptionDeploymentEvents

Here you will find the events that the ContainerGroup has on it. There are few tricky things about the way these events are presented.

The **TIMESTAMP** column is not when the event happened, but when our control plane created a log of this event.

The **firstTimeStamp** and **lastTimestamp** columns (same if event **count** is 1) will be corresponding to when the events actually happened.

The control plane does not stream the events from the backend into here, it is polling based. So you will see the same events multiple times (one for each poll), and there could be events that have happened that don't show up here, since we only poll during in progress operations like a deployment.

We log events that came from all incarnations of the containerGroup, so if the user uses the Stop/Start feature you will see a lot of events here since they are from all instances. You can use the **clusterDeploymentName** or **clusterId** columns to filter for the instance you want.

##### Job Traces and Errors

These will be the traces and errors that are logged in our jobs. You filter these by **correlationId** or **activityId** to correlate with the other pieces. For example you can find consistency job logs from a deployment by using the correlationId seen on its SubscriptionDeploymentStart task seen in the SubscriptionDeployments table from above.

##### Traces and Errors

Here you will find traces and errors that are logged in in our non job classes, like http controllers. You can use the **correlationId** of an httpIncoming request to see cluster selector logs and flighting computation. You can also investigate a 500 error code reponse to the http request by finding the exception logged here.

##### Http Outgoing

This is similar to http incoming, but instead is the http calls that ACI control plane is sending out (to clusters, azure, Atlas, etc.)

#### Atlas Kusto Helper

[Atlas Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/AzureSeabreeze/Seabreeze/Atlas%2520Kusto%2520Helper)

Atlas Kusto Helper is similar to Kusto helper, but for Atlas instead of ACI RP. Similar to when investigating in Kusto helper, you will start with 1 piece of information (usually AppName) and plug it in the parameter filters at the top. Then you can find the clusterId deployment time, and Tenant which will get you logs from Atlas control plane and execution clusters.

Here are the tables that it has:

##### Application Deployments

This will contain an entry for the app deployments that happen and their terminal status (Succeeded of Failed). You can grab the clusterId, Tenant, and optionally the PreciseTimeStamp for futher investigation. You also will have the full resourceId of the app which can be used in SbzExplorer to get to full exec cluster traces (History button).

##### Atlas RP Traces

This will contain the Atlas control plane traces. Here you can find container json dumps from the application to see when things started to come up, or you can look at any failures that may have happened. You can find an **activityId** column which can be used to filter down to an activity. ActivityIds are in the form "**\|7a290331-4d61235d8e8894dc.**" and subActivity Ids will be denoted by items appended after a period like "\|7a290331-4d61235d8e8894dc**.a1b1c615\_**".

##### Http Requests

This will be similar to ACI's, but instead of the correlationId and activityId in the guid format, there is only activityId in the above format to correlate with traces.

##### Execution Cluster Traces

This will be the sf traces that we emit from the cluster. Fill in the **clusterId** and a short timespan (~30 mins) in order for this to load fast enough. Also fill in the **TraceTaskName**. For the task name "**Hosting**" is the most commonly needed when investigating, it will have all ContainerD interactions (eg find containerId and podId in OPodStarted and OnContainerCreated), container exits (**ApplicationContainerInstanceExited**), download/start errors, etc. You can also use the "**CRM**" task name to see plb operations to see if there are any moves. "**CM**" is another useful one to diagnose SF control plane issues during application create. For Hosting traces you can note the Node to know what node the instance was on.

##### ContainerD Traces

These will be the containerD runtime traces. You can filter them once you put in clusterId (Node found in Exec cluster traces above are optional but makes query faster) and also a **ContainerDFilter** in the form of **containerId** or **podId** or **TraceId** (found in other containerd logged events).

#### Contributor

[Migrated from PG Onenote] by <kegonzal@microsoft.com>

#### Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>

---

## Scenario 23: Troubleshooting Kubernetes Service Account Tokens and Secrets
> 来源: ado-wiki-b-troubleshooting-k8s-service-account-tokens.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Kubernetes Service Account Tokens and Secrets

#### Summary

This document demonstrates steps to create K8s Secrets/Tokens and validate/troubleshoot existing K8s Service Account Token Secrets. Useful for cases where service account authentication fails or tokens expire.

#### 1. Create a Kubernetes Service Account, Role, RoleBinding, ClusterRole binding

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sample-service-account
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-role-binding
subjects:
- kind: ServiceAccount
  name: sample-service-account
  namespace: default
roleRef:
  kind: Role
  name: sample-role
  apiGroup: rbac.authorization.k8s.io
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-cluster-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-cluster-role-binding
subjects:
- kind: ServiceAccount
  name: sample-service-account
  namespace: default
roleRef:
  kind: ClusterRole
  name: sample-cluster-role
  apiGroup: rbac.authorization.k8s.io
```

#### 2. Create Token for the Service Account

> **NOTE**: In Kubernetes 1.24+, Service Account tokens are no longer automatically generated.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sample-service-account-token
  annotations:
    kubernetes.io/service-account.name: sample-service-account
type: kubernetes.io/service-account-token
```

#### 3. Inspecting the Service Account Token

Create a sample pod and read the token:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test
spec:
  serviceAccount: sample-service-account
  containers:
  - image: nginx
    name: test
```

```bash
kubectl exec test -- cat /run/secrets/kubernetes.io/serviceaccount/token
```

Token can also be read from the secret:
```bash
kubectl describe secret sample-service-account-token
```

#### 4. Checking Token Expiry and Details via JWT.io

Paste the token value into https://jwt.io to decode. Key fields:
- `exp`: Token expiry date (Unix timestamp)
- `iss`: Issuer (AKS API server URL)
- `sub`: Subject (system:serviceaccount:namespace:name)
- `aud`: Audience (AKS cluster URL)

#### 5. Testing Token Validity Using curl

```bash
#### Successful response
curl -k -X GET -H "Authorization: Bearer $TOKEN" https://$apiserver/api/v1/pods

#### If token expired/invalid, returns HTTP 401 Unauthorized
curl -k -X GET -H "Authorization: Bearer badtoken" https://$apiserver/api/v1/pods
#### Returns: {"kind":"Status","status":"Failure","message":"Unauthorized","reason":"Unauthorized","code":401}
```

---

## Scenario 24: Static Egress Gateway IP
> 来源: ado-wiki-c-Static-Egress-Gateway-IP.md | 适用: 适用范围未明确

### 排查步骤

#### Static Egress Gateway IP


#### Overview

Static Egress Gateway provides an efficient way for pods in an AKS cluster to have configurable egress IPs different from the default cluster outbound.

To enable Static Egress Gateway, cx need to first create or update an AKS cluster with `--enable-static-egress-gateway` flag to install the addon components. Then cx need to create one or more Gateway nodepools for traffic routing. They need to specify `--mode Gateway` (this is the 3rd mode, other than `System` and `User`) and `--gateway-prefix-size` (default to 31) in their nodepool creation command.

Static Egress Gateway addon components are implemented in upstream project [Azure/kube-egress-gateway](https://github.com/Azure/kube-egress-gateway) while rp is responsible for Gateway agentpool provisioning and addon integration.

Resources:

- [PRD](https://microsoft.sharepoint.com/:w:/r/teams/azurecontainercompute/_layouts/15/Doc.aspx?sourcedoc=%7BD25D940B-8296-49E7-8AA2-E2C66C6F6EB4%7D&file=Static%20Egress%20Gateway%20PRD.docx&action=default&mobileredirect=true)
- [Design Doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/625071/Static-Egress-Gateway-Design-Doc)
- [Component Wiki](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/598115/Area-Static-Egress-Gateway)

---

#### Feature Enabled or Not

To check whether a cluster has static egress gateway feature enabled or nor, check whether `networkProfile.staticEgressGatewayProfile.enabled` is set in the ManagedCluster properties:

```json
  "networkProfile": {
    ...
    "ipFamilies": [
      "IPv4"
    ],
    ...
    "staticEgressGatewayProfile": {
      "enabled": true  # this should be set to true
    }
  },`
```

To check whether an agentpool is in Gateway mode, and check its gateway prefix size, check its `mode` is set to `Gateway` and `gatewayProfile.publicIpPrefixSize` in the agentpool properties:

```json
  ...
  "name": "gwnp", # name of the ap
  "mode": "Gateway", # mode should be set as Gateway
  "gatewayProfile": {
    "publicIpPrefixSize": 31 # this is the gateway public IP prefix size
  }
  ...
```

From ASI:

![ASI-static-egress.png](/.attachments/ASI-static-egress-0b259efc-8f29-4b6c-b799-7fc4f213955a.png)

---

#### Gateway Agentpool Provisioning

Gateway-mode agentpool (we will use Gateway agentpool for short) provisioning is pretty much same as the system/user mode agentpool. The minor differences include:

1. Gateway ap nodes have k8slabel `kubernetes.azure.com/mode` set to `Gateway`.
2. Gateway ap vmss has vmss tag `aks-managed-gatewayIPPrefixSize` set to the number specified in `--gateway-prefix-size` argument, expected to be within `[28, 31]`.
3. Gateway ap nodes have taint `{
"effect": "NoSchedule",
"key": "kubernetes.azure.com/mode",
"value": "gateway"
}` to prevent workload from being scheduled on them.
4. Gateway ap instance upgrader follows the max-unavailable logic: always take down 5% of nodes for upgrade, see [vmssgatewayinstancesupgrader.go](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-rp?path=%2Fresourceprovider%2Fserver%2Fmicrosoft.com%2Fasyncoperationsprocessor%2Foperations%2Fmanagedcluster%2Fclusterupgrader%2Fvmssgatewayinstancesupgrader.go&version=GBmaster&_a=contents)

In case there's issue provisioning a Gateway agentpool, refer to rp `AsyncContextActivity` log for details.

---

#### Addon Components

Static Egress Gateway is composed of 3 main components:

- `kube-egress-gateway-controller-manager` deployment running in CCP namespace, responsible to provision VMSS secondary IPConfigs and gateway loadBalancer.
- `kube-egress-gateway-daemon-manager` daemonSet running on overlay **Gateway ap nodes** only, responsible to setup traffic routing schemes on each gateway node.
- `kube-egress-gateway-cni-manager` daemonSet running on overlay **System/User ap nodes** only, responsible to install cni plugin binary, configuration file, and communicate as proxy between `kube-egress-gateway-cni` and apiserver.
  `kube-egress-gateway-cni` is a chained CNI plugin that is invoked after the main CNI plugin (e.g. AzureCNI). It's responsible to provision the wireguard interface and peer, routes and iptables rules in the pod network namespace.

`kube-egress-gateway-controller-manager` pods run in CCP namespace, you can check the log from kusto:

```sql
https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAAwsuSSzJTHZNL0otLnbOzyspys%2FJSS3iqlEoz0gtSlUIKEpNzixODcnMTQ0uScwtULBTSEzP1zBK0QQADdHhfjkAAAA%3D

StaticEgressController
| where PreciseTimeStamp > ago(2d)
```

`kube-egress-gateway-daemon-manager` and `kube-egress-gateway-cni-manager` pods run in `aks-static-egress-gateway` namespace in overlay. We do not collect their logs to kusto at the moment.

Static Egress Gateway controllers reconcile based on a bunch of CRs:

- `staticgatewayconfigurations.egressgateway.kubernetes.azure.com`:
  This is the only CRD cx should be aware of. Cx create staticgatewayconfigurations manually to provision an egress gateway. staticgatewayconfiguration objects are namespaced and should be placed in the same namespace where the pods that use the egress gateway are.
- `gatewaylbconfigurations.egressgateway.kubernetes.azure.com`:
  Internal CRD. Used to reconcile LB resources. Created with the same namespace/name as the staticgatewayconfiguration objects.
- `gatewayvmconfigurations.egressgateway.kubernetes.azure.com`:
  Internal CRD. Used to reconcile VM secondary IPConfigs. Created with the same namespace/name as the staticgatewayconfiguration objects.
- `gatewaystatuses.egressgateway.kubernetes.azure.com`:
  For troubleshooting purposes, each gateway node is associated with a gatewaystatus object to list the ready staticgatewayconfigurations and peers provisioned on the node.
- `podendpoints.egressgateway.kubernetes.azure.com`:
  For each pod annotated to use a staticgatewayconfiguration, a podendpoint object with the same namespace/name as the pod is created. Gateway daemon monitors this object and sets up wireguard peer on the Gateway nodes.

You can check `kube-audit` log for the CRUD of these CR objects.

---

#### Network Connectivity

There are multiple factors that affect network connectivity. If all pods in CCP and overlay are running properly, then need to follow this [upstream troubleshooting guide](https://github.com/Azure/kube-egress-gateway/blob/main/docs/troubleshooting.md) to investigate further.

---

#### Private IP Support

Private IP support refers to having static _private_ IPs for each gateway configuration. The setup is mostly the same with the only difference from the user's perspective being the use of VirtualMachine node pool type on the Gateway pool.

When a static gateway configuration is created, the field for `provisionPublicIPs` can be set to false. This will create a set of private IPs from the gateway's subnet based on the prefix size (the same way the number of public IPs get created based on the prefix size). The IPs can be read from the status of the CRD. Those will be static for the lifetime of the StaticGatewayConfiguration.

Under the hood there are a few notable differences:

##### AKS-RP NICAllocator

The reason VirtualMachines are required is because we need to keep the private IPs around as a node pool scales up/down which can't be done in VMSS. With VirtualMachines, the NICs are created and managed separately from the VMs. When a gateway pool with type=VMs is created, then the number of VMs is based on `count` but the number of NICs is based on the gateway prefix size. For example, if a VM gateway pool is created with prefixSize=30 and count=2 then 2 VMs will be created but 4 NIC resources are created. This allows static allocation of private IPs, independent of the number of current nodes.

This also means that the NIC suffix id is not guaranteed to match the suffix id of the VM it is attached to. There is a [nicAllocator](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/resourceprovider/sharedlib/vms/operator/nic.go&version=GBmaster&line=50&lineEnd=51&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents) in RP that gets called from the VM reconciler to assign available NICs to new VMs or release NICs when VMs scale down.

There would need to be changes made if we allowed auto-scaling a gateway node pool, but for now the only supported way to scale a gateway node pool is via RP.

##### Gateway Controller handles public IPs

The upstream gateway controller handles creating/deleting public IPs out of a public IP prefix. This is in contrast to VMSS where the public IP prefix can be added to the VMSS profile and then CRP will handle the allocation of public IPs to each instance.

The gateway controller is where most of the changes went when we added private IP support - that code is here: <https://github.com/Azure/kube-egress-gateway/blob/382fb91a4902ccb2863ed691cb45620c1ad419b9/controllers/manager/agentpoolvms.go#L50>

---

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
- Jordan Harder <joharder@microsoft.com>

---

## Scenario 25: Troubleshooting VM Availability
> 来源: ado-wiki-c-VM-Availability-Troubleshooting-guideline.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting VM Availability


#### Summary

Every time that we have cases that customers request us to give them why a VM was restarted in a given time, some preemptive checks can be done before opening collabs to VM team without any verification and proof of our suspects.

#### How can I investigate VM Availability issues?

1. Open the Node in ASC and check for the State status in the VM overview.

2. The VM _should_ show a `Converged` state. If the VM is not `Failed` but has a value other than `Converged`, navigate to the Diagnostics tab.

   - At Screenshot area click on **+ Add Screenshot**. If the screenshot is at the login screen:
     - Check guest agent and extensions if they are healthy. If they aren't, check Guest Agent TSG.
     - If it's not at login, collect logs from Inspect IaaS Disk and check syslog for boot issues (e.g., Kernel Panic). Reimage/Restart the node to see if it fixes the problem. If problem persists, open collab for VM team.

3. If screenshot is not at login point, check the Events tab for errors.

4. Check for the following error signatures:

   - `ComputeAllocationFailureInZone`
   - `ComputeAllocationFailure`
   - `OverconstrainedZonalAllocationRequest`
   - `ZonalAllocationFailed`

   If these error signatures are present, follow the [VM VMSS Allocation Errors](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/VM-VMSS-Allocation-Errors) TSG.

---

## Scenario 26: Determine when a collaboration is required
> 来源: ado-wiki-collaborations-aks-network-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### Determine when a collaboration is required

Network issues on AKS might involve network paths outside AKS scope like VPNs, express route, firewalls, and other specific network topology setups. Some scenarios will require the help of other Azure support teams in order to follow a similar troubleshooting approach for the resources and components used on those network paths external to AKS. Another possibility will be around backend issues that could required assistance from EEE and/or PG, for example issues with AKS CCP or underlay components.

Before we open a particular collaboration or escalation with IcM, we must have evidence that the particular component or network resource has issues outside of AKS scope. This means isolating this component or network resource and identifying an incorrect behavior or issues.

Note: Refer [TSG]Component Level Troubleshooting for responsible team for AKS Networking component.

#### Azure network support teams

An AKS cluster will include and/or interface with multiple network components. When we run through the steps of the troubleshooting cycle, we have to get a general idea of all the network resources involved that might need specific troubleshooting or review from a particular Azure network support team like:

- Azure Application Gateway (Normal AppGw in front of AKS nodes or AGIC)
- Azure Bastion
- Azure DNS
- Azure ExpressRoute
- Azure Firewall
- Azure Front Door
- Azure Load Balancer
- Azure NVA
- Azure Peering Service
- Azure Private Link
- Azure Virtual Network
- Azure VPN

#### Full traffic flow

Make sure before going for a collaboration you have a clear picture of all infrastructure involved and the full traffic flow in question. Ask Cx for any network diagrams that may help understanding the particular scenario. Having a clear understanding on the different levels of networking involved (Azure Networking level and Kubernetes level) will help explaining the issue to Azure Networking team so they do not attempt troubleshooting or ask for info that doesn't apply to Kubernetes.

#### Network captures

There will be scenarios that required a network traffic capture to get a better understanding of the network issue. Before starting the capture its critical to consider:

1. What is the expected network path? Any and all network devices the traffic travels through is critical because they are another point of capture.
2. What are the source and destination IP addresses?
3. If either are a fully qualified domain name, resolve the FQDN based on the counterpart.
4. What is the source and destination port and protocol?
5. What is the precise problem description?

From AKS side we will be responsible to guide the Cx on how to collect the network captures from AKS side (nodes or pods), but the capture analysis can be done in a collaboration with the Network support team.

#### Collaboration scenarios

#### 1. Pod to external destination communication (Storage, Database, Cache etc.)

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Make sure there is no resource saturation for the node which hosts both client and server.
- Make sure both the client pod and Server are healthy.
- Make sure AKS Cluster is configured with the recommended and supported networking settings (e.g: required ports are open, no CIDR overlap, etc.)
- Assist in getting networking traces from pod.
- Determine routing via ASC Test Traffic.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Make sure there are no known issues with Azure Network configuration in customers environment.
- Collect and analyze networking traces from pod/VM to determine the bottleneck.
- Collect and analyze the Azure Networking components (Azure DNS, VNet, Load Balancer, etc.)
- Engage the CloudNet EEE/ CloudNet PG if needed.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

#### 2. Tunnel Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Make sure all the tunnel components/API server are healthy.
- Make sure there is no resource saturation for the node which is hosting tunnel component.
- Make sure NSG/Firewall allows egress communication (port TCP 9000 for tunnelfront, port UDP 1194 for OpenVPN/aks-link, port TCP 443 for Konnectivity).
- Verify whether node can communicate with API server in corresponding port via netcat/telnet commands and ASC Test Traffic.
- Assist in getting networking traces from test helper pod on same node hosting the tunnel component.
- Determine routing via ASC Test Traffic.

**Azure Networking POD Engineers Responsibilities:**
- Collect and analyze the Azure Networking components (Firewall, NAT Gateway, etc.)
- Collect and analyze networking traces from test helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`. VPN: `Azure\VPN Gateway\*`. ExpressRoute: `Azure\ExpressRoute\*`. Virtual WAN: `Azure\Virtual WAN\*`

#### 3. Node to API server Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Validate status of node pool and VMs.
- Review cluster CIDRs and VNet CIDRs don't have address conflicts.
- Identify nodes effective routing via ASC Test Traffic.
- Assist in getting networking traces from node via debug helper pod.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

#### 4. Pod to AKS Control Plane Communication

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Validate nodes outbound setup.
- Identify nodes effective routing via ASC Test Traffic.
- Assist in getting networking traces from pod.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

#### 5. Pod to Pod Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster networking plugin, UDR, network policies, etc.)
- Review cluster CIDRs and VNet CIDRs don't have address conflicts.
- Validate nodes subnet NSG and UDR.
- Identify nodes effective routing via ASC Test Traffic if using CNI.
- Validate configuration of network policies.
- Assist in getting networking traces from client and server pods.
- Test connectivity from helper pod in other nodes.
- Review kube-proxy pod logs.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from pods.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

#### 6. Failed to resolve DNS

**AKS POD Engineer Responsibilities:**
- Identify DNS server configuration at VNET.
- Review the CoreDNS Log to spot out any issue.
- Review the /etc/resolv.conf configuration of source pod.
- Review if there are CoreDNS customizations via coredns-custom configmap.
- Determine if issue is related to connectivity to DNS server (i/o timeout, connection timeout) or getting invalid response from server (address not found).
- If the issue is related to connectivity, determine full traffic flow (cluster outbound type, DNS on prem, Firewalls, UDR, VPN, etc.)
- Collect networking traces from node via debug helper pod.
- Test with nslookup/dig commands from helper pod pointing to CoreDNS pod IP and directly to DNS server IP.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- If the issue is related to connectivity, assist AKS POD engineer trace traffic along full flow (UDR, BGP, VPN).
- If using Azure Default DNS collect and analyze the Azure Networking logs.

> Azure Networking POD L2 SAP: `Azure\Azure DNS\*`

#### 7. Private link Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (Private Endpoint, target service, Private cluster API, etc.)
- Determine if connectivity was setup via explicit Private Endpoint or Subnet Service Endpoint.
- Validate Private link setup: VNET DNS and link to Private Zone record.
- If using custom DNS servers in VNET validate the Private Zone record is attached to their VNET and a forwarding rule for private FQDN has been setup to send request to Azure Internal DNS (168.63.129.16).
- Collect networking traces from node via debug helper pod.
- Test with nslookup/dig commands from helper pod to validate private link internal IP is returned.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Collect and analyze the Azure Networking components (Private link, backbone connectivity).

> Azure Networking POD L2 SAP: `Azure\Azure Private Link\*`

#### 8. Connection Latency

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Collect networking traces from pod.
- Discard SNAT port exhaustion if applicable (target is on public Internet).

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from pod.
- Collect and analyze the Azure Networking components (VNet, Load Balancer, etc.)

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

#### 9. Application Gateway Ingress Controller (AGIC)

**AKS POD Engineer Responsibilities:**
- Determine full setup config (AGIC helm installation or addon, Green or Brown field deployment, SP or User Assigned Identity, etc.)
- Determine full traffic flow from AG subnet (Firewalls, UDR, etc.)
- Validate AG backend has correct pod IPs.
- Determine if issue is related to connectivity to pods, writing configuration of AG (azure-ingress and aad-pod-identity pods logs) or errors in end pods.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze the Azure Networking components (VNet, AG).
- Validate AG probes status.

> Azure Networking POD L2 SAP: `Azure\Application Gateway\*`

#### 10. APIM/Traffic Manager to Pod Communication

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (Firewalls, UDR, etc.)
- Validate service and pod are working properly via connection test from helper pod.
- Track down APIM/Traffic Manager request in pod logs.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from APIM side.
- Collect and analyze the Azure Networking components (VNet, Load Balancer, etc.)

> Azure Networking POD L2 SAP: `Azure\Traffic Manager - DNS based load balancing\*`

#### EEE AKS / AKS PG

Network issues related to specific AKS internal network components might require collaboration with EEE AKS and/or AKS PG. For example, issues with components like:

- Kubenet
- Kube-proxy
- Coredns
- Network policies (Calico)
- Ip-masq-agent
- Tunnel (ssh tunnel, Openvpn or Konnectivity)

Note: Please refer [TSG]Component Level Troubleshooting before engaging EEE/PG, and make sure all the required logs are collected.

---

## Scenario 27: How to inject custom data on /etc/hosts file of the worker node
> 来源: ado-wiki-customizing-node-hosts-file.md | 适用: 适用范围未明确

### 排查步骤

#### How to inject custom data on /etc/hosts file of the worker node

Use a DaemonSet with nsenter to inject DNS entries into worker node /etc/hosts. Example: resolve a name via external DNS and inject the result.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    component: custom-dns
  name: custom-dns
  namespace: kube-system
spec:
  selector:
    matchLabels:
      component: custom-dns
      tier: node
  template:
    metadata:
      labels:
        component: custom-dns
        tier: node
    spec:
      containers:
      - name: custom-dns
        image: alpine
        imagePullPolicy: IfNotPresent
        command:
          - nsenter
          - --target
          - "1"
          - --mount
          - --uts
          - --ipc
          - --net
          - --pid
          - --
          - sh
          - -c
          - |
            echo "fs1234.example.pt $(dig A +short fs1234.example.pt @192.168.1.10 |tail -1)" >> /etc/hosts
            while true; do sleep 5; done
        securityContext:
          privileged: true
      dnsPolicy: ClusterFirst
      hostPID: true
```

---

## Scenario 28: Preserving node logs for RCA (Root Cause Analysis)
> 来源: ado-wiki-preserving-node-logs-rca.md | 适用: 适用范围未明确

### 排查步骤

#### Preserving node logs for RCA (Root Cause Analysis)

#### Summary

Guide for preserving AKS node logs for Root Cause Analysis. Covers:
1. Prevent a problematic node from being removed by Cluster Autoscaler
2. Collect logs from a preserved node
3. Create OS disk snapshots when a node cannot be kept running
4. Restore an OS disk snapshot to a new VM for investigation

#### Preventing node removal by Cluster Autoscaler

##### Adding the scale-down-disabled annotation

```bash
kubectl get nodes
kubectl annotate node <node-name> cluster-autoscaler.kubernetes.io/scale-down-disabled=true
```

##### Verifying the annotation

```bash
kubectl get node <node-name> -o jsonpath='{.metadata.annotations}' | grep scale-down-disabled
```

##### Removing the annotation when done

```bash
kubectl annotate node <node-name> cluster-autoscaler.kubernetes.io/scale-down-disabled-
```

Note the trailing dash (`-`) which indicates the annotation should be removed.

#### Collecting logs from a preserved node

##### For regular VMs (with persistent OS disks)
Use the "Inspect IaaS Disk" option in ASC.

##### For VMs with ephemeral disks
Use the "Guest Agent VM Logs" collection option in ASC.

#### Creating OS disk snapshots

##### When to create a snapshot
- Node is critically impaired and might shut down
- Need to preserve exact state for forensic analysis
- Node needs to return to service but logs still need analysis

##### Creating an OS disk snapshot
Follow: [How to take a snapshot of a VMSS instance](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-faq#how-do-i-take-a-snapshot-of-a-virtual-machine-scale-set-instance-)

1. Identify the VMSS instance ID and resource group
2. Create a snapshot of the OS disk
3. Store the snapshot securely

#### Restoring an OS disk snapshot to a new VM

1. Create a new managed disk from the snapshot
2. Create a new VM using the managed disk
3. Connect to the VM to analyze logs

References:
- [Create a managed disk from a snapshot](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/snapshot-copy-managed-disk)
- [Create a VM from a managed disk](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/create-vm-specialized-portal)

---

## Scenario 29: SSL Certificate Validation in AKS
> 来源: ado-wiki-ssl-certificate-validation-in-aks.md | 适用: 适用范围未明确

### 排查步骤

#### SSL Certificate Validation in AKS

#### Overview

- Determine the hostname or domain name of your application. This is the name that users will use to access your application which is integrated with ssl certificate.
- Run the debugger pod accessible to the target pod
  Example command:  `kubectl run -it --rm debug-pod --image=debian --restart=Never -- bash`
  - Check if url is accessible:
   Example Command: `curl https://www.example.com -v`
  - Check ssl certificate details:
   Example command: `openssl s_client -showcerts -servername <domain name>  -connect <domain name>:443 </dev/null`

#### Fetching the certificates from the cluster

- Fetching certificate from Kubernetes Secret: If the certificate is stored in a Kubernetes Secret, you can use the kubectl command to get the certificate

  `kubectl get secret <secret-name> -o jsonpath='{.data.<certificate-file-name>}' | base64 --decode > <certificate-file-name>.crt`

- Fetching certificate from Deployment: If the certificate is mounted in the Deployment as a ConfigMap or a Secret, you can use the kubectl command to get the certificate.

  `kubectl describe deployment <deployment-name>`

- Fetching certificate from Pod: If the certificate is mounted in a Pod as a ConfigMap or a Secret, you can use the kubectl command to get the certificate.

  `kubectl describe pod <pod-name>`

#### Certificate Validation Steps

- Check the validity period of the certificate:

  `openssl x509 -in <certificate-file-name>.crt -noout -dates`

- Verify the certificate issuer:

  `openssl x509 -in <certificate-file-name>.crt -noout -issuer`

- Verify the certificate chain:

  `openssl verify -CAfile <ca-certificate-file> <certificate-file-name>.crt`

---

## Scenario 30: AKS Cluster Startup Troubleshooting Guide
> 来源: mslearn-aks-cluster-startup-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Cluster Startup Troubleshooting Guide

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-aks-cluster-start-issues)

#### Diagnostic Flow

##### 1. Azure CLI Output
- `az aks start` error output contains error code and message
- Common: `VMExtensionProvisioningError` with exit status=50 (outbound connectivity)

##### 2. Azure Portal — Activity Log
- Filter by Operation name: "Start Managed Cluster"
- Expand failed entries → check suboperations
- JSON tab for detailed error info

##### 3. Cluster Insights
- Diagnose and solve problems → Cluster insights

##### 4. MC_ Resource Group
- Check VMSS provisioning status
- Failed → check Code column (e.g., `ProvisioningState/failed/VMExtensionProvisioningError`)

##### 5. kubectl Commands
```bash
az aks get-credentials --resource-group <RG> --name <cluster>
kubectl get nodes
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
```

#### Notes
- Startup flow is similar to creation but for stopped clusters
- Most common failure: outbound connectivity issues during node bootstrap
- Same VM extension error codes apply as cluster creation

---

## Scenario 31: Troubleshooting Flow
> 来源: mslearn-basic-troubleshooting-outbound-connections.md | 适用: 适用范围未明确

### 排查步骤

1. **Azure Virtual Network Verifier (Preview)** - check if Azure network resources block traffic
   - Navigate to cluster > Node pools > select nodepool > Connectivity analysis
   - Select VMSS instance as source, endpoint as destination (e.g. mcr.microsoft.com)
   - Covers: LB, Firewall, NAT Gateway, NSG, Network Policy, UDR

2. **DNS Resolution** - verify endpoint DNS works from pod
   ```bash
   kubectl run -it --rm aks-ssh --namespace <ns> --image=debian:stable
   apt-get update && apt-get install -y dnsutils curl
   nslookup microsoft.com
   nslookup microsoft.com 168.63.129.16  # direct Azure DNS
   ```

3. **IP Reachability** - test connectivity to resolved IP
   ```bash
   curl -Ivm5 telnet://microsoft.com:443
   curl -Ivm5 https://microsoft.com
   ```

4. **Cross-endpoint test** - verify cluster can reach any external endpoint
   ```bash
   curl -Ivm5 https://kubernetes.io
   ```

5. **Network Policy** check - verify no policy blocking egress

6. **NSG** check - verify no NSG blocking outbound on subnet/NIC

7. **Firewall/Proxy** check - verify required FQDNs/ports allowed

8. **AKS identity permissions** - verify service principal/managed identity has required AKS service permissions

---

## Scenario 32: AKS 节点访问方法汇总
> 来源: onenote-aks-node-access-methods.md | 适用: Mooncake ✅

### 排查步骤

#### AKS 节点访问方法汇总

排查 AKS 节点问题时，多种方式可用于登录或获取节点日志。

#### 方法一：kubectl node-shell（推荐，最简单）

适用于 VMSS 和 avset 类型 AKS 集群。

```bash
#### 1. 安装 kubectl node-shell
#### 参考：https://github.com/kvaps/kubectl-node-shell

#### 2. 获取凭据
az aks get-credentials --resource-group <rg> --name <cluster>

#### 3. 列出节点
kubectl get nodes

#### 4. 进入节点 shell
kubectl node-shell <node-name>
```

#### 方法二：SSH（按官方文档）

参考：https://docs.microsoft.com/en-us/azure/aks/ssh

#### 方法三：给节点添加 Public IP

临时添加 Public IP 到节点 NIC，直接 SSH。

#### 方法四：在同 Subnet 创建 Jumpbox VM

在 AKS 节点所在 subnet 创建 VM，重置密码后 SSH 到 jumpbox，再 SSH 到节点。

#### 方法五：磁盘快照 + 创建 VM（获取离线日志）

当节点已不可访问时，通过磁盘快照方式获取日志：

```powershell
#### Windows PowerShell（管理员模式）
Connect-AzAccount -EnvironmentName AzureChinaCloud
$subscriptionId = "<subscriptionId>"
Set-AzContext -Subscription $subscriptionId
$region = "chinaeast2"
$resourceGroupName = "MC_<rg>_<cluster>_<region>"

#### 获取 VMSS 实例磁盘 ID
$vmssinstance = Get-AzVmssVM -ResourceGroupName $resourceGroupName -VMScaleSetName "<vmss-name>" -InstanceId <id>
$manageDiskID = $vmssinstance.StorageProfile.OsDisk.ManagedDisk.Id

#### 创建快照
$snapshot = New-AzSnapshotConfig -SourceUri $manageDiskID -CreateOption Copy -Location $region
New-AzSnapshot -ResourceGroupName $resourceGroupName -Snapshot $snapshot -SnapshotName "<snapshot-name>"

#### 从快照创建托管磁盘
$Snapshot = Get-AzSnapshot -ResourceGroupName $resourceGroupName -SnapshotName "<snapshot-name>"
$NewOSDiskConfig = New-AzDiskConfig -AccountType Standard_LRS -Location $Snapshot.Location -SourceResourceId $Snapshot.Id -CreateOption Copy
New-AzDisk -Disk $NewOSDiskConfig -ResourceGroupName $resourceGroupName -DiskName "<disk-name>"
```

创建 VM 挂载该磁盘后，收集日志：

```bash
cd /tmp/ && mkdir logsCollection
journalctl -u kubelet > logsCollection/kubelet.log
cp -r /var/log/azure/ /var/log/auth.log* /var/log/messages* /var/log/syslog* /var/log/waagent.log* /tmp/logsCollection/
tar zcvf logsCollection.tgz logsCollection/*
```

---

## Scenario 33: AKS Node Log Collection
> 来源: onenote-aks-node-log-collection.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Node Log Collection

> Source: OneNote - Mooncake POD Support Notebook
> Related: aks-onenote-028 (node access methods)

#### Method 1: kubectl debug (Recommended)

##### Step 1 — SSH to node
```bash
kubectl get node                    # get node name
kubectl debug node/<node-id> -it --image=mcr.azk8s.cn/aks/fundamental/base-ubuntu:v0.0.11
chroot /host                        # IMPORTANT: must chroot to access real node filesystem
```

##### Step 2 — Collect logs
```bash
cd /tmp/
mkdir logsCollection
journalctl -u kubelet > logsCollection/kubelet.log
date > logsCollection/dateOutput.txt
last > logsCollection/lastOutput.txt
cd /var/log/
cp -r azure/ auth.log* messages* syslog* waagent.log* dmesg* /tmp/logsCollection/
ls /tmp/logsCollection/
cd /tmp/
tar zcvf logsCollection.tgz logsCollection/*
sudo chown azureuser:azureuser logsCollection.tgz
```

##### Step 3 — Copy logs out
```bash
kubectl cp <debugger-pod-name>:host/tmp/logsCollection.tgz ./logsCollection.tgz
```

#### Method 2: From local Azure CLI
```bash
kubectl get nodes > nodes_info.txt
kubectl describe node <node-name> > node_describe.txt
#### After SSH to node:
sudo journalctl -u kubelet -o cat
```

#### Method 3: Disk Snapshot (for deleted nodes)
PowerShell script to create VMSS instance disk snapshot, then create managed disk, then create VM from disk to access logs:

```powershell
Connect-AzAccount -EnvironmentName AzureChinaCloud
$subscriptionId = "<sub-id>"
Set-AzContext -Subscription $subscriptionId
$vmssinstance = Get-AzVmssVM -ResourceGroupName $rg -VMScaleSetName "<VMSS>" -InstanceId 2
$manageDiskID = $vmssinstance.StorageProfile.OsDisk.ManagedDisk.Id
$snapshot = New-AzSnapshotConfig -SourceUri $manageDiskID -CreateOption Copy -Location $region
New-AzSnapshot -ResourceGroupName $rg -Snapshot $snapshot -SnapshotName $snapshotName
#### Then create disk from snapshot and VM from disk
```

> Note: Snapshot method may no longer be available for all scenarios.

#### Reference
- Official SSH guide: https://docs.azure.cn/zh-cn/aks/ssh
- ADO Wiki: https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/560713/Collect-kubelet-logs-using-debugger-pod

---
