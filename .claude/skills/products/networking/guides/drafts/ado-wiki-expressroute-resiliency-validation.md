---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Resiliency/Resiliency Validation"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FFeatures%20and%20Functions%2FExpressRoute%20Resiliency%2FResiliency%20Validation"
importDate: "2026-04-18"
type: troubleshooting-guide
---


[[_TOC_]]

#Overview

Gateway site failover simulation lets the customer test the effect on their gateway when one of the sites (peering locations) is entirely down and helps the customer to make their circuits more resilient to such extreme failures.
We have added a new tab "Resiliency Validation" under the monitoring section of the gateway. On clicking this tab, the customers will see a table - which corresponds to the tests performed on each of the peering location connected to the gateway.

# Test Details Object Explanation:
1. _PeeringLocation_ - The peering location of the test
1. _Circuits_ - This is a list of circuits which are connected to the gateway in that peering location (This contains the following details for each circuit - NrpResourceUri, Name. Service Key and Connection name)
1. _Status_ - This is the test status - It is an enum with one of the following values

    a. NotStarted - No test was started on this peering location
    b. Starting - When the customer has triggered a start simulation on this peering location, but the start operation hasn't completed yet
    c. Running - Simulation is currently running on this peering location - which means all connections on this peering location to the gateway are down
    d. StartFailed - The start operation failed due to some error
    e. Stopping - When the customer has triggered a stop simulation on this peering location, but the stop operation hasn't completed yet
    f. Completed - Stop has completed successfully
    g. StopFailed - Stop Operation Failed due to some error
    h. Invalid - The last test performed on this location has become invalid - i.e., some new circuits got added/ deleted from this location
    i. Expired - The last test performed on this location has expired - currently the expiration period is 3 months

4. _StartTime_ - Time when start operation completed for the test
1. _EndTime_ - Time when stop operation completed on this test
1. _Connections_ - This is a list of connections on the gateway for the peering location (This contains the following details for the connections - Connection name, Nrp URI, Last updated time for the connection, and connection status (connected/ disconnected))
1. _TestGuid_ - the unique GUID to identify the test
1. _TestType_ - For all gateway failover simulation tests, the type would be SingleSiteFailover. We will add more when we introduce maintenance simulation and region failover
1. _Issues_ - This is a one-line problem statement about why the test was marked invalid/ expired
1. _WasSimulationSuccessful_ - This field is populated based on customer's input to the question - "were you able to complete simulation"? 
1. _FailoverConnectionDetails_ - This is a list of all the failover connections for this peering location, i.e., all other connections to this gateway apart from the connections on this peering location.
1. _RedundantRoutes_ - This is a list of all the routes on this peering location, that are also received over some other peering location on the gateway. This field is populated during the start operation
1. _NonRedundantRoutes_ - This is a list of all the routes on this peering location, which are not received via any other peering location. The customer would lose connectivity to these routes if simulation is started on this peering location

#Troubleshooting

##List Of Known errors (Error Code | Error Message | Description)
 
<u>**Thrown from GWM**

| Error Code | Error Message | Description |
|--|--|--|
| GatewayEntityNotFound | Gateway was not found, please check if the gateway exists | If the customer tries to start failover on any non-existent gateway. This is expected never to happen, because in such cases, NRP itself would throw error. The only possible case where this could happen is if gateway manager is invoked directly, for example - if jarvis action is run by an internal engineer or support person |
| NoCircuitFoundForTheGivenPeeringLocation | No circuits found on the peering location {peeringLocation} connected to the gateway. Either the peering location entered is incorrect, or there is no circuit in that peering location connected to the gateway | The gateway is not connected to any circuits. On portal - this would not show an error, infact, it would provide the customers a link to the public doc for creating connections |
| ExpressRouteDeviceUnderMaintenanceDuringStartOperation | One of the devices for circuit {circuit.CircuitName} is not online. Cannot start simulation at this time. Please try after sometime. | If any devices is under maintenance, we do not allow to start failover simulation |
| ExpressRouteDeviceUnderMaintenanceDuringStopOperation  | One of the devices for circuit {circuit.CircuitName} is not online. Cannot stop simulation at this time. Please contact support to escalate this immediately or try after sometime | If the customers are trying to bring their connections back up, and the devices go under maintenance, stop operation would fail. In that case, the customers can reach out to us, and we can help bring the connections up on. |
| FailoverSimulationOnlySupportedForExpressRouteGateway  | Gateway {gatewayName} is not an ExpressRoute gateway. Cannot perform failover simulation actions on this gateway | If the failover operation Is tried on any other gateway except ExpresssRoute |
| FailoverSimulationAlreadyInProgress  | Simulation is already running on this gateway for some other peering location. Cannot start another simulation until the current simulation is stopped | Cannot start simulation on a gateway which is already under simulation for some other peering locatio |
| IncorrectStopTestStatus  | Existing test status is incorrect. Please start a new test | Stop test can only be called on a peering location in which the last test has one of the following statuses - StartFailed, Running, Stopping and Stop Failed. If the customer tries stop on any other peering location, it would throw this error. Note - From portal, this is not possible, since we allow Stop only on acceptable peering locations. This is only possible through powershell |



