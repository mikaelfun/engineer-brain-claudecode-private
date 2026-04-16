# AKS Azure Policy — gatekeeper — 排查工作流

**来源草稿**: ado-wiki-a-Gathering-Azure-Policy-Logs.md, ado-wiki-a-container-taking-long-time-to-provision-failing.md, ado-wiki-azure-network-policy-manager-tsg.md, ado-wiki-how-to-collect-container-logs.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Summary
> 来源: ado-wiki-a-Gathering-Azure-Policy-Logs.md | 适用: 适用范围未明确

### 排查步骤


#### Summary

Certain policy troubleshooting scenarios require gathering logs and the constraint and Gatekeeper pod logs will be one of the only logging sources available.  This logged data will help determine if policies applied are functioning as expected.  Below are step by step instructions on how to guide the customer through collecting these logs.

#### Quick Start Commands

1. Constraint Template Logs

- ```kubect get <constrainttemplatename> <constraintname>```
- ```kubectl get constraint| grep "<contrainttemplatename>"```
- ```kubectl describe <constrainttemplatename> <contraintname>```

2. Audit and Policy Pod Logs

- ```kubectl get po -A```
- ```kubectl logs <containername> -n gatekeeper-system```
- ```kubectl logs <policycontainername> -n kube-system```
- If the Pod is restarting repeatedly with `CrashLoopBackOff` or `OOMKilled`, you need to get Pod Logs with `-p` (previous) option. It is important to analyze the RCA.
  - ```kubectl logs -p <containername> -n gatekeeper-system```
  - ```kubectl logs -p <policycontainername> -n kube-system```

#### Getting constraint info

Get impacted constraint to check violation audit status and violation actions using ```kubect get <constrainttemplatename> <constraintname>```

1. Get all constraint templates to find template name

```
kubectl get constrainttemplate
NAME                                     AGE
k8sazureallowedcapabilities              93m
k8sazureallowedusersgroups               93m
k8sazureblockautomounttoken              93m
k8sazureblockdefault                     93m
k8sazureblockhostnamespace               93m
k8sazurecontainerallowedimages           93m
k8sazurecontainerallowedports            93m
k8sazurecontainerlimits                  93m
k8sazurecontainernoprivilege             93m
k8sazurecontainernoprivilegeescalation   93m
k8sazuredisallowedcapabilities           93m
k8sazureenforceapparmor                  93m
k8sazurehostfilesystem                   93m
k8sazurehostnetworkingports              93m
k8sazureingresshttpsonly                 93m
k8sazurereadonlyrootfilesystem           93m
k8sazureserviceallowedports              93m
```

2. Get constraints to find constraint name ```kubectl get constraint| grep "<contrainttemplatename>"```

```
kubectl get constraint| grep "k8sazurecontainernoprivilege"
k8sazurecontainernoprivilege.constraints.gatekeeper.sh/azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7   131m
k8sazurecontainernoprivilege.constraints.gatekeeper.sh/azurepolicy-container-no-privilege-d660db5f04f04ea21764   86m
```

The constraint name will be at the end of the object name, i.e. "azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7".

3. Use ```kubectl describe <constrainttemplatename> <contraintname>``` to get the constraint information and audit and violation status

