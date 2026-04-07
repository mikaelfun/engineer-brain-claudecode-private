---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Network Observability (Kappie)/Advanced/Cilium/Container Network Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20%28Kappie%29/Advanced/Cilium/Container%20Network%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Container Network Logs
[[_TOC_]]

##�Overview

The�Container�Network�Logs�component�enhances�the�functionality�of�the�cilium-operator�by�aggregating�user-defined�flow�log�export�configurations.

It�collects�network�flow�data�through�Kubernetes�Custom�Resource�Definitions�(CRDs)�and�merges�these�configurations�into�a�single�ConfigMap.

This�facilitates�easier�management�and�retrieval�by�the�cilium�agent.�Flow�logs�help�users�monitor�network�behavior,�troubleshoot�connectivity�issues,�and�ensure�compliance�with�security�policies.�Advanced�Container�Networking�Services�(ACNS)�provides�both�persistent�and�real-time�monitoring�of�network�flow�logs.

## Pre-requisites
- Container Network Logs requires the cluster to be using Cilium networking. 
- It is only for the Advanced Networking Services paid offering.

##�High�level�flow

Users�define�include�filters�in�a�CR�called�```retinanetworkflowlog```,�specifying�the�traffic�to�be�logged.�

This�resource�is�consolidated�into�a�central�ConfigMap�named�```acns-flowlog-config```�.�

The�ConfigMap�controls�the�Hubble�dynamic�exporter,�which�consumes�the�filters�from�the�ConfigMap�and�writes�the�appropriate�flow�logs�to�files�on�the�host�at�the�path:�```/var/log/acns/hubble```�.�

These�files�are�then�consumed�by�the�ama-logs�agent,�stored�in�Azure�Log�Analytics,�and�made�available�for�viewing�in�an�attached�Grafana�instance.

Multiple�```retinanetworkflowlog```�CRs�can�exist,�and�they�will�be�aggregated�into�the�ConfigMap.�The�filters�are�applied�using�a�logical�"OR"�operation.�

When�CRs�are�deleted,�the�ConfigMap�is�updated�to�remove�the�corresponding�entries.

The�delay�between�operations�and�updates�is�approximately�30�seconds.

## Troubleshooting

### ACNS & Container Network Logs features are enabled, but no logs are appearing in Grafana or file events.log doesn't appear on the host...

#### 1. Verify that feature is enabled.

Note:
 - If logs are expected on Azure Log Analytics or Grafana then customer is using *Managed Storage* via Azure Monitor (AzMon) logs.
 
 - If logs are only expected on events.log file on the host customer is using *Unmanaged Storage*.

Determine which type of storage customer is using and validate the set up:

**Unmanaged Storage** (files stored on the host):
1. ACNS is enabled ```--enable-acns ```

To check cluster:
```shell
az aks show -g <resource-group> -n <cluster-name> 
```

Expect to find:
```shell
"networkProfile":{
	"advancedNwtworking": {
	 "enabled": true,
	 "observability":{
	   "enabled": true
	    }
	}
}
```

**Managed Storage** (AzMon):
1. ACNS is enabled ```--enable-acns ```
2. The Container Network Logs is enabled ```--enable-retina-flow-logs```
3. AKS addons monitoring is enabled ```aks enable-addons -a monitoring --enable-high-log-scale-mode```
	- Monitoring Addon high log scale mode (--enable-high-log-scale-mode). This is required to add Microsoft-RetinaNetworkFlowLogs stream and create DCR with this stream 

To check addons:
```shell
az aks addon list -g <resource-group> -n <cluster-name>
```

Expect to see:
```shell
{
    "api_key": "omsagent",
    "enabled": true,
    "name": "monitoring"
}
```

To check cluster:
```shell
az aks show -g <resource-group> -n <cluster-name> 
```

Expect to find:
```shell
"netowrkProfile":{
	"advancedNwtworking": {
	 "enabled": true,
	 "observability":{
	   "enabled": true
	    }
	}
}
----------------------------
"osmagent":{
	"config":{
		"enableRetinaNetworkFlags": "True"
	}
}
```
Without 'enableRetinaNetworkFlags' set to 'true' container insigth agent would not eb able to colelct flow logs.

