---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Monitor Pipeline/Troubleshooting Guides/TSG Azure Monitor Pipeline Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FMonitor%20Pipeline%2FTroubleshooting%20Guides%2FTSG%20Azure%20Monitor%20Pipeline%20Scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---

**NOTE: Please be sure to check the SAP of your case before using any TSGs to ensure this is an Azure Monitor Pipeline case, if it isn't please route it to the correct team or if we own the case modify the SAP to fit the correct product!**

---

##How to validate Arc extension was installed correctly 

1. Run helm history <extension name> -n <extension namespace>. 

- It should show an entry with the same version as the one shown in the Azure Portal under Kubernetes connected cluster page > Extensions blade > version 

- The description should be �Install complete� 

2. Run kubectl describe deployment -n <extension namespace> <extension-name>-pipeline-operator-controller-manager -oyaml 

- You should see the following entries: 
Conditions: 



|Type  |Status  |Reason  |
|--|--|--|
| Available |True  |MinimumReplicasAvailable  |

- There should only be events with the type �Normal� 

3. Run kubectl logs -n <extension namespace> deployment/<extension-name>-pipeline-operator-controller-manager 

- There should be no errors, and a line that says: 
`INFO    Starting workers        {"controller": "azuremonitorpipeline", "controllerGroup": "azuremonitor.microsoft.com", "controllerKind": "AzureMonitorPipeline", "worker count": 1}` 

## Arc extension fails to install with error in Portal/Arc for Kubernetes API 

1. Take note of the error returned by the Portal/API. Often this can help solve the problem. Please provide it when reporting the issue. 

2. Take note of the extension version that failed to install. This is available in the Portal from Kubernetes connected cluster page > Extensions blade > version 

3. Run helm history <extension name> -n <extension namespace>  

4. Run kubectl describe deployment -n <extension namespace> <extension-name>-pipeline-operator-controller-manager -oyaml  

5. Run kubectl logs -n <extension namespace> deployment/<extension-name>-pipeline-operator-controller-manager 

## Creating a Pipeline Group resource in Portal/Azure CLI fails with error 

1. Take note of the error returned by the Portal/API. Often this can help solve the problem. Please provide it when reporting the issue. 

2. Take note of the custom location used when the resource's creation failed. Please provide it when reporting the issue. 

3. Take note of the extension version that failed to install. This is available in the Portal from Kubernetes connected cluster page > Extensions blade > version 

4. Check whether kubectl get azuremonitorpipelines -n <pipeline group namespace> <pipeline group name> returns the pipeline group you expected. 

5. If it is not there, please follow TSG �How to validate Arc extension was installed correctly� 

6. Run kubectl logs -n <extension namespace> deployment/<extension-name>-pipeline-operator-controller-manager 

It should **_have no errors_** and have an entry similar to the following: 

```
2024-04-01T19:30:55Z    INFO    Reconciler starting up  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}} 
2024-04-01T19:30:56Z    INFO    Updated resource        {"name": "pipeline-from-arm-collector-sa", "namespace": "default", "kind": "ServiceAccount"} 
<etc etc> 
2024-04-01T19:30:56Z    INFO    The request is coming from ARM  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}, "request OperationId": "9gw1919"}
```
 7. Run kubectl describe -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset 

It should have the entry: 
`Pods Status:        1 Running / 0 Waiting / 0 Succeeded / 0 Failed` 

It should not have any unexpected error events (see known issues and common errors) 

8. Run kubectl logs -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset -c collector 

It should have the entry: 
`info    service@v0.95.0/service.go:169  Everything is ready. Begin running and processing data.` 

It should not have any unexpected errors 