```
kubectl describe k8sazurecontainernoprivilege azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7
Name:         azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7
Namespace:
Labels:       managed-by=azure-policy-addon
Annotations:  azure-policy-assignment-id:
                /subscriptions/a9b775d3-9ed4-4354-aaaa-b1d09449ea13/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn
              azure-policy-definition-id: /providers/Microsoft.Authorization/policyDefinitions/95edb821-ddaf-4404-9732-666045e056b4
              azure-policy-definition-reference-id: privilegedContainersShouldBeAvoided
              azure-policy-setdefinition-id: /providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8
              constraint-installed-by: azure-policy-addon
              constraint-url: https://store.policy.core.windows.net/kubernetes/container-no-privilege/v1/constraint.yaml
API Version:  constraints.gatekeeper.sh/v1beta1
Kind:         K8sAzureContainerNoPrivilege
Metadata:
  Creation Timestamp:  2021-09-27T21:25:21Z
  Generation:          1
  Managed Fields:
    API Version:  constraints.gatekeeper.sh/v1beta1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:azure-policy-assignment-id:
          f:azure-policy-definition-id:
          f:azure-policy-definition-reference-id:
          f:azure-policy-setdefinition-id:
          f:constraint-installed-by:
          f:constraint-url:
        f:labels:
          .:
          f:managed-by:
      f:spec:
        .:
        f:enforcementAction:
        f:match:
          .:
          f:excludedNamespaces:
          f:kinds:
        f:parameters:
          .:
          f:excludedContainers:
    Manager:      azurepolicyaddon
    Operation:    Update
    Time:         2021-09-27T21:25:21Z
    API Version:  constraints.gatekeeper.sh/v1beta1
    Fields Type:  FieldsV1
    fieldsV1:
      f:status:
    Manager:         gatekeeper
    Operation:       Update
    Time:            2021-09-27T21:25:21Z
  Resource Version:  14073
  UID:               39467852-d30f-443c-88f5-a1cc07228354
Spec:
  Enforcement Action:  dryrun
  Match:
    Excluded Namespaces:
      kube-system
      gatekeeper-system
      azure-arc
    Kinds:
      API Groups:

      Kinds:
        Pod
  Parameters:
    Excluded Containers:
Status:
  Audit Timestamp:  2021-09-27T23:40:05Z
  By Pod:
    Constraint UID:       39467852-d30f-443c-88f5-a1cc07228354
    Enforced:             true
    Id:                   gatekeeper-audit-7c445465c6-g78lw
    Observed Generation:  1
    Operations:
      audit
      status
    Constraint UID:       39467852-d30f-443c-88f5-a1cc07228354
    Enforced:             true
    Id:                   gatekeeper-controller-5c45684cff-2dkqr
    Observed Generation:  1
    Operations:
      webhook
    Constraint UID:       39467852-d30f-443c-88f5-a1cc07228354
    Enforced:             true
    Id:                   gatekeeper-controller-5c45684cff-n5gf2
    Observed Generation:  1
    Operations:
      webhook
  Total Violations:  1
  Violations:
    Enforcement Action:  dryrun
    Kind:                Pod
    Message:             Privileged container is not allowed: nginx-privileged, securityContext: {"privileged": true}
    Name:                nginx-privileged
    Namespace:           default
Events:                  <none>
```

#### Getting audit and policy pod logs

The audit pod logs will contain the most relevent policy information concerning policy functionality.  The audit logs will provide details on the latest audits and policy execution.

1. Get a list of all pods to ensure all the gatekeeper pods are running.

```
kubectl get po -A
NAMESPACE           NAME                                     READY   STATUS    RESTARTS   AGE
default             nginx-privileged                         1/1     Running   0          89m
gatekeeper-system   gatekeeper-audit-7c445465c6-g78lw        1/1     Running   1          151m
gatekeeper-system   gatekeeper-controller-5c45684cff-2dkqr   1/1     Running   2          151m
gatekeeper-system   gatekeeper-controller-5c45684cff-n5gf2   1/1     Running   1          151m
kube-system         azure-ip-masq-agent-bxt6b                1/1     Running   0          150m
kube-system         azure-policy-859b85668d-rfqzf            1/1     Running   2          151m
kube-system         azure-policy-webhook-7bf799979b-jjdck    1/1     Running   0          134m
kube-system         coredns-autoscaler-54d55c8b75-g5brt      1/1     Running   0          151m
kube-system         coredns-d4866bcb7-npfm5                  1/1     Running   0          149m
kube-system         coredns-d4866bcb7-q85vc                  1/1     Running   0          134m
kube-system         konnectivity-agent-6bdb6cdb9b-rdgdp      1/1     Running   0          151m
kube-system         kube-proxy-bxj7j                         1/1     Running   0          150m
kube-system         metrics-server-569f6547dd-6sl78          1/1     Running   1          151m
```

Pods of note are the audit pod in the gatekeeper namespace and the policy pod in the system namespace.

2. Get the audit pod logs by running ```kubectl logs <containername> -n gatekeeper-system```.
In the example, grep is used to filter for the constraint name and the logs have been truncated to show entry output.

```
kubectl logs gatekeeper-audit-7c445465c6-g78lw -n gatekeeper-system |grep "azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7"
```