<u>**Thrown from NRP**

| Error Code | Error Message | Description |
|--|--|--|
| FailoverOperationOnlyAllowedOnExpressRouteGateway  | Failover Simulation operations are currently only supported on Express Route Gatewa | Error Message if the customer tries to call the simulation API for VPN gateways |
| SimulationNotSupportedOnGatewayWhichIsNotInSucceededState  | Gateway is in {0} state. Please bring the gateway back in Succeeded state before performing simulation | This error message is shown when the customer tries to start simulation on a gateway which is not in succeeded state |
| AnotherStartOrStopSimulationIsAlreadyInProgress  | Another {0} operation is already running on this gateway. Please try after sometime | This error message is shown if the customer tries to start/ stop simulation when another operation is already in progress |

##Get Operation

### What to check if the Get Operation Fails

Get the activity Id of the logs from the following query -

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where PreciseTimeStamp between (datetime("2024-07-14T06:13:45.9107017Z") .. datetime("2024-07-14T06:24:31.4435169Z")) **// Replace with the timestamp of the issue**
| where Message contains "GetExpressRouteFailoverAllTestDetailsWorkitem: subscriptionId: 8c992d64-fce9-426d-b278-85642dfeab03, gatewayID: 7d57003f-d186-4522-a0bd-4aa7c6bd522d" **// Replace with the customer subscription Id of the gateway and gateway Id**
| project TIMESTAMP, Message, ActivityId, ServicePrefix
```

The above query may give multiple activity Ids because the customer might try the GET operation multiple times. You can choose any one activity Id to start with, Also, keep the timestamp as precise as possible, to get the exact details of failure. Once you get the activity Id, check the logs of the activity Id to find out if there is any exception using the following query:

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where ActivityId == "bb255f01-7b77-4aa8-b1f8-24710c2f176d" // Replace with the activity Id found above
| where Message !startswith "RequestFailedException for query"
| project TIMESTAMP, Message, OperationName, GatewayManagerVersion, ServicePrefix, RoleInstance, Tenant, OperationId, CustomerSubscriptionId
| order by TIMESTAMP asc
```
Any known issue would already be thrown as localizable error to the customer. You can check the list of known errors [here](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki?wikiVersion=GBmaster&_a=edit&pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Resiliency/Resiliency%20Validation&pageId=1679354&anchor=list-of-known-errors-(error-code-%7C-error-message-%7C-description)).
	
The GET operation actually tries to get the circuit, device and vnet config. For circuits which are not in the same region as gateway, we do a cross region call. In 24.8, we get all this information by doing a cross-region dump circuit call. Starting 24.10, to optimize the Get calls, we get all these calls from cross region storage tables, and also, all cross region call is done in parallel for all the circuits. 

### Possible issues the customers can report with GET operation

1. **Test showing invalid even though it was never ran** - Currently there is a known issue, where the customer might see the test status as "invalid", even though he never started a test in that peering location. This is due to the fact that the first time the GET API is called, it would store the test details as "NotStarted". If after that, the customer adds a new circuit in that peering location, it marks the test as invalid. In general - if a test was never started, it should not be marked as invalid. Here is the repair item for the same - https://msazure.visualstudio.com/One/_sprints/taskboard/Networking-IDC-ER/One/Selenium/CY24Q4/Monthly/10%20Oct%20(Sep%2029%20-%20Oct%2026)?workitem=29684376

1. **Customers complaining that the "Resiliency validation" home page is taking too long to load** - The GET call uses dump circuit and calls it "serially" for all cross-region circuits. For customers with many cross region circuits, the API might take time. The optimization changes are completed - but would be rolling out with 24.10 across production. Here is the PR for optimization changes - https://msazure.visualstudio.com/One/_git/Networking-nfv/pullrequest/10729034

##Start Operation

### What to check if the Start Operation Fails

Get the activity Id of the failure from the following logs - 

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where PreciseTimeStamp between (datetime("2024-07-14T06:13:45.9107017Z") .. datetime("2024-07-14T06:24:31.4435169Z")) // Replace with the timestamp of the issue
| where Message contains "StartExpressRouteSiteFailoverSimulation: subscriptionId: 05f401ac-885f-4ba4-b2d6-7c5444596230, gatewayID: 7c01003f-55a8-40be-86c3-36ca9f0a1dad" // Replace with the customer subscription Id of the gateway and gateway Id
| project TIMESTAMP, Message, ActivityId, ServicePrefix
```
Once the activity Id is found, use the below query to check for the logs of the operation, and find out any issues - 

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where ActivityId == "bb255f01-7b77-4aa8-b1f8-24710c2f176d" // Replace with the activity Id found above
| where Message !startswith "RequestFailedException for query"
| project TIMESTAMP, Message, OperationName, GatewayManagerVersion, ServicePrefix, RoleInstance, Tenant, OperationId, CustomerSubscriptionId
| order by TIMESTAMP asc
```

###How to know that the customer's setup is under simulation?