For further investigation on Managed Storage issues follow this TSG: [Handling CI Agent Networkflow Logs Issues](https://msazure.visualstudio.com/DefaultCollection/InfrastructureInsights/_git/InfrastructureInsights.wiki?path=/ContainerInsights/TSG/Troubleshooting/CI-Agent-Networkflow-Logs.md&version=GBlongw/networkflowlogs-TSG&_a=preview)


#### 2. Check that feature is configured to collect logs.

Once it is verified that feature is enabled.
Check that feature is configured to collect network flow logs.

To configure the feature, a Custom Resource named 'RetinaNetworkFlowLogs' must be applied to set up filters that will be used for collecting flow logs.

Check if any CR's have been applied: (this CRD is cluster scoped don't need to specify namespace)
```shell
 kubectl get retinanetworkflowlog
```

If you can see CRs returned by above command check that they have been configured by:
```shell
 kubectl describe retinanetworkflowlog <cr-name>
```

Expect to see a Spec node that contains 'Includefilters' & Status node.
Status.State should be 'CONFIGURED' not 'FAILED'

```shell
Spec:
  Includefilters:
    From:
      Namespaced Pod:
        namespace/pod-
    Name:  sample-filter
    Protocol:
      tcp
    To:
      Namespaced Pod:
        namespace/pod-
    Verdict:
      dropped
Status:
  State:      CONFIGURED
  Timestamp:  2025-05-01T11:24:48Z
```

The CR 'retinanetworkflowlog' controls a config map called 'acns-flowlog-config'
The config map is used to configure the Hubble dynamic exporter to write the flow logs to a file:

Check that the config map has been updated:
```shell
kubectl describe configmap acns-flowlog-config -n kube-system
```

Expect the contents to match those of the described CR (From, To, Protocol, Verdict ect)
```shell 
flowlogs.yaml:
----
flowLogs:
- filePath: /var/log/acns/hubble/events.log
  includeFilters:
  - destination_pod:
    - namespace/pod-
    protocol:
    - tcp
    source_pod:
    - namespace/pod-
    verdict:
    - DROPPED
  name: all
```

#### 3. Check flow logs file on the host.

If so far everything is matching, the location of the flow log files can be checked.
The flow logs are aggregated on files on the host.

```events.log``` file should exist here: ```/var/log/acns/hubble```

Check that the file has entries by tailing the events.log file.
Exepect to see flow log JSON objects.

The properties of flow log should match the configured CR for example:
```shell
  "flow": {
    "source": {
      "ID": 307,
      "identity": 38691,
      "cluster_name": "default",
      "namespace": "namepace",
      "pod_name": "pod-666498f4bc-7bhfn",
      "workloads": []
    },
    "destination": {
      "ID": 203,
      "identity": 38691,
      "cluster_name": "default",
      "namespace": "namespace",
      "pod_name": "pod-666498f4bc-db9dv",
      "workloads": []
    },
  },
}
``` 

#### 4. Check Cilium Agent & Operator Configuration

**retina-crd-operator issues**

If the CR is configured but the configmap ```acns-flowlog-config``` is empty:
```shell 
flowlogs.yaml:
----
{}
``` 
There could be an issue with retina-crd-operator.

retina-crd-operator is deployed along side cilium-operator as a side container.
Cilium operator pod can be checked for any errors from this component:
Search for: "retina", "retinanetworkflowlog", "retina-crd", "retina-operator"
```shell 
kubectl logs <cilium-operator-pod> -n kube-system | grep "retinanetworkflowlog" 
``` 
Also seacrh for errors relating to 'dynamic exporter'.

If no logs are present relating to retinanetworkflowlog check the operator to see if crd-manager container config exists:
```shell 
kubectl get po -n kube-system -oyaml <cilium-operator-pod>
``` 

Expect to see:
```shell 
  containers:
  - args:
    - retina-crd-manager
    - --enable-k8s-api-discovery
    - --config-dir
    - /retina/
    command:
    - /retina-operator
---------
    volumeMounts:
    - mountPath: /retina/
      name: cilium-config-path
```

There might be errors associated with management of CRD or configmap.
In this case retina teams needs to investigate.

If the config map is not present or the events.log file is not present another issue could be that everything is configured but cilium operator or cilium agent configuration is not correct.
Check cilium config:
```shell 
kubectl get configmap cilium-config -n kube-system -o yaml
``` 
Expect to see these components they MUST exist:
```shell 
  hubble-export-file-max-size-mb: "10"
  hubble-export-file-max-backups: "5"
  hubble-flowlogs-config-path: /flowlog-config/flowlogs.yaml
  enable-telemetry: "true"
  leader-election: "true"
  hubble-flowlogs-configmapname: acns-flowlog-config
  flowlogs.yaml: |
    flowLogs:
      - name: all
        fieldMask: []
        includeFilters: []
        excludeFilters: []
        filePath: "/var/log/acns/hubble/events.log"
```