```{K8sAzureContainerNoPrivilege constraints.gatekeeper.sh/v1beta1 azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7}:{map[apiVersion:constraints.gatekeeper.sh/v1beta1 kind:K8sAzureContainerNoPrivilege metadata:map[annotations:map[azure-policy-assignment-id:/subscriptions/<subscriptionID>/providers/Microsoft.Authorization/policyAssignments/SecurityCenterBuiltIn azure-policy-definition-id:/providers/Microsoft.Authorization/policyDefinitions/95edb821-ddaf-4404-9732-666045e056b4 azure-policy-definition-reference-id:privilegedContainersShouldBeAvoided azure-policy-setdefinition-id:/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8 constraint-installed-by:azure-policy-addon constraint-url:https://store.policy.core.windows.net/kubernetes/container-no-privilege/v1/constraint.yaml] creationTimestamp:2021-09-27T21:25:21Z generation:1 labels:map[managed-by:azure-policy-addon] managedFields:[map[apiVersion:constraints.gatekeeper.sh/v1beta1 fieldsType:FieldsV1 fieldsV1:map[f:metadata:map[f:annotations:map[.:map[] f:azure-policy-assignment-id:map[] f:azure-policy-definition-id:map[] f:azure-policy-definition-reference-id:map[] f:azure-policy-setdefinition-id:map[] f:constraint-installed-by:map[] f:constraint-url:map[]] f:labels:map[.:map[] f:managed-by:map[]]] f:spec:map[.:map[] f:enforcementAction:map[] f:match:map[.:map[] f:excludedNamespaces:map[] f:kinds:map[]] f:parameters:map[.:map[] f:excludedContainers:map[]]]] manager:azurepolicyaddon operation:Update time:2021-09-27T21:25:21Z] map[apiVersion:constraints.gatekeeper.sh/v1beta1 fieldsType:FieldsV1 fieldsV1:map[f:status:map[]] manager:gatekeeper operation:Update time:2021-09-27T21:25:21Z]] name:azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7 resourceVersion:14073 uid:39467852-d30f-443c-88f5-a1cc07228354] spec:map[enforcementAction:dryrun match:map[excludedNamespaces:[kube-system gatekeeper-system azure-arc] kinds:[map[apiGroups:[] kinds:[Pod]]]] parameters:map[excludedContainers:[]]] status:map[auditTimestamp:2021-09-27T23:40:05Z byPod:[map[constraintUID:39467852-d30f-443c-88f5-a1cc07228354 enforced:true id:gatekeeper-audit-7c445465c6-g78lw observedGeneration:1 operations:[audit status]] map[constraintUID:39467852-d30f-443c-88f5-a1cc07228354 enforced:true id:gatekeeper-controller-5c45684cff-2dkqr observedGeneration:1 operations:[webhook]] map[constraintUID:39467852-d30f-443c-88f5-a1cc07228354 enforced:true id:gatekeeper-controller-5c45684cff-n5gf2 observedGeneration:1 operations:[webhook]]] totalViolations:1 violations:[map[enforcementAction:dryrun kind:Pod message:Privileged container is not allowed: nginx-privileged, securityContext: {\"privileged\": true} name:nginx-privileged namespace:default]]]]} {K8sAzureContainerNoPrivilege constraints.gatekeeper.sh/v1beta1 azurepolicy-container-no-privilege-d660db5f04f04ea21764}:{map[apiVersion:constraints.gatekeeper.sh/v1beta1 kind:K8sAzureContainerNoPrivilege metadata:map[annotations:map[azure-policy-assignment-id:/subscriptions/<subscriptionID>/resourceGroups/PolicyTest/providers/Microsoft.Authorization/policyAssignments/39061823ebc346aba0e47c27 azure-policy-definition-id:/providers/Microsoft.Authorization/policyDefinitions/95edb821-ddaf-4404-9732-666045e056b4 azure-policy-definition-reference-id: azure-policy-setdefinition-id: constraint-installed-by:azure-policy-addon constraint-url:https://store.policy.core.windows.net/kubernetes/container-no-privilege/v1/constraint.yaml]```

3. Get the policy logs to ensure policy is running with ```kubectl logs <policycontainername> -n kube-system```. Like the audit log example, use grep to filter for the constraint name.

```
kubectl logs azure-policy-859b85668d-rfqzf -n kube-system |grep "azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7"
{"level":"info","ts":"2021-09-28T00:09:40.030443107Z","msg":"Constraint successfully built","log-id":"75ff36b8-9-3284","method":"github.com/Azure/azure-policy-kubernetes/pkg/resourceutils/constraintutils.(*Utils).buildConstraint","azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7":"Placeholder: Log Missing Final Value"}
{"level":"info","ts":"2021-09-28T00:10:20.341771862Z","msg":"Constraint unchanged","log-id":"75ff36b8-9-3460","method":"github.com/Azure/azure-policy-kubernetes/pkg/gatekeeper/constraint.(*Client).Update","constraint-name":"azurepolicy-container-no-privilege-649944c5ebbcdb0aaed7"}
```

