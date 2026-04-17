# AKS CRUD 操作与 Failed State 恢复 — reconcile — 排查工作流

**来源草稿**: ado-wiki-c-Update-or-Disable-SSH-Key.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Updating or Disabling SSH Keys
> 来源: ado-wiki-c-Update-or-Disable-SSH-Key.md | 适用: 适用范围未明确

### 排查步骤

#### Updating or Disabling SSH Keys


#### Overview

The first phase of this feature allows the customer to replace the SSH key on all nodes. This would involve all nodes in the VMSS being replaced, and the image version upgraded.

The next phase is being released soon, which allows the customer to disable SSH on the nodes.

#### Update SSH

#### Issue classification

##### Property `sshPublicKeyVersion` in managed cluster properties

The SSH key related properties are defined as follows in `.containerService.properties.linuxProfile` of `Microsoft.ContainerService/managedClusters`:

```json
"linuxProfile": {
  "adminUsername": "azureuser",
  "ssh": {
    "publicKeys": [
      {
        "keyData": "<YOUR_SSH_PUBLIC_KEY>"
      }
    ]
  },
  "sshPublicKeyVersion": "<SOME_VERSION>"
},
```

If the property `sshPublicKeyVersion` is empty, it means the SSH public key is never updated. If the property `sshPublicKeyVersion` is not empty, it means the SSH public key was updated at least once. But it doesn't mean the last update is successful. The value is like `448248fd06191a5b027ab2422586f81a8105d5a2f7e061272c6f52a0720687`.

##### Tag `aks-managed-sshPublicKeyVersion` in VMSS

1. Get the node resource group name: `az aks show -g <YOUR_RESOURCE_GROUP_NAME> -n <YOUR_CLUSTER_NAME> --query 'nodeResourceGroup'`
2. Get tags of VMSS: `az vmss show -g <YOUR_NODE_RESOURCE_GROUP_NAME> -n <YOUR_VMSS_NAME> --query 'tags'`
3. The value of tag `aks-managed-sshPublicKeyVersion` should be same to `sshPublicKeyVersion` in managed cluster properties.

##### Label `kubernetes.azure.com/ssh-public-key-version` in AKS nodes

1. Get label of AKS node: `kubectl get nodes <YOUR_NODE_NAME> -o yaml`
2. The value of label `kubernetes.azure.com/ssh-public-key-version` should be same to `sshPublicKeyVersion` in managed cluster properties.

#### Where to find logs

Updating SSH public key leverages the upgrade VMSS code path. You can find the logs in the `AsyncContextActivity` table.

#### Common Issues

* If you can still use your old SSH key to access the node
  1. Check SSH public key version in managed cluster properties, VMSS tags and node labels. They should be same.
  2. If not same, check the error in the upgrade VMSS path.
  3. If same, try to re-image the VMSS VM. After re-imaged, try to access the VM again.

#### Disable SSH

#### ICM queue routing

The RCA queue for this feature is `Azure Kubernetes Service/Security`.

#### Validations or Limitations

* The minimal supported API version is v20230602preview
* Not supported to disable SSH for VMAS nodepool.

#### Background

Some background of this feature:

1. Togging between SSH on/off is implemented in AgentBaker's provision script.
2. Because of 1, updating SSH status need reimage the node to take effect, expeted updating workflow:
   1. Customer send a request to toggle SSH status on a node pool.
   2. AKS RP receives the request, update VMSS's model, but won't reimage the node.
   3. After the operation succeeded, customer need to send another request to reimage the node, for example `az aks nodepool upgrade --node-image-only`
   4. AKS RP reimage the node. Only after this step, toggling SSH status can take effect.

#### Code path and log collection

1. Frontend
   <br>In frontend, you can check user's SSH input by viewing sanitized request body; also, you can check `AgentPoolSnapshot` and `ManagedClusterMonitoring` table. The property name is `agentPool.Properties.SecurityProfile.SSHAccess`
