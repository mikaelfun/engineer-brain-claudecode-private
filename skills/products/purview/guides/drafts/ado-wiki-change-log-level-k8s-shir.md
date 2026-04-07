---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in K8s/How to change log level for K8s SHIR"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20K8s%2FHow%20to%20change%20log%20level%20for%20K8s%20SHIR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Log Level
There are 5 levels for the logs:
- Trace
- Debug
- Information
- Warning
- Error
- Critical
- None

"Warning" is default log level. Please note that case is sensitive while you update log level.

# Limitation & Impact
Enabling higher log levels will result in worker re-creation and may impact performance and increase disk utilization. Before proceeding, please check the disk pressure. If it's high, follow to clean up the logs. If you need to upload your logs using `irctl log upload`, note that the upload time is limited to 1 hour. You can follow to adjust your logging behavior to control log size based on your network situation. Please revert to the default log level, 'Warning', after troubleshooting is complete.

# Prerequisite
- The K8s supported Self-Hosted IR has been successfully installed.
- The Kubectl command line tool is installed.
- The K8s cluster is accessible via the Kubectl command line tool, with sufficient permissions to Get and Update Deployments in the compute-fleet-system namespace and Get Pods in all namespaces. Alternatively, you may use the same cluster access credentials used during the K8s SHIR installation.
- (Optional) To clean up existing logs, IRCTL is also required.

# Steps to change Log Level

## Step-1
Retrieve the deployment details of the namespace compute-fleet-system. The default log level is set as an environment variable of the containers, which is 'Warning'. Use the following commands:

`$ kubectl get deployments -n compute-fleet-system`

`$ kubectl get -n compute-fleet-system deployment/compute-fleet-controller-manager -o jsonpath="{'LogLevel: '}{.spec.template.spec.containers[?(@.name=='manager')].env[?(@.name=='LogLevel')].value}{'\n'}"`

LogLevel: Warning

## Step-2
Update the environment variable LogLevel to 'Trace' to enable verbose logging. Use the following command:

`$ kubectl set env deployment/compute-fleet-controller-manager LogLevel=Trace -n compute-fleet-system`

`$ kubectl get -n compute-fleet-system deployment/compute-fleet-controller-manager -o jsonpath="{'LogLevel: '}{.spec.template.spec.containers[?(@.name=='manager')].env[?(@.name=='LogLevel')].value}{'\n'}"`

LogLevel: Trace

## Step-3
Please verify that the new setting has been applied to the K8s Self-Hosted IR Pods. Ensure that the Pods have been re-created due to the changes in Step 2. You can use the command below to check the Pods.

`$ kubectl get pods -A -l 'app.kubernetes.io/name in (batch-defaultspec, interactive-schemaprocess)'`

# Steps to clean up existing logs

List existing logs under irstorage of K8s Shir. You can use the following commands:

`$ ./irctl storage list ./_log/workload`

`$ ./irctl storage list ./_log/infra`

Please delete the logs under irstorage. Ensure that you do not delete the _log directory directly. You may use the following commands:

`$ ./irctl storage delete ./_log/workload`

`$ ./irctl storage delete ./_log/infra`
