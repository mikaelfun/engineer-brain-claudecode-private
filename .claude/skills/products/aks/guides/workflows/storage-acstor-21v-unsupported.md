# AKS Azure Container Storage — 21v-unsupported — 排查工作流

**来源草稿**: ado-wiki-a-VM-Storage-Fileshare-Performance-Troubleshooting.md, ado-wiki-a-acstor-escalation-steps.md, ado-wiki-acstor-geneva-actions.md, ado-wiki-acstor-geneva-logs.md, ado-wiki-b-Trident-Storage-NetApp.md, ado-wiki-b-acstor-error-codes.md
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-VM-Storage-Fileshare-Performance-Troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

1. Identify the node where the PV is located
2. Go to ASC → select the VM (Node) → Disk blade → check if VM is being throttled
3. If fileshare PV: skip to step 4 directly
4. Enter the pod in bash mode and run fio benchmarks:

   **Measure MAX IOPS:**


   **Measure MAX Throughput:**


   Note: MAX IOPS and MAX Throughput are mutually exclusive — you cannot achieve both simultaneously.

5. If output deviates significantly from expected disk specs → open collaboration with VM team
6. If disk latency is observed (without visible throttling limits): may be burst throttling
   - Azure Premium disk IO checked every 50ms — expected latency: single digit ms
   - Azure Standard disk IO checked every 20ms

---

## Scenario 2: Escalation steps
> 来源: ado-wiki-a-acstor-escalation-steps.md | 适用: 适用范围未明确

### 排查步骤

#### Escalation steps

#### When to escalate?

If the issue is not documented with a mitigation or the mitigation steps do not resolve the issue, transfer the IcM to Xstore/Triage for futher investigtion.

#### How to escalate?

- Create/Transfer the IcM to `Xstore/Triage`.
- Set `The incident is related to` field in "Custom Fields for Service XStore" to `I know exactly which Xstore component team to transfer`.
- Set `Transfer Team` field in "Custom Fields for Service XStore" to `Container Storage`.

#### Owner and Contributors

**Owner:** huichancheng <huichancheng@microsoft.com>
**Contributors:**

---

## Scenario 3: Access Geneva Actions
> 来源: ado-wiki-acstor-geneva-actions.md | 适用: 适用范围未明确

### 排查步骤

#### Access Geneva Actions

1. Go to <https://portal.microsoftgeneva.com>
2. Select `Actions` from the left menu
3. Select the appropriate environment from the dropdown menu. **Note**: You would require a SAW to access the PublicBeta or any other production environments.
4. Filter by the keyword 'ACStor' and find `ACStor Operations` under the AzureContainerService AKS operations
5. Run the operations by entering the parameters as per requirement
6. For Prod environments, a JIT request would need to be raised to get the required claim to run the actions. You can do this by clicking on the `Get Access` button. For PPE environment, this step is not needed.
7. Once the JIT request has been approved, come back to the page, refresh the page and try again.

---

## Scenario 4: Access Geneva Logs for ACStor
> 来源: ado-wiki-acstor-geneva-logs.md | 适用: 适用范围未明确

### 排查步骤

#### Access Geneva Logs for ACStor

1. Go to <https://portal.microsoftgeneva.com>
2. Select Logs `DGrep` from the left menu
3. Set the following values:
    - Endpoint: `Diagnostic PROD`
    - Namespace: `ACStor`
    - Event: `ACStor`
4. Click search
5. Once logs are fetched, use the KQL to perform client-side query on the logs fetched.