:

```
FrontEndContextActivity
| where operationID == '181ef3f7-053f-4295-8dca-66a1dc4f13bd'
| where msg contains 'sanitized'
```

You 'll find something like:

```json
"sanitized request body":{
   "location":"eastus",
   "properties":{
      "kubernetesVersion":"1.27.3",
      "dnsPrefix":"tosi-tosidemo-8ecadf",
      "agentPoolProfiles":[
         {
            "securityProfile":{
               "sshAccess":"localuser" / "disabled"
            }
         }
      ],
```

2. Async
   <br> In async processor, based on customer's input, corresponding provision script will be executed to configure SSH status, those script's log can be found at node's `/var/log/azure/cluster-provision.log`, for example, for an SSH-disabled node, you'll find log like:

```+ systemctlDisableAndStop ssh
+ systemctl_stop 20 5 25 ssh
+ timeout 25 systemctl stop ssh
+ systemctl_disable 20 5 25 ssh
+ timeout 25 systemctl disable ssh
```

#### Inspecting current SSH status

##### Using node-shell

If you're able to node-shell, node-shell onto one node, and inspect SSH status using `systemctl`:

```
kubectl node-shell aks-nodepool1-20785627-vmss000001
systemctl status ssh
```

For an SSH-disabled node, you're expected to find something like:

```
 ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; disabled; vendor preset: enabled)
     Active: inactive (dead) since Wed 2024-01-03 15:36:57 UTC; 20min ago
```

For an SSH-enabled node, you're expected to find something like:

```
 ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2024-01-03 15:40:20 UTC; 19min ago
```

##### Using run-command

Sometimes, node-shell is not available, in this case, you can using VMSS run-command to check SSH status:

```
az vmss run-command invoke --resource-group <RESOURCE_GROUP_NAME> --name <VMSS_NAME> --command-id RunShellScript --instance-id 0 --scripts "systemctl status ssh"
```

You'll get output like:

```json
{
  "value": [
    {
      "code": "ProvisioningState/succeeded",
      "displayStatus": "Provisioning succeeded",
      "level": "Info",
      "message": "Enable succeeded: \n[stdout]\n ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; disabled; vendor preset: enabled)\n     Active: inactive (dead) since Wed 2024-01-03 15:36:53 UTC; 25min ago\n       Docs: man:sshd(8)\n             man:sshd_config(5)\n   Main PID: 827 (code=exited, status=0/SUCCESS)\n        CPU: 22ms\n\nJan 03 15:36:44 aks-nodepool1-20785627-vmss000000 systemd[1]: Starting OpenBSD Secure Shell server...\nJan 03 15:36:44 aks-nodepool1-20785627-vmss000000 sshd[827]: Server listening on 0.0.0.0 port 22.\nJan 03 15:36:44 aks-nodepool1-20785627-vmss000000 sshd[827]: Server listening on :: port 22.\nJan 03 15:36:44 aks-nodepool1-20785627-vmss000000 systemd[1]: Started OpenBSD Secure Shell server.\nJan 03 15:36:53 aks-nodepool1-20785627-vmss000000 systemd[1]: Stopping OpenBSD Secure Shell server...\nJan 03 15:36:53 aks-nodepool1-20785627-vmss000000 sshd[827]: Received signal 15; terminating.\nJan 03 15:36:53 aks-nodepool1-20785627-vmss000000 systemd[1]: ssh.service: Deactivated successfully.\nJan 03 15:36:53 aks-nodepool1-20785627-vmss000000 systemd[1]: Stopped OpenBSD Secure Shell server.\n\n[stderr]\n",
      "time": null
    }
  ]
}
```

Search for `Active`, you'll get `Active: inactive (dead)`, which indicates SSH is disabled on the node.

#### Known Issues

None.

#### References

* <https://learn.microsoft.com/en-us/azure/aks/node-access>

#### Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

---