Do a Get gateway using the jarvis action - https://jarvis-west.dc.ad.msft.net/B71A9B77?genevatraceguid=f9b9e22f-d988-42b6-a4c2-9f9a1a1ac126 and check for the following field - "**IsGatewayUnderFailoverSimulation**". **[Do not rely on kusto/ gateway dashboard because the value there could be old one due to ingestion delay].** If the value for this field is true -> it means that simulation is still running on this gateway for some peering location. If the customer has reached out with some particular service key - the dump circuit information would also show which connection is under failover simulation like below - 

![Network status report showing two tunnels with IPs, VNETs, keys, gateway IDs, and failover simulation details.](/.attachments/image-8f0c8f74-2e17-47fa-9d46-52f89d835869.png)

###Possible Issues the customers can report with START operation

1. **Start operation failed, but some connections were brought down, while others were not** - This is possible because the start operation brings down the connections one-by-one. So, let's suppose there were total 3 circuits to be brought down, and the start operation failed during the second one. The operation would halt there, with connection 1 brought down, but connection 2 and 3 would still be up. This would show in the "impacted connections" on portal, in the start side blade. Only the connections which were actually brought down would show "Disconnected".   We need to check why the start operation failed, and on the portal - the customer would only see the option to "stop" test in that peering location. The immediate step would be to ask the customer to stop the test in that peering location. If that fails, we need to run the stop operation manually for the customer using the STOP jarvis action. See [here](https://msazure.visualstudio.com/AzureWiki/_wiki/wikis/AzureWiki.wiki/717108/?wikiVersion=GBwikiMaster&_a=edit&pagePath=/Azure%20Wiki%20Home/Networking/Hybrid%20Networking/ExpressRoute/TSGs/TSG%20for%20Gateway%20Failover%20for%20Resiliency%20Validation&anchor=jarvis-action) on how to stop simulation using jarvis action. Always prefer stopping through ACIS, because it will modify the fields associated with the test as well. If nothing works, we need to manually bring the tunnel up on the device. See [here](https://msazure.visualstudio.com/AzureWiki/_wiki/wikis/AzureWiki.wiki/717108/?wikiVersion=GBwikiMaster&_a=edit&pagePath=/Azure%20Wiki%20Home/Networking/Hybrid%20Networking/ExpressRoute/TSGs/TSG%20for%20Gateway%20Failover%20for%20Resiliency%20Validation&anchor=commands-to-bring-bgp-up) on what commands are used to bring the tunnel up.

1. **Start operation failed but last test still shows completed** - It is possible that due to some code bug, the start operation did not even reach the point of code where it actually brings down the connection. In that case, the start operation does not make any changes to the last test on the peering location. The test status is changed only when the operation fails while bringing down one of the connections.

##Stop Operation

###What to check if the Stop Operation Fails**

Use the following kusto query to find out the activity Id of the failing operation -

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where PreciseTimeStamp between (datetime("2024-07-14T06:13:45.9107017Z") .. datetime("2024-07-14T06:24:31.4435169Z")) // Replace with the timestamp of the issue
| where Message contains "StopExpressRouteSiteFailoverSimulation: subscriptionId: 05f401ac-885f-4ba4-b2d6-7c5444596230, gatewayID: 026f003f-75fb-4808-b0b7-49dcea9304e0" // Replace with the customer subscription Id of the gateway and gateway Id
| project TIMESTAMP, Message, ActivityId, ServicePrefix
```
Once the activity Id is found, use the below query to check for the logs of the operation, and find out any issues - 

```
union GatewayManagerLogsTable, AsyncWorkerLogsTable, DeviceEventLogsTable
| where ActivityId == "bb255f01-7b77-4aa8-b1f8-24710c2f176d" // Replace with the activity Id found above
| where Message !startswith "RequestFailedException for query"
| project TIMESTAMP, Message, OperationName, GatewayManagerVersion, ServicePrefix, RoleInstance, Tenant, OperationId, CustomerSubscriptionId
| order by TIMESTAMP asc
```

###Possible Issues the customers can report for STOP operation**

It is to note that while the failure of GET and START operations might not be disruptive for the customers, failure of STOP is very critical, because the connections being down can impact customers' traffic. The customers can complain with the following issues

1. Stop operation failed due to device in maintenance - This can happen if during the start operation, the device was fine, but when the customer is trying to bring the connections up, the device is marked offline due to maintenance going on. While we do have plan to integrate the maintenance notification in the resiliency validation page itself (we are planning to show if the maintenance is about to start within 1-2 days), currently we cannot control this behavior. Also, we are planning to add an alert whenever stop fails.  So if the device is undergoing maintenance and the cx reaches out to us, we should talk immediately to Erops to bring BGP up on atleast one device directly. We keep the alert active, until the device is marked online, and then run the jarvis action to stop simulation on the peering location. 

#Escalation

If the above information does not resolve your issue with ExpressRoute Resiliency Validation, please work with a TA to file an ICM. 

#Contributors
@<64EC623D-6FBA-6CDA-9945-25BF8D7938F1> (Author)<br>
@<ABFFCE7F-A93E-4F09-AE10-4978ED838817> 