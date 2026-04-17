---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Kusto/AKS Remediator"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Tools/Kusto/AKS%20Remediator"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AKS Remediator In-Depth

[[_TOC_]]

## Alert-based Remediator

The Alert-based Remediator is a service deployed in every control plane namespace that acts as an alerts receiver and executes corrective actions.

The current flow of how this remediator gets triggered is as follows:

1. Prometheus scrapes metrics about the cluster on a regular interval
2. Using these metrics, prometheus evaluates the alerting rules on a regular interval and fires any alert that evaluates to true
3. A firing alert that contains the label "remediate: true" triggers the remediator action listed in the alert label "action"

### Alerts that trigger remediation in the Alert-based Remediator

* Alerts for most subscriptions are defined in [aks-operator/config/metrics/profiles/default/alerting_rules.yml](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-operator?path=/config/metrics/profiles/default/alerting_rules.yml). To find which alerts trigger remediation, search for the term <i>remediate: "true"</i>
* Alerts for scale subscriptions are defined in [aks-operator/config/metrics/profiles/scale/alerting_rules.yml](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-operator?path=/config/metrics/profiles/scale/alerting_rules.yml)
  * Clusters in scale subscriptions include only a subset of the alerts and remediations. The list of scale subscription ids is listed in [aks-operator/internal/toggle/toggle.go](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-operator?path=/internal/toggle/toggle.go)
* An explanation of all labels used in the alerts can be found in the [AKS Alerting Standards](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/393141/AKS-Alerting-Standard)

### Actions

Remediation actions are defined in [prometheus-extensions/remediator/action](https://msazure.visualstudio.com/CloudNativeCompute/_git/prometheus-extensions?path=/remediator/action).

### Investigating Remediator Issues

When looking at the [ASI: Managed Cluster](https://asi.azure.ms/) page, choose the **Remediations tab** to view remediations.

* Items listed under the Remediations tab are from the legacy remediator. The message "Remediation failed: Remediation migrated..." appears when the old version of the remediation task is no longer in use. This message is expected and does not indicate an error.

![oldremediator.png](/.attachments/oldremediator-40e84b30-bce8-4de4-acc1-c68fdfe82074.png)

* Items listed in the "Alert-based Remediations" box are from the Alert-based Remediator.

![newremediator.png](/.attachments/newremediator-1d7c05ab-9928-4bc9-b5fb-aa07249610fc.png)

* If you expected to see a remediation and it is not listed:
  * check to see if the subscription is a [scale subscription](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-operator?path=/internal/toggle/toggle.go).
  * check to see if an alert fired:

    ```
    AKSAlertManager
    | where PreciseTimeStamp > ago(1d)
    | where namespace =="<customer-namespace>"
    ```

* To see if the action ran successfully you will need to look at the logs:

  ```
  CPRemediatorLogs
  | where PreciseTimeStamp > ago(1d)
  | where namespace =="<customer-namespace>"
  ```

  * If the remediation shows up in the logs, but you do not see the results of the remediation in your cluster, verify in alerting rules file that the alert that triggered the remediation does not have the label "dryRun: true".

### Temporarily Disabling Alert-based Remediator

There are cases where we may want to disable Remediator temporarily due to noise and disruption to customer's workload. To do this, you will need to create an ICM for the PG as it requires logging into the CCP directly.

---

## Legacy AKS Remediator

AKS is currently working on deprecating the legacy remediator, and replacing it with the Alert-based Remediator (aka CP Remediator) above. Leaving the below content until it is completely removed.

### Problem

Simply wanted to add a quick troubleshooting + links to internal documentation of the AKS Remediator steps. It's often that customers are looking for how AKS is remediating to some problems (Docker not responding / Node NotReady / etc...).

### Troubleshooting

There's a Kusto table for AKS Remediator events:

```txt
cluster('Aks').database('AKSprod').RemediatorEvent 
| where PreciseTimeStamp >= datetime(2020-04-13 01:30:00) and PreciseTimeStamp <= datetime(2020-04-17 11:00:59)
| where subscriptionID == "{SubID}"
//| where msg contains "begin"
| project PreciseTimeStamp, reason, msg, ccpNamespace
```

And we'll usually search for the keyword `begin`, which shows where the remediation is starting.

The next rows will tell us what kind of remediation - eg. below is a Docker Restart because of CustomerLinuxNodesNotReady.

```log
Beginning remediation on 5e961bb831e376000112bd9b due to CustomerLinuxNodesNotReady
Remediation complete
Restarting docker on vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarted docker on vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarting docker on vm {true  1 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarted docker on vm {true  1 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Remediation for CustomerLinuxNodesNotReady on 5e961bb831e376000112bd9b completed
```

In addition to the above AKS RemediatorEvent Table, one can also see the Control Plane Remediator logs using following table.

```txt
cluster('Aks').database('AKSprod').CPRemediatorLogs
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
//| where PreciseTimeStamp >= ago(2d)
| where namespace =="{ccpNamespace}"
```

"Restarting docker" is the 1st remediation for NodesNotReady.

Then it'll try to soft reboot the nodes. eg:

```log
Beginning remediation on 5e961bb831e376000112bd9b due to CustomerLinuxNodesNotReady
Remediation complete
Attempting soft reboot of vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
```

Note that if you see something like below, it doesn't mean that the remediation failed. It simply means that _not enough time_ has spent since the last remediation. Sometimes Remediator is waiting for 10min, or 6 hours before attempting something else.

```log
Remediation failed: remediation (CustomerLinuxNodesNotReady) for cluster (5e961bb831e376000112bd9b) has run too recently
```

### Documentation

Here's the link to the [Product Group wiki on the AKS Remediator steps](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/personalplayground/545806/Remediator-Steps)

And here's [AKS Remediator Source Code](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-monitoring?path=%2Fremediator%2Fhttp.go&version=GBmaster&_a=contents), which explains the different remediations, like **restartDockerOnNode**, **restartNotReadyNodes**... and the amount of time it requires.

Also this is the public documentations:

* <https://docs.microsoft.com/en-us/azure/aks/support-policies#aks-support-coverage-for-worker-nodes>
* <https://docs.microsoft.com/en-us/azure/aks/node-auto-repair>

Point of contact: <axelg@microsoft.com>

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>