Check cilium agent to make sure volume mount exists:
```shell 
 kubectl get po -n kube-system -oyaml <cilium-agent-pod>
``` 
Expect to see:
```shell 
    - mountPath: /flowlog-config
      name: hubble-flowlog-config
      readOnly: true
      recursiveReadOnly: Disabled
```


If some of properties are missing that would cause a failure in colelcting logs.

#### 5. Check AMA configuration

***AMA integration issues***

If all the steps above have been validated and flowlogs are being written to the file on the node,
issue lies on the AMA integration and the file being consumed by ama agent.

Check ama-logs pod to make sure volume mount exists:
```shell 
 kubectl get po -n kube-system -oyaml <ama-logs-pod>
``` 
Expect to see:
```shell 
    - mountPath: /flowlog-config
      name: hubble-flowlog-config
      readOnly: true
      recursiveReadOnly: Disabled
```

Check Data Collection Rule exits for retinnetworkflowlogs:
```shell 
    az monitor data-collection rule list --resource-group <resource-group>
```

Expect to see 'Microsoft-RetinaNetworkFlowLogs' in the streams array:
```shell 
  "dataFlows": [
      {
        "streams": [
          "Microsoft-Perf",
          "Microsoft-Syslog",
          "Microsoft-WindowsEvent",
          "Microsoft-RetinaNetworkFlowLogs",
        ],
        "destinations": [
          "centralWorkspace"
        ]
      }
    ]
  }
```


#### 6. Next Steps

As further troubelshooting steps:

If a cluster already has monitoring addon enabled, and they want to enable Container Netowrk Logs, the monitoring addon will need to be disabled and re-enabled with --enable-high-log-scale-mode.
Monitoring addon can be disabed & reenabled:
```shell 
az aks disable-addons -a monitoring -g <group> -n <cluster>
az aks enable-addons -a monitoring --enable-high-log-scale-mode -g <group> -n <cluster>
az aks update --enable-retina-flow-logs --enable-acns -g <group> -n <cluster>
```

The feature could be disabled & reenabled:
```shell
az aks update --disable-retina-flow-logs -g <group> -n <cluster>
az aks update --enable-retina-flow-logs -g <group> -n <cluster>
```

Since this feature can take up Disk Write alocation Node Disk usage can be checked to see that it is within expected range.


### Customer Facing Errors
#### Azure Cli
1) ACNS is a prerequisite for enabling AMA log collection feature:

    Trying to enable this on a cluster without acns:

    ```az aks update -g test-rg -n test-cluster --enable-retina-flow-logs ```

    Would result in an error message:

    ```Flow logs requires '--enable-acns', advanced networking to be enabled, and the monitoring addon to be enabled.```


2) If the cluster Kubernetes version is below 1.31.0, trying to enable '--enable-retina-flow-logs':

    ```The specified orchestrator version %s is not valid. Advanced Networking Flow Logs is only supported on Kubernetes version 1.31.0 or later. ```

    Where the %s is replaced by the customer's k8s version

3) If a customer tries to enable '--enable-retina-flow-logs' on a subscription where AFEC flag is not enabled:

    ``` Feature Microsoft.ContainerService/AdvancedNetworkingFlowLogsPreview is not enabled. Please see https://aka.ms/aks/previews for how to enable features.```


#### KubeCtl

1) If a customer tries to apply a RetinaNetworkFlowLog CR on a cluster where ACNS is not enabled:
    
   ``` error: resource mapping not found for <....>": no matches for kind "RetinaNetworkFlowLog" in version "acn.azure.com/v1alpha1" ensure CRDs are installed first```

#### Geneva Actions

Two actions are available to fetch ConfigMaps to check configuration:
Jarvis -> Actions -> ContainerApps -> Managed Clusters:

- **GetManagedClusterConfigMap** To get specific ConfigMap eg. ```acns-flowlog-config``` or ```cilium-config```
    - Need to specify Location/Endpoint, ManagedClusterName, Name(cm name), TargetNamespace 
- ***GetManagedClusterConfigMap*** To get all ConfigMaps in a namespace
    - Need to specify Location/Endpoint, ManagedClusterName, TargetNamespace 

#### Kusto

Cilium Operator logs can be checked via Kusto query below:
*Keywords: 'retina', 'retina-crd-operator', 'retinanetworkflowlog'*

Source: [cluster('aznwsdn.kusto.windows.net').database('ACN')]

```shell
RetinaReport
    | where podname has "cilium-operator"
    | where Type has "AppTraces"
    | sort by TimeGenerated desc 
    | take 50
```

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Vijay Rodrigues (VIJAYROD) <vijayrod@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>
