---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Monitor Pipeline/Learning Resources/Lab | Azure Monitor Pipeline Setup"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FMonitor%20Pipeline%2FLearning%20Resources%2FLab%20%7C%20Azure%20Monitor%20Pipeline%20Setup"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

#Overview
---
This lab will cover the following:

- Setting up a lab environment for Azure Monitor Pipeline
- Validating successful installation and checking Heartbeats
- Using the tools telemetrygen and netcat to send OTEL and Syslog info respectively to populate custom log tables

#Azure Resources
---
The Azure Resources involved in this lab are the following:

- Azure Arc-Enabled Kubernetes
- Arc Custom Location
- Azure Monitor Pipeline Extension
- Azure Monitor Pipeline
- Data Collection Rule
- Data Collection Endpoint
- Log Analytics Workspace

#Process
---
Note: All resources created are in East US 2 region, and prior to step 1 I created a Resource Group to store all the resources.

##Create Azure Resources and Add Azure Monitor Pipeline Extension
1. Create a local Kubernetes cluster (you can use something like [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/), [Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download), or [Rancher Desktop](https://rancherdesktop.io/)) and arc enable it follow these [instructions](https://learn.microsoft.com/azure/azure-arc/kubernetes/quickstart-connect-cluster?tabs=azure-cli)

2. Once that is created enable [custom locations](https://learn.microsoft.com/azure/azure-arc/kubernetes/custom-locations#enable-custom-locations-on-your-cluster) for your Arc-Enabled Kubernetes Cluster

3. Create a Log Analytics Workspace, or you can use an existing one if you would like.

4. From your Arc-Enabled Kubernetes Cluster, click on Extensions and then add, on the next page choose the Azure Monitor pipeline extension (Preview) and then Create on the next screen:
![image.png](/.attachments/image-21cf7ea2-c0db-40a4-91fc-ea7610db4673.png)
![image.png](/.attachments/image-de10cafb-e04b-45e2-bcdb-4b53123e924f.png)
![image.png](/.attachments/image-3b665206-3f37-400b-8a4f-64b2215dc6eb.png)

5. The next page will load a wizard with some pre-populated information. You will need to provide the name of the instance and the custom location. The Dataflow tab shows you what types of logs we are collecting and where we are sending them to, **be sure to change this to the desired Log Analytics Workspace!** After going through the options click on create. This will create a few resources:
- Azure Monitor Pipeline
- Data Collection Rule (for the Dataflows as this uses Custom Logs)
- Data Collection Endpoint (for the cluster to send data to and get its configuration)

6. After this you should now have an Arc-Enabled Kubernetes Cluster with the Azure Monitor Pipeline extension installed, on the extensions page you should see the extension and the status as succeeded:
![image.png](/.attachments/image-e31e6204-cd80-4c86-91e1-a41f1523c7fe.png)

7. Once the installation is succeeded and things are running, you should now see Heartbeats in the Log Analytics Workspace from the machine. Running a query such as 'Heartbeat | where TimeGenerated >= ago(1h)' should produce some results. I've expanded out a column to show what the data looks like:
![image.png](/.attachments/image-dccefc30-73c2-4281-aca6-b82c1c1df50b.png)

There are a few things to note such as:
- The 'Computer' column will contain the Azure Monitor Pipeline Resource ID
- The 'OSName' shows as PipelineGroupLinux
- The 'OSMajorVersion' shows as xxxx-statefulset-0 which is the pod on the cluster that sends the Heartbeat data, the beginning part will consist of the name used during extension installation
- The 'Version' will show you the version of the Azure Monitor Pipeline Extension you have
- The 'ComputerEnvironment' will be non-Azure since we're sending it from an Arc-Enabled Kubernetes Cluster

**Note:** If there are no Heartbeats at this stage it's possible that there might be an issue with permissions on the Data Collection Rule, see below process to validate:
1. On the Cluster, run the command `kubectl logs xxxxx-statefulset-0 -n azure-monitor-ns` and see if the following error appears. You'll notice the response code is a 403 which indicates permissions:
`2024-06-07T12:16:25.899Z        error   azuregiglaexporter/logger.go:45 [GigLaLogExporter] Error response code when sending heartbeat to send to GigLA  {"kind": "exporter", "data_type": "logs", "name": "azuregigla/exporter-lx4na8hg1", "responseCode": 403}`

2. In the Azure CLI run the command below to get the ID used for the extension:
`az k8s-extension show --name azmon-pipeline-extension --cluster-name CLUSTERNAME --resource-group RESOURCEGROUP --cluster-type connectedClusters --query "identity.principalId" -o tsv`

3. With the ID returned from the previous command, we'll run a secondary command to add the 'Monitoring Metrics Publisher' role to the Data Collection Rule:
`az role assignment create --assignee "<extension principal ID>" --role "Monitoring Metrics Publisher" --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Insights/dataCollectionRules/<dcr-name>"`

4. Wait 30-60 minutes and then check for Heartbeats again.

##Cluster Artifacts
In this section we'll cover some of the things that get installed locally on the Arc-Enabled Kubernetes Cluster as a part of the extension installation including what they are, their function and how to get data from them via kubectl commands. Note that in my lab the namespace (logical grouping for pods and other things) on my cluster is azure-monitor-ns:

1. Deployment: A deployment by the name of 'azmon-pipeline-extension-pipeline-operator-controller-manager' will be created a way to start provisioning the rest of the components.

2. ReplicaSet: A replicaset by the name of 'azmon-pipeline-extension-pipeline-operator-controller-manager-xxxxxxxxx', the last part being random letters. This contains the containers 'kube-rbac-proxy' and 'manager' for use with managing the extension.

3. StatefulSet: A statefulset by the name of 'xxxx-statefulset' is created with the pod 'xxxx-statefulset-0' with containers 'collector' and 'msi-adapter'. The collector container is used to process the data coming in and has logs if Heartbeats are missing. The msi-adapter is responsible for authenticating to Azure.

###How to View Logs
This section will dive into those artifacts talked about in the last section to get data, this will be done by connecting to that cluster and executing kubectl commands. I'll put some sample commands below with what they do:

```
//Get Deployment
kubectl get deployments -n azure-monitor-ns

Result:
NAME                                                            READY   UP-TO-DATE   AVAILABLE   AGE
azmon-pipeline-extension-pipeline-operator-controller-manager   1/1     1            1           5d1h

//Describe Deployment to retrieve yaml
kubectl describe deployment azmon-pipeline-extension-pipeline-operator-controller-manager -n azure-monitor-ns

//Get Pods for Azure Monitor Pipeline Extension
kubectl get pods -n azure-monitor-ns -o wide

NAME                                                              READY   STATUS    RESTARTS       AGE    IP            NODE           NOMINATED NODE   READINESS GATES
xxxx-statefulset-0                                                2/2     Running   1 (15m ago)    23m    IPADDRESS   COMPUTER   <none>           <none>
azmon-pipeline-extension-pipeline-operator-controller-managwmcj   2/2     Running   72 (16m ago)   5d1h   IPADDRESS   COMPUTER   <none>           <none>

//Describe Pod to get configuration, change pod name to pod not retrieved for the statefulset
kubectl get pods xxxx-statefulset-0 -n azure-monitor-ns

//Get Logs from pod, this example gets them from the collector container of the statefulset
kubectl logs xxxx-statefulset-0 -c collector -n azure-monitor-ns

//Get Services related to Azure Monitor Pipeline Extension, these are used to listen for data and sending to Log Analytics
kubectl get services -n azure-monitor-ns

Result:
NAME                                                         TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)                        AGE
azmon-pipeline-extension-pipeline-operator-metrics-service   ClusterIP      IPADDRESS     <none>          8443/TCP                       5d2h
xxxx-service                                                 ClusterIP      IPADDRESS   <none>          4317/TCP,514/TCP               5d2h
xxxx-external-service                                        LoadBalancer   IPADDRESS    IPADDRESS   4317:31551/TCP,514:31686/TCP   5d2h
```

Tips: 
- If needed you can add something like '> logs.txt' to the command and it'll put the output in a file in which a user can transfer out and put into the DTM for gathering data.

- When reviewing logs, be sure to look out for any errors or recent errors as seen by the timestamp. This might indicate where we need to go with the issue.

##Sending Telemetry
Now we've set up an Arc-Enabled Kubernetes Cluster and have reviewed the common pods and some sample commands on getting data so what's next? In this section we'll discover how to use the Azure Monitor Pipeline extension to send some sample OTEL and Syslog data. Note this is going to require some additional tools which I'll cover as we reach each step.

1. In the first section of this lab, you created an Azure Monitor Pipeline which then created a Data Collection Rule and Data Collection Endpoint. The DCR and DCE work together to provide an endpoint for the cluster to get its configuration as well as knowing where to send the data to. In this instance there are a couple of custom tables setup for this purpose which you can see by reviewing the Log Analytics Workspace under the Tables section:
![image.png](/.attachments/image-e86d2ebf-3f09-41f5-8412-9e3f57278593.png)

2. The table names correspond with the types of data sent to them with 'DefaultAEPOTelLogs_CL' and 'DefaultAEPSyslogLogs_CL' with OTEL and Syslog data, respectively.

3. To send OTEL data we'll use a tool called [Telemetrygen](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen#readme-installing), this requires [Go](https://go.dev/doc/install) which can be installed via the link. Once you have Go installed, you can run the command in the first link to install Telemetrygen.

4. From the sample commands below, we'll run the command to obtain the services on the cluster and get the listed External IP of the 'xxxx-external-service' to use as a target for sending data (Note: In some configurations, you might use your home address instead of 127.0.0.1)

5. Using the Telemetrygen tool and that IP address you can send OTEL data to it, sample command below. Note that even though the duration is 10 seconds, this will send upwards of two hundred plus log entries to the workspace so would advise against modifying the duration parameter to anything higher:
`telemetrygen logs --otlp-insecure --otlp-endpoint IPADDRESS:4317 --body "Test OTEL Values" --duration 10s`

6. After running the command, the output should produce no errors, if it does say it can't connect and you are using the external IP of the service from step 4, switch to using 127.0.0.1 followed by the port 4317 in your command.

7. Once it goes through successfully, we could query the Log Analytics Workspace to see if it worked. Running the query 'DefaultAEPOTelLogs_CL | where TimeGenerated >= ago(1h)' will show your table and the schema of what was setup previously:
![image.png](/.attachments/image-167b9a40-f397-4b30-9865-6e3b8d8b2476.png)

8. Now that we've sent OTEL data, let's send some Syslog data! To do this we'll use the netcat utility which I used from a Linux shell by setting up [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/windows/wsl/install).

9. Once you have set up WSL and added a distro, run this command below to send some sample syslog data. As in step 6 if the external IP doesn't work, switch it to the home address followed by port 514.
`echo "Test Syslog" | nc -q0 IPADDRESS 514`

10. Repeat the above command as many times as you would like, each command will create one entry into the Log Analytics Workspace. Running a query 'DefaultAEPSyslogLogs_CL | where TimeGenerated >= ago(1h)' should produce results with the schema setup previously:
![image.png](/.attachments/image-86af4dba-0256-427b-9eac-5c395b3dff8c.png)

#Lab Completed!
In this lab you have setup multiple Azure Resources including an Arc-Enabled Kubernetes Cluster with the Azure Monitor Pipeline extension, you've connected to the local cluster, reviewed some of the components, and used the Telemetrygen and netcat tools to send OTEL and Syslog data!

For the next steps, feel free to review the Azure Resource details. Make modifications and try to fix them.

#Resources
[Azure Monitor Edge Pipeline Configuration](https://learn.microsoft.com/azure/azure-monitor/essentials/edge-pipeline-configure?tabs=Portal)