#### Analyze the logs

If you see an error like below:

```
policyinsightsdataplane.BaseClient#LogComponentEvents: Failure sending request: StatusCode=0 --
Original Error:
Post "https://data.policy.core.windows.net/policyEvents/logComponentEvents?api-version=2019-01-01-preview": dial tcp 20.80.15.50:443: i/o timeout
```

This could be an egress issue on the cx cluster reaching endpoint _data.policy.core.windows.net_ on port 443.

cf. [Outbound network and FQDN rules for Azure Kubernetes Service (AKS) clusters](https://learn.microsoft.com/azure/aks/outbound-rules-control-egress#azure-policy).

Ideally, we should ask customer to collect Network Traces while making a _"curl <https://data.policy.core.windows.net>'"_ and see where the connection is blocked.

Practically, you can check whether customer has NSGs that could block connectivity, or if they have a Network Virtual Appliance in the VNET, on the route to the endpoint above.

sample CRI = [348366302](https://portal.microsofticm.com/imp/v3/incidents/details/348366302/home)

#### Owner and Contributors

**Owner:** Yuki Kirii <Yuki.Kirii@microsoft.com>
**Contributors:**

- axelg <axelg@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ben Parker <bparke@microsoft.com>

---

## Scenario 2: Container taking long time to provision failing
> 来源: ado-wiki-a-container-taking-long-time-to-provision-failing.md | 适用: 适用范围未明确

### 排查步骤

#### Container taking long time to provision failing

Start with the AppName in Atlas Kusto Helper. Set the Time start to what you see in PreciseTimestamp and end time to 30 mins after the start.

If you see the appStatus as succeeded note that means the app succeeded deployment in your 30 minute window.

Put in the clusterId into the filter and set TraceTaskName to "Hosting" and go all the way down to the execution cluster traces.

#### Hosting

Here you will see the Hosting traces. Look for any errors during a activation (errors like servicePackageHealth with errors not always error level). Regular hosting activation looks like:

```txt
PodName=SF-SP-00eec4fe-082c-412e-8ff8-1147a48e1797-132624791068855413
OnRunPodSandbox: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
Container SF-SP-00eec4fe-082c-412e-8ff8-1147a48e1797-132624791068855413
ContainerName=sf-6381-aa3280c2-99fd-4da5-bf03-f2456a9e933d_00eec4fe-082c-412e-8ff8-1147a48e1797
OnContainerCreated: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
OnContainerStarted: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
```

Note that there is only 1 pod for each ContainerGroup but if there are multiple containers you would need to see the Container traces for all the containers.

If you aren't seeing these events for all containers check to see if there are any init containers (eg the azure file mount or secret volume mount) that are failing with non-zero exit codes (**EventName: ApplicationContainerInstanceExited**). There is a bug in containerd packages before 105, where the exit code was not being set correctly causing the activation to get stuck in a Never restartPolicy.

You can also check to make sure the create/start is not running into any issues.

If you see some of the events but then they stop, this is due to a known containerd issue that is caused by it not handling restarting and reattaching correctly.

##### ContainerD

If you see any containerD related errors you can use the containerid to start filtering the containerd logs and continuing the investigation there.

##### CM/PLB/CRM

If you are not seeing any Hosting traces at all that means the app is not getting to any node at all. Looks for CM trace task name to see if app creation succeeded. IF so start looking at PLB and CRM task names (the single instance name from CM traces (eg: **SingleInstance_10**) can be used in the **TraceMessageFilter** as sometimes the app name is not logged. See if there is unplaced replica happening, this will be due to fragmentation issues and incorrect cluster selection.

##### Gateway

If all of the above looks fine and the containers started and are running this is not an application issue. Start looking at the Gateway as we have seen issues there as well. Put in the Gateway actorkey (resourceId of it) in the AppName filter to look at the gateway traces on the RP. If you get to Deploying state but never to Running state this is likely due to a known issue that is fixed since our April release (the open method is crashing due to unhandled SF exceptions). Other gateway issues could be if it can't get a public ip or dns name, this will appear in the RP traces as an error.

#### Investigation Flow Summary

1. **Atlas Kusto Helper** → check appStatus for caas-xxx name
2. **Hosting traces** → look for OnRunPodSandbox / OnContainerCreated / OnContainerStarted for all containers
   - Missing events → check init container exit codes (ApplicationContainerInstanceExited)
   - Partial events → containerd restart/reattach bug
3. **ContainerD logs** → if ContainerD errors found, filter by containerId
4. **CM/PLB/CRM traces** → if no Hosting traces at all → check placement (unplaced replica, fragmentation)
5. **Gateway traces** → if containers running but never reach Running state → check Gateway actorkey on RP

#### Contributor

[Migrated from PG Onenote] by <kegonzal@microsoft.com>

#### Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-azure-network-policy-manager-tsg.md | 适用: 适用范围未明确

### 排查步骤

1. Use "curl" to check if pod -> service and pod -> pod connectivity are good

   ```bash
   kubectl exec <pod name> -- curl -v http://<myservice>/example
   ```

2. Collect iptables/ipsets via running below commands in kube-proxy pod
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables-save > iptables.log`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- ipset -L > ipset.log`

3. Review the iptables/ipsets to check if anything wrong. Reference: https://wiki.archlinux.org/title/Iptables

4. Review the NPM logs to check if NPM pod fails to sync network policies with the apiserver or fails to write iptables correctly

   ```bash
   kubectl logs <Azure NPM pod name> -n kube-system
   ```

5. Add traces to the iptable to understand where the packet jumps to when it goes through the iptables. The log will be redirected to '/var/log/kern.log'
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -I PREROUTING -t raw -p <udp/tcp> -j TRACE`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -I OUTPUT -t raw -p <udp/tcp> -j TRACE`

   Analysis references:
   - https://backreference.org/2010/06/11/iptables-debugging/
   - https://sleeplessbeastie.eu/2020/11/13/how-to-trace-packets-as-they-pass-through-the-firewall/

6. After troubleshooting, remove the trace rules to avoid noisy logs
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -D PREROUTING -t raw -p udp -j TRACE`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -D OUTPUT -t raw -p udp -j TRACE`

---

## Scenario 4: Collecting container logs in AKS
> 来源: ado-wiki-how-to-collect-container-logs.md | 适用: 适用范围未明确

### 排查步骤

#### Collecting container logs in AKS

#### Summary

Methods for collecting container and VM logs in AKS for troubleshooting: kubectl logs, Log Analytics Workspace KQL, ASC IaaS Disk inspection, Guest Agent VM Logs, and XTS Tool.

##### Prerequisites

* AKS cluster running a supported version
* (Optional) Insights enabled for Log Analytics Workspace
* kubectl access, or LAW access, or ASC access

#### Methods

##### 1. kubectl logs

```sh
kubectl logs <pod_name> -n <namespace_name>
```

##### 2. Log Analytics Workspace

If Insights is enabled, container logs go to the associated LAW. In ASC, find the LAW via "Omsagent Config Log Analytics Workspace Resource ID", then "Query Customer Data".

Example KQL:

```kql
let startTimestamp = ago(7d);
KubePodInventory
| where TimeGenerated > startTimestamp
| project ContainerID, PodName=Name, Namespace, ContainerName
| where PodName contains "Pod_Name" and Namespace contains "Namespace_Name" and ContainerName contains "Container_Name"
| distinct ContainerID, PodName, ContainerName
| join (ContainerLog | where TimeGenerated > startTimestamp) on ContainerID
| project TimeGenerated, PodName, ContainerName, LogEntry, LogEntrySource
| sort by TimeGenerated desc
```

More queries: https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-log-query

##### 3. ASC — Inspect IaaS Disk

For Managed Disks (non-ephemeral). Run "Inspect IaaS Disk" with AKS/Diagnostics mode on the VMSS instance. Pod logs at `device_0/var/log/pods/` (format: `<ns>_<pod>_<uid>`).

##### 4. ASC — Guest Agent VM Logs

For ephemeral OS disks. "Guest Agent VM Logs" > "Create Report". Pod logs at `var/log/pods/`.

##### 5. XTS Tool

Requires SAW + AME account. Can collect logs from recently deleted VMs. Get container ID and cluster ID from ASI, download XTS from https://aka.ms/xts, browse to GuestAgentLogs > VMLogs.

#### References

* https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-log-query
* https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/854946/XTS_Tool

---
