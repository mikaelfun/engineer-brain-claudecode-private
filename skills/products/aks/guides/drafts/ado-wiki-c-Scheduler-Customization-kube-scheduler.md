---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Scheduler Customization - kube-scheduler"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Scheduler%20Customization%20-%20kube-scheduler"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Scheduler Customization - kube-scheduler

[[_TOC_]]

## Overview

## Dashboards

- kube-scheduler - <https://asi.azure.ms/services/AKS/pages/kube-scheduler>
- SchedulerCtrl - <https://asi.azure.ms/services/AKS/pages/schedulerctrl>

## How To

### Check if kube-scheduler is being managed by SchedulerCtrl

In the kube-scheduler dashboard, check the _Scheduler Profile Config Mode_ value in the _Metadata_ section. It should be set to `ManagedByCRD` if kube-scheduler is being managed by SchedulerCtrl and to `Default` otherwise.

### Get the SchedulerConfiguration currently in use

Open the SchedulerCtrl dashboard and make sure the time range is long enough to include the last time the SchedulerConfiguration was modified by the user. Then, looking at the _Events_ table in the _Overview_ section, check the generation for the last _Reconciled_ event. Use that generation to filter the _Assessments_ table below and look at the most recent assessment for that generation. The _userConfig_ column will show the scheduler configuration defined by the user, while the _renderedConfig_ column will display the configuration that was effectively applied by us to the scheduler.

## Troubleshooting Common Errors

### Pod in CrashLoopBackOff state

A lot of different issues may cause the kube-scheduler Pod to enter a crash loop. Use the kube-scheduler Dashboard to examine the logs of crashed containers and identify the specific error message described below.

### `broadcaster already stopped`

This is a benign error that is raised whenever kube-scheduler is shutting down. You can safely ignore this error.

If you are investigating the cause of a container crash, there should be other errors before this one. If there are no other errors, the kube-scheduler Pod was probably terminated by Kubernetes and the reason for the termination can be found in the Container Snapshot in the kube-scheduler Dashboard.

### `certificate has expired or is not yet valid`

This is a Control Plane issue. Follow the _Control Plane Certificate Expired_ TSG.

### `connection refused`, `context canceled`, `context deadline exceeded`, or `i/o timeout`

This is a common error that is raised when kube-scheduler is unable to talk with the API Server.

If you find this error after a Create or Update operation, it's likely a transient error that will go away when the cluster finishes reconciling.

We have also seen this error when we have network problems in the Underlay. Check the status of Underlay Nodes that contain API Server and kube-scheduler Pods. Also verify the cluster's overall health, as other components are likely affected.

Another possibility is that the API Server is overwhelmed. Check related Dashboards and TSGs.

### `Leaderelection lost`

This is a benign error, another kube-scheduler replica should've become the active replica.

### `namespaces ... not found` or `unable to create new content in namespace ... because it is being terminated`

This error indicates that kube-scheduler has tried to schedule a Pod in a Namespace that has been deleted by the customer. No action needs to be taken.

### `no nodes available to schedule pods`

The cluster has no schedulable Nodes. Check the Managed Cluster dashboard, it's likely that the cluster is in a bad state. Note that this may be caused by customer actions such as applying taints or cordoning nodes.

### `pods ... not found`

This error indicates that kube-scheduler has tried to schedule a Pod that the user has deleted. No action needs to be taken.

### `unexpected field ..., remove it or turn on the feature gate ...`

This error occurs when kube-scheduler is given some configuration containing some feature not enabled for that particular version of the scheduler.

This is only expected on clusters with _User-Provided Scheduler Configuration_ enabled and when a customer enters some bad configuration for kube-scheduler. Check the _Scheduler Profile Config Mode_ for kube-scheduler in its dashboard, it should be `ManagedByCRD` when that feature is enabled. If that's the case, SchedulerCtrl should rollback the bad configuration and no manual intervention is required. Note that the customer may be trying different configurations and this is causing this error to reappear, take a look at the SchedulerCtrl dashboard and TSG for more details.

If you are seeing this but the _Scheduler Profile Config Mode_ for kube-scheduler is `Default`, there's something wrong with the base configuration of kube-scheduler. We had an outage related to this before, where the kube-scheduler configuration was changed in a way making it incompatible with older clusters. Note that if this is the case, multiple clusters will be impacted by the problem. Take a look if there was some recent change to the configuration in <https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/control-plane-core/charts/kube-control-plane/charts/kube-scheduler> or <https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/control-plane-core/helmvalues/helmvalues_scheduler.go> and immediately escalate via ICM if you have identified that this is the cause of the issue.

### SchedulerConfiguration in Terminating state

SchedulerConfigurations have a finalizer that only gets removed when the scheduler is returned to its default state and is healthy. If a SchedulerConfiguration is stuck in the _Terminating_ state, look at the SchedulerCtrl logs for more information.

As a last resort, make sure the scheduler is healthy and manually edit the SchedulerConfiguration and remove the `schedulerconfigurations.aks.azure.com/finalizer` finalizer from it and contact the Serverless SIG for RCA. DO NOT disable the _User-Defined Scheduler Configuration_ feature in the cluster before addressing this issue, as it may result in the cluster getting stuck in the _Updating_ provisioning state.

### `admission webhook "vschedulerconfiguration.kb.io" denied the request`

The SchedulerCtrl webhook refused the configuration. This error is accompanied by the reason for the refusal. If you are sure the configuration is valid, the validation can be bypassed by deleting the _aks-schedulerctrl_ ValidatingWebhookConfiguration and reappling the SchedulerConfiguration in question. Note that this will prevent the user from receiving instant feedback on the configuration being applied and that the ValidatingWebhookConfiguration object will be reapplied on the next cluster reconciliation. File a repair item for the Serverless SIG to take a better look at the issue.

### `condition is not met: (corev1.Pod).Status.ContainerStatuses[].Ready`

This indicates that the scheduler containers didn't become ready right away. The operation will be retried until all containers are ready or until it reaches some unrecoverable state. No action needs to be taken at this point.

### `Operation cannot be fulfilled on schedulerconfigurations.aks.azure.com ...: the object has been modified; please apply your changes to the latest version and try again`

This error usually indicates that the user has changed the SchedulerConfiguration object while the controller was reconciling it. That's not a harmful operation and the controller will handle that accordingly. There's no action that should be taken.

### `unhealthy container: (corev1.Pod).Status.ContainerStatuses[].State.Waiting.Reason == "CrashLoopBackOff"`

The configuration provided for the scheduler made it unhealthy too many times, making the pod enter a _CrashLoopBackOff_ state. Instruct the customer to take a look at the scheduler logs to identify the specific problem. SchedulerCtrl will reapply the last known good scheduler configuration as a remediation for this issue. Use the SchedulerCtrl dashboard to confirm that.

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>