**_Known issues:_** It could take up to three minutes before the stateful set stops replacing pods it considers �failed�, but thereafter it should stabilize: [Bug 27445907: StatefulSet being recreated before ultimately starting up - Boards (visualstudio.com)](https://msazure.visualstudio.com/One/_workitems/edit/27445907) 

**_Common errors:_** 

�Error response code when sending heartbeat to send to GigLA  {"kind": "exporter", "data_type": "logs", "name": "azuregigla/gigla1", "responseCode": 403}�: 

- This means the extension does not have permission to publish to the DCR endpoint. 

- Add role �Monitoring Metrics Publisher� to extension. It could take up to six hours to update. No updates are needed on the pipeline group � just perform this TSG again later to confirm. 

To be filled out over time: common errors encountered while reconciling pipeline groups in operator 

## How to validate Pipeline Group was successfully created and deployed 

1. Check whether kubectl get azuremonitorpipelines -n <pipeline group namespace> <pipeline group name> returns the pipeline group you expected. 

2. If it is not there, please follow TSG �How to validate Arc extension was installed correctly� 

3. Run kubectl logs -n <extension namespace> deployment/<extension-name>-pipeline-operator-controller-manager 

It should have no errors and have an entry similar to the following: 

```
2024-04-01T19:30:55Z    INFO    Reconciler starting up  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}} 
2024-04-01T19:30:56Z    INFO    Updated resource        {"name": "pipeline-from-arm-collector-sa", "namespace": "default", "kind": "ServiceAccount"} 
<etc etc> 
2024-04-01T19:30:56Z    INFO    The request is coming from ARM  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}, "request OperationId": "9gw1919"}
```
 4. Run kubectl describe -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset 

It should have the entry: 
`Pods Status:        1 Running / 0 Waiting / 0 Succeeded / 0 Failed` 

It should not have any unexpected error events (see known issues and common errors) 

5. Run kubectl logs -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset -c collector 

It should have the entry: 
`info    service@v0.95.0/service.go:169  Everything is ready. Begin running and processing data.` 

It should not have any unexpected errors 

**_Known issues:_** It could take up to three minutes before the stateful set stops replacing pods it considers �failed�, but thereafter it should stabilize: [Bug 27445907: StatefulSet being recreated before ultimately starting up - Boards (visualstudio.com)](https://msazure.visualstudio.com/One/_workitems/edit/27445907) 

**_Common errors:_** 

�Error response code when sending heartbeat to send to GigLA  {"kind": "exporter", "data_type": "logs", "name": "azuregigla/gigla1", "responseCode": 403}�: 

- This means the extension does not have permission to publish to the DCR endpoint. 

- Add role �Monitoring Metrics Publisher� to extension. It could take up to six hours to update. No updates are needed on the pipeline group � just perform this TSG again later to confirm. 

## Pipeline Group resource is not created and marked as �Failed� in Azure, or it is marked as �Accepted� for more than 30 minutes without transitioning to �Succeeded� 

1. Check whether kubectl get azuremonitorpipelines -n <pipeline group namespace> <pipeline group name> returns the pipeline group you expected. 

2. If it is not there, please follow TSG �How to validate Arc extension was installed correctly� 

3. Run kubectl logs -n <extension namespace> deployment/<extension-name>-pipeline-operator-controller-manager 

It should have no errors and have an entry similar to the following: 

```
2024-04-01T19:30:55Z    INFO    Reconciler starting up  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}} 
2024-04-01T19:30:56Z    INFO    Updated resource        {"name": "pipeline-from-arm-collector-sa", "namespace": "default", "kind": "ServiceAccount"} 
<etc etc> 
2024-04-01T19:30:56Z    INFO    The request is coming from ARM  {"azure-monitor-pipeline": {"name":"pipeline-from-arm","namespace":"default"}, "request OperationId": "9gw1919"}
```
 

4. Run kubectl describe -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset 

It should have the entry: 
`Pods Status:        1 Running / 0 Waiting / 0 Succeeded / 0 Failed` 

It should not have any unexpected error events (see known issues and common errors) 

5. Run kubectl logs -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset -c collector 

It should have the entry: 
`info    service@v0.95.0/service.go:169  Everything is ready. Begin running and processing data.` 

It should not have any unexpected errors 

**_Known issues:_** It could take up to three minutes before the stateful set stops replacing pods it considers �failed�, but thereafter it should stabilize: [Bug 27445907: StatefulSet being recreated before ultimately starting up - Boards (visualstudio.com)](https://msazure.visualstudio.com/One/_workitems/edit/27445907) 

**_Common errors:_** 

�Error response code when sending heartbeat to send to GigLA  {"kind": "exporter", "data_type": "logs", "name": "azuregigla/gigla1", "responseCode": 403}�: 

- This means the extension does not have permission to publish to the DCR endpoint. 

- Add role �Monitoring Metrics Publisher� to extension. It could take up to six hours to update. No updates are needed on the pipeline group � just perform this TSG again later to confirm. 

## Observability data is sent to pipeline endpoint, but no data arrives in Log Analytics workspace 


1. Check whether we are looking at the right log analytics workspace. The workspace resource is mentioned in the DCR created by the customer to allow the logs to flow through. Here are further steps to locate the right log analytics workspace configuration from the customer -  

   - Login into Azure Portal. 

   - Find the data collection rule (DCR) created by the customer and click on it. Make sure that the immutable id matches the pipeline configuration.Here is a screenshot to locate this -  

![Picture1.jpg](/.attachments/Picture1-1b114d1b-ed9e-4a8a-b821-c8f85cdc2f34.jpg)

   - Click on JSON View on the top right of the landing page. 

   -  Make a note of the right workspace name is written under �destinations� key of DCR.  

   - Here is a screenshot on where the right log analytics workspace configuration can be found -  

![Picture2.png](/.attachments/Picture2-452be187-a28e-486b-86b6-a00795dc4def.png)



2. Once we have confirmed, we are looking at the right log analytics workspace, make sure to find the right stream name. Refer to this guide for finding the right table name. To locate the table name configured for workspace, take the stream name and refer to �dataFlows� key in the DCR 

![Picture3.png](/.attachments/Picture3-661ba7da-a1ca-4693-a914-404ca08ddf77.png)


3. Once the table name is identified, make sure that the table exists in the log analytics workspace. To locate this, follow these steps - 

   - Log into Azure Portal 

   - Locate the log analytics workspace in Step1 

   - Find the table name from Step2. Refer to this screenshot to find below to find the table name in the workspace -  

![Picture4.png](/.attachments/Picture4-3a831dbf-c525-4768-bab2-59338ed1f342.png)


a. If table does not exist in the workspace, create the expected table manually.  

b. If table does exist, follow these next steps -  

   - In the log analytics resource, click on Logs on left pane 

   - From their, write the table name in query section 

- Make sure to highlight it and then click �Run� 

- Also allow 10-15 mins for any new logs to show up. It can also take upto 6 hours if the customer has just onboarded onto the product. Adjust the time in the query bar to reflect when the logs are expected. 
![Picture5.jpg](/.attachments/Picture5-a421ad35-e734-4259-b592-eca25d8646fb.jpg)

- If the query produces logs, the pipeline is working as expected.  

- If the query does not give results, collect the logs from �Collect logs locally for collector failures� TSG and send them to Microsoft.  


## Collect logs locally for Collector failures 

Run kubectl logs -n <pipeline group namespace> statefulset/<pipeline group name>-statefulset -c collector 

If the customer is seeing networking errors in the logs, check firewall/ network settings in customer�s environment to make sure the data is allowed to flow through strato.  

If otherwise, send the logs to Microsoft.  

## Link to [engineering team TSG](https://microsoft-my.sharepoint.com/:w:/p/msainsbury/EclluFz8UmdPoQn4TBuy5qEB_KM-N1zMjZfkQwoLJDIUmw?e=UR4CUw&wdOrigin=TEAMS-MAGLEV.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1715193355647&web=1)

## ICM Escalation

The IcM path is AZUREMONITOREDGE\Triage

# Resources
[Overview of Azure Monitor pipeline](https://learn.microsoft.com/azure/azure-monitor/essentials/pipeline-overview)
[Azure Monitor Pipeline Configuration](https://learn.microsoft.com/azure/azure-monitor/essentials/edge-pipeline-configure?branch=main&tabs=Portal)
[Azure Blog](https://techcommunity.microsoft.com/t5/azure-observability-blog/accelerate-your-observability-journey-with-azure-monitor/ba-p/4124852)