Example: [query](https://portal.microsoftgeneva.com/s/AC5D951A) looks for <container-name> logs from <cluster-name> cluster. You also can add other fields for querying.

---

## Scenario 5: NetApp Trident
> 来源: ado-wiki-b-Trident-Storage-NetApp.md | 适用: 适用范围未明确

### 排查步骤

#### NetApp Trident


#### Summary

Trident is a fully supported open-source project maintained by NetApp. It has been designed from the ground up to help you meet your containerized applications persistence demands using industry-standard interfaces, such as the Container Storage Interface (CSI).

Trident deploys in Kubernetes clusters as pods and provides dynamic storage orchestration services for your Kubernetes workloads. It enables your containerized applications to quickly and easily consume persistent storage from NetApps broad portfolio that includes ONTAP (AFF/FAS/Select/Cloud/Amazon FSx for NetApp ONTAP),Element Software (NetApp HCI/SolidFire), as well as theAzure NetApp Filesservice,Cloud Volumes Service on Google Cloud, and theCloud Volumes Service on AWS.

Trident is also a foundational technology for NetAppsAstra, which addresses your data protection, disaster recovery, portability, and migration use cases for Kubernetes workloads leveraging NetApps industry-leading data management technology for snapshots, backups, replication, and cloning.

Take a look at the Astra documentation to get started today. SeeNetApps Support site for details on Tridents support policy under the Tridents Release and Support Lifecycletab.

#### Support Boundry

- Verify Cluster Health
- Gather failure/error info
- Get Pod/PV/PVC/SC info and/or logs (See TSG)
- Escalate

##### Escalation Paths

Collab can be sent to `Azure Bare Metal team` to run basic Net App health checks. Use the SAP path, ```Azure\Azure NetApp Files```, and choose the L2/L3 topic underneath that best fits the customer issue.

ICM to NetApp:
[AzureNetAppFiles:NFS Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=sA144x)

#### Verified Learning Resources

| Resource | Description |
| ---------- | ------------- |
| [Trident Home](https://netapp.io/persistent-storage-provisioner-for-kubernetes/) | Trident Home Page |
| [Trident Documentation](https://netapp-trident.readthedocs.io/en/stable-v21.07/index.html) | Full Trident Documentation |
| [Trident and Azure NetApp Files (ANF)](https://netapp-trident.readthedocs.io/en/stable-v21.07/kubernetes/operations/tasks/backends/anf.html) | Azure NetApp Files Documentation |
| [What is Trident](https://netapp-trident.readthedocs.io/en/stable-v21.07/introduction.html) | What is Trident? |
| [Troubleshooting](https://netapp-trident.readthedocs.io/en/stable-v21.07/kubernetes/troubleshooting.html) | Trident Troubleshooting Documentation |

#### Basic TSG

- Customer Problem
  - Provide detailed description of the bug (include when and how the bug occurred)
    - Explain expected behavior vs actual result observed
    - Did problem occur after new deployment or installation of Trident?  If install issue refer to Install/Deploy section
    - What was the exact command used which generated the error? (ie. install or upgrade trident, update a PV, etc..)?
    - When was the last time this command or process completed successfully?
- Provide steps to reproduce the issue
- Can the customer reproduce the issue [Yes/No/Don't Know/ NA]
  - If so how consistent / intermittent?
  - What happens when a retry of the job is attempted? Same or different result?
- Provide console errors, snippets or screenshots (if applicable)
- Any recent changes in the Trident and Kubernetes environment?
  - IP network: addresses, nds, ports, etcc
  - Credential, passwords, ect.
- Provide build & environment details below
  - Trident / Kubernetes
    - ```kubectl get nodes -o wide - (versions for k8s, orchestrators, linux OS, ip's, etc. on all nodes)```
    - ```kubectl get pods -o wide -n trident - (all trident pods and node where they reside)```
    - ```kubectl get all -n trident - (pods, servicedeployments, daemonset, replicaset)```
    - ```tridentctl -n trident version - (trident version currently running on the servers)```
    - ```tridentctl get backend -n trident - (health of trident backendS)```
  - Azure NetApp Files storage -
    - Volume Resource ID, Name, other relevant data?
    - ANF logs, Screenshots?
  - Create a trident support bundle and send it to the case
    - ```tridentctl logs -a -n trident <--- creates a zip file in the local directory```
- Install/Deploy
  - What install method is being used (orchestrator, tridentctl, helm)
  - Are all Trident pods Running? If not collect the pod describe for the unhealthy pod
    - ```kubectl describe pod trident-********-**** -n trident```
  - ```kubectl describe torc trident```
- Upgrade
  - What install method was used (orchestrator, tridentctl, helm)
    - Note: Upgrade must use same method as used for install
  - ```kubectl describe torc trident```
- PVC Create Error
  - PVC / PV:
    - ```kubectl get pvc <pvc-name> -n <namesspace>```
    - ```kubectl describe pvc <pvc-name> -n <namesspace>```
    - ```kubectl get pv <pv-name>```
    - ```kubectl describe pv <pv-name>```
  - What is the Storage Class?
    - ```kubectl get sc```
- PVC Mount/User Pod Creation Issue
  - ```kubectl get pod -n <name-space>```
  - ```kubectl describe pod <pod-name> -n <name-space>```
  - ```kubectl get pv <pv-name>```
  - Can you manually mount the pv from a worker node
    - ```mount -f nfs <ANF_IP/hostname>:/<trident_pvc_name> /data```
- Trident Pod Issue
  - Are all Trident pods Running?
  - if not collect the pod describe for the unhealthy pod
    - ```kubectl describe pod trident-********-**** -n trident```
  - ```kubectl describe torc trident```

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
- Chase Overmire <chover@microsoft.com>
- Ben Parker <bparke@microsoft.com>

---

## Scenario 6: ACStor Error Codes
> 来源: ado-wiki-b-acstor-error-codes.md | 适用: 适用范围未明确

### 排查步骤

#### ACStor Error Codes

#### InvalidArgumentValueError

- Invalid usage of --disable-azure-container-storage. Azure Container Storage is not enabled in the cluster.
- Azure Container Storage has version 1 installed. A pool type value must be specified when using --disable-azure-container-storage. Allowed values are: all, azureDisk, elasticSan, ephemeralDisk
- Failed to enable Azure Container Storage version 1 as Azure Container Storage version {v2_extension_version} is already installed on the cluster. Try enabling this version on another cluster. You can also enable this version by first disabling the existing installation of Azure Container Storage by running --disable-azure-container-storage. Note that disabling can impact existing workloads that depend on Azure Container Storage.
- Storage pool type value must be specified for --enable-azure-container-storage when enabling Azure Container Storage v1. Supported values are azureDisk, elasticSan, ephemeralDisk.
- Invalid --storage-pool-name value. Accepted values are lowercase alphanumeric characters, - or ., and must start and end with an alphanumeric character.
- Azure Container Storage is already configured with --ephemeral-disk-volume-type value set to {EphemeralVolumeOnly }.
- Azure Container Storage is already configured with --ephemeral-disk-nvme-perf-tier value set to (Basic/Standard/Premium)
- Azure Container Storage is already configured with --ephemeral-disk-volume-type value set to { EphemeralVolumeOnly } and --ephemeral-disk-nvme-perf-tier value set to to (Basic/Standard/Premium)
- Cannot set --storage-pool-option value as all when --enable-azure-container-storage is set.
- Failed to enable the latest version of Azure Container Storage as version {v1_extension_version} is already installed on the cluster. Try enabling Azure Container Storage in another cluster. You can also enable the latest version by first disabling the existing installation using --disable-azure-container-storage all. Note that disabling can impact existing workloads that depend on Azure Container Storage.
- Cannot enable Azure Container Storage as it is already enabled on the cluster.
- The latest version of Azure Container Storage only supports ephemeral nvme storage and does not require or support a storage-pool-type value for --enable-azure-container-storage parameter. Please remove {storage_pool_type} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-name value. Please remove --storage-pool-name {storage_pool_name} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-sku value. Please remove --storage-pool-sku {storage_pool_sku} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-option value. Please remove --storage-pool-option {storage_pool_option} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-size value. Please remove --storage-pool-size {storage_pool_size} from the command and try again.
- Cannot disable Azure Container Storage as it is not enabled on the cluster.
- Azure Container Storage can be enabled only on {CONST_DEFAULT_NODE_OS_TYPE} nodepools. Node pool: {pool_name}, os type: {os_type} does not meet the criteria.
- Unable to install Azure Container Storage on system nodepool: {pool_name} since it has a taint CriticalAddonsOnly=true:NoSchedule. Remove the taint from the node pool and retry the Azure Container Storage operation.
- Node pool: {pool_name} not found. Please provide a comma separated string of existing node pool names in --azure-container-storage-nodepools.
  - Node pools available in the cluster: {agentpool_names_str}.
  - Aborting installation of Azure Container Storage.

#### MutuallyExclusiveArgumentError

- Conflicting flags. Cannot define --storage-pool-name value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --storage-pool-sku value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --storage-pool-size value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --ephemeral-disk-volume-type value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --ephemeral-disk-nvme-perf-tier value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --azure-container-storage-nodepools value when --disable-azure-container-storage is set.

#### RequiredArgumentMissingError

- Value of --storage-pool-option must be defined since ephemeralDisk of both the types: NVMe and Temp are enabled in the cluster.
- Value of --storage-pool-option must be defined when --enable-azure-container-storage is set to ephemeralDisk.
- Multiple node pools present. Please define the node pools on which you want to enable Azure Container Storage using --azure-container-storage-nodepools.
Node pools available in the cluster are: {agentpool_names_str}.
Aborting Azure Container Storage operation.

#### ArgumentUsageError

- Cannot define --storage-pool-option value when --disable-azure-container-storage is not set to ephemeralDisk.
- Invalid --storage-pool-option value since ephemeralDisk of type {storage_pool_option} is not enabled in the cluster.
- Invalid --disable-azure-container-storage value. Azure Container Storage is not enabled for storage pool type {storage_pool_type} in the cluster.
- Since {storage_pool_type} is the only storage pool type enabled for Azure Container Storage, disabling the storage pool type will lead to disabling Azure Container Storage from the cluster. To disable Azure Container Storage, set --disable-azure-container-storage to all.
- Cannot set --storage-pool-sku when --enable-azure-container-storage is ephemeralDisk.
- Invalid --storage-pool-sku value. Supported value for --storage-pool-sku are Premium_LRS, Premium_ZRS when --enable-azure-container-storage is set to elasticSan.
- Cannot set --ephemeral-disk-nvme-perf-tier along with --enable-azure-container-storage when storage pool type: ephemeralDisk option: NVMe is not enabled for Azure Container Storage. Enable the option using --storage-pool-option.
- Cannot set --storage-pool-option when --enable-azure-container-storage is not ephemeralDisk.
- Cannot set --ephemeral-disk-volume-type when --enable-azure-container-storage is not ephemeralDisk.
- Cannot set --ephemeral-disk-nvme-perf-tier when --enable-azure-container-storage is not ephemeralDisk.
- Invalid --enable-azure-container-storage value. Azure Container Storage is already enabled for storage pool type {storage_pool_type} in the cluster.
- Invalid --enable-azure-container-storage value. Azure Container Storage is already enabled for storage pool type ephemeralDisk and option {ephemeral_disk_type_installed} in the cluster.
- Value for --storage-pool-size should be defined with size followed by Gi or Ti e.g. 512Gi or 2Ti.
- Value for --storage-pool-size must be at least 1Ti when --enable-azure-container-storage is elasticSan.
- Cannot set --azure-container-storage-nodepools while using --enable-azure-container-storage to enable a type of storage pool in a cluster where Azure Container Storage is already installed. Use az aks nodepool to label the node pool instead.
- Cannot enable Azure Container Storage storage pool of type {storage_pool_type} since none of the nodepools in the cluster are labelled for Azure Container Storage.
- Invalid --azure-container-storage-nodepools value. Accepted value is a comma separated string of valid node pool names without any spaces. A valid node pool name may only contain lowercase alphanumeric characters and must begin with a lowercase letter.
- Cannot set --storage-pool-option as NVMe as none of the node pools can support ephemeral NVMe disk.
- Cannot set --storage-pool-sku as PremiumV2_LRS as none of the node pools are zoned. Please add a zoned node pool and try again.

#### UnknownError

- Unable to find details for virtual machine size {vm_size}.
- Unable to determine number of cores in node pool: {pool_name}, node size: {vm_size}
- Insufficient nodes present. Azure Container Storage requires atleast 3 nodes to be enabled.
- Validation failed. Unable to perform Azure Container Storage operation. Resetting cluster state.
- Validation failed. Please ensure that storagepools are not being used. Unable to perform disable Azure Container Storage operation. Resetting cluster state.
- Validation failed. Please ensure that storagepools of type {storage_pool_type} are not being used. Unable to perform disable Azure Container Storage operation. Resetting cluster state.
- Failure observed while disabling Azure Container Storage.

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>

---
