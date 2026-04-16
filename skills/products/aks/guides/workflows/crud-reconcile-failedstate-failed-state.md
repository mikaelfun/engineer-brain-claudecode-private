# AKS CRUD 操作与 Failed State 恢复 — failed-state — 排查工作流

**来源草稿**: ado-wiki-a-reconcile-managed-cluster-failed-state.md, ado-wiki-a-serial-access-console-when-jarvis-failing.md, ado-wiki-a-test-traffic-jarvis-vfp.md, ado-wiki-acr-jarvis-actions.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Reconcile Managed Cluster in Failed State
> 来源: ado-wiki-a-reconcile-managed-cluster-failed-state.md | 适用: 适用范围未明确

### 排查步骤

#### Reconcile Managed Cluster in Failed State

#### Overview

This guide can be used to clear the state of a cluster. This avoids the need to send an "empty PUT" via <https://resources.azure.com>, which reduces the perceived effort during a support request. Before using this guide to clear the failed state of a cluster, you must first address why the cluster is in a failed state. Once the root cause of the failure has been fixed, the steps here can be used to clear the failed state.

#### Usage

**Caution**: Do not use this on a cluster that is not in a failed state.

1. Go to <https://jarvis-west.dc.ad.msft.net/#/actions>, choose `Public` environment.
2. Choose `AzureContianerService AKS` blade, under `Resource Operations`, click `Get Managed Cluster`. Provide the required parameters and use `unVersioned` ApiVersion. Click `Run` to get the existing cluster info, scroll down to the bottom and note down the `createApiVersion`.
3. Under the same operation group, click `Reconcile Managed Cluster`, click `Get Access` to request JIT. Fill work item ID (or put 0 if you don't have one).
4. After getting JIT access, provide endpoint (region), Subscription, resource group name and resource name, and **choose the same ApiVersion as noted in step 2**.
5. Click `Run`.

#### References

- [PG Documentation on process](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki?wikiVersion=GBwikiMaster&pagePath=%2FAKS%2FOverlay%2FRunbooks%2FOncall%2FGeneva%20Actions&pageId=9007&anchor=how-to-reconcile-a-managed-cluster)

---

## Scenario 2: Pulling logs from Serial Access Console when Jarvis is not working
> 来源: ado-wiki-a-serial-access-console-when-jarvis-failing.md | 适用: 适用范围未明确

### 排查步骤

#### Pulling logs from Serial Access Console when Jarvis is not working

#### Overview

How to pull logs via Serial Access Console (SAC) when Jarvis is not working.

#### Usage

1. Enable boot diagnostics from the portal on the VM/node under `Support + Troubleshooting` section of blade
2. Restart the VM.
3. Create a user using the reset password option from the portal under `Support + Troubleshooting` section of blade.
4. Login to the Serial console using the password created in previous step.
5. Run the commands that you are interested in gathering.
6. Gather the files onto clipboard.

**Examples:**

Gathering kubelet logs using journalctl:

```bash
sudo journalctl -u kubelet --since=YYYY-MM-DD HH:MM:SS --no-pager
sudo journalctl -u kubelet --until=YYYY-MM-DD HH:MM:SS --no-pager
sudo journalctl -u kubelet -S "2019-03-13 16:00:00" -U "2019-03-13 20:30:00" --no-pager
```

Other useful logs:

```bash
cat /var/log/azure-npm.log
cat /var/log/azure-cnimonitor.log
cat /var/log/azure-vnet.log
cat /var/log/cloud-init.log
cat /var/log/azure/cluster-provision.log
```

#### Reference

- Kubernetes Debugging reference: <https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/>
- Serial Access Console guide: <https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/serial-console-linux>

---

## Scenario 3: Running Test Traffic and other Network Diagnostics from Jarvis
> 来源: ado-wiki-a-test-traffic-jarvis-vfp.md | 适用: 适用范围未明确

### 排查步骤

#### Running Test Traffic and other Network Diagnostics from Jarvis

#### Overview

For checking connectivity from an AKS node to a given IP address, the usual procedure is to use the Test Traffic tool under the Diagnostics section for a given VM. This tool does not always work, and also it does not send any packet - it just inspects the NSG and Routes.

A better option, although more labour intensive, is to use Jarvis.

#### Procedure

To use Jarvis we first need to collect some fabric related info about the node we want to test:

- Tenant/Fabric Host
- Node ID
- Container ID

Run the following Kusto query:

```txt
let startTime=datetime(2021-04-09T13:00:00Z);
let endTime=datetime(2021-04-09T23:59:00Z);
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where PreciseTimeStamp between (startTime..endTime)
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{AKS NODE VMSS INSTANCE NAME}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

After getting this info, open Jarvis-Actions on your SAVM and select **SupportabilityFabric > Fabric Operations > Get VFP Filters (ACL and VNET) programmed on containers**

Short Link: <https://jarvis-west.dc.ad.msft.net/CB93FE86>

After filling the Fabric related fields, scroll down and fill:

- VFPFilter Commands: **process-tuples**
- VPPFilter Options: **<Protocol-6 TCP/17 UDP> <Source IP> <Source Port> <Destination IP> <Destination Port> <direction> <1/0 TCP SYN>**

Example: test TCP connection from node DIP to API Server IP on port 443 sending a TCP SYN.

After pressing RUN, copy the RAW output to Notepad++ and use the **Fix_JARVIS_RAW** macro to make it human-readable.

The final output shows the flow action with Source IP/Port (Outbound IP/SNAT Port of cluster LB) and Destination IP/Port.

---

## Scenario 4: Jarvis Actions for ACR
> 来源: ado-wiki-acr-jarvis-actions.md | 适用: 适用范围未明确

### 排查步骤

#### Jarvis Actions for ACR

Recently we have been provided with the ability to view ACR Private endpoints and the "Master Entity" for ACR using Jarvis, this allows us to see the details of the private endpoints that a customer has configured on their ACR and also any Firewall rules they have created on their ACR.

**JIT access to these actions are provided through the security group "TM-Krater-CSS-JITAccess" (https://oneidentity.core.windows.net/), if you are not a member of this group you can check with your TA.**

#### ACR Private endpoints

To view the Private endpoints created on an ACR:
1. Get a SAVM up and running
2. Navigate to the main Jarvis/Geneva Actions website (aka.ms/jarvis)
3. Click on actions, authenticate with AME credentials/yubikey
4. Use the "Filter" to find the registry actions, or use short link: https://portal.microsoftgeneva.com/98B4AA38
5. Expand "Azure Container Registry" > "User Registry Management" > "Get Registry Private endpoints"
6. Fill in the Login Server of the ACR and click "Get Access" to initiate JIT

**JIT Configuration for ACR:**
- Scope: ACRSupport
- Access Level: PlatformServiceOperator
- Work-item id: any ICM or JIT ICM

**Key output**: Look for the "NRP PE ID" property — provides the resourceID of the private endpoint to find which VNET it is connected to.

##### Private Endpoint Use Example

If a customer cannot connect to or pull images from ACR with errors like:
- `Could not connect to the registry login server 'registry.azurecr.io'`
- `dial tcp 12.0.0.5:443: i/o timeout`

This could happen if ACR has private endpoints enabled, client is not on a VNET where the private endpoint is connected, and public access is disabled.

#### ACR Firewall rules

Use "Get Registry Master Entity" action in Jarvis to see IP Rules when "Selected Networks" is enabled on ACR.

##### Firewall Use Example

If a customer gets errors like:
- `denied: client with IP 'x.x.x.x' is not allowed access`
- `403 Forbidden` when pulling images

This could happen if ACR has Selected Networks/Firewall enabled and the client public IP is not allowlisted. Check "IP rules" in the output.

#### Recalculate registry size and update registry size entry

The 'RegistrySize' table is updated by the indexing service. If the registry experiences an issue where RegistrySize entry could not be updated, use this action to verify/update correct storage usage.

Location: Azure Container Registry > User Registry Management > Recalculate registry size and update registry size entry

**Parameters:**
- Registry Login Server URI: the login server URL
- Region: for geo-replicated registries, operation runs for specified region only
- Confirm: if false, only shows recalculated size without updating

**Limitation:** Currently only recalculates storage for acr.docker (docker container images, Helm V3 charts). acr.artifact (Helm V2 chart files) not yet supported.

**Note:** Due to possible data race, operation may fail with `Encountered conflict when updating RegistrySize table. Please retry the operation.` — safe to retry.

#### Owner and Contributors

**Owner:** Hanno Terblanche <hanter@microsoft.com>

---
