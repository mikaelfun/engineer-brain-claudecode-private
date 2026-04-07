---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Troubleshooter guides/[TSG] - Threat Intelligence/Taxii Connector TSG"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FTroubleshooter%20guides%2F%5BTSG%5D%20-%20Threat%20Intelligence%2FTaxii%20Connector%20TSG"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#Troubleshooting steps

##Backend Telemetry:
```
cluster('SecurityInsights').database('SecurityInsightsProd').ServiceFabricDynamicOE
| where env_time > ago(10d) 
//| where resultType == "Failure" or resultType=="ClientError"
| where customData contains "e6a8b789-4565-419e-b899-7d78990b5bbe" //workspace id
| where operationName contains "Sentinel.Connectors.ConnectorsService.Handlers.ConnectorTypeHandlers.TaxiiConnectorHandler"
| project env_time, operationName, resultType,  resultSignature, resultDescription, rootOperationId, customData 
```
###Result example - API URLs invalid
```
{"x-ms-client-request-id":["460e0d78-4b23-4dbb-b9f8-31253fe6703b"],"workspaceRegion":"eastus","subscriptionId":"600adaf1-30ff-4708-b985-99e7a3932ebe","x-ms-forward-internal-correlation-id":"32930ac6-ec36-41af-89f9-ffc0dd416401","connectorName":"ff40d59a-a197-4e46-8836-ea42c03fbbaf","Kind":"ThreatIntelligenceTaxii","x-ms-client-app-id":["c44b4083-3bb0-49c1-b47d-974e53cbdf3c"],"x-ms-client-session-id":["0056e3c8906549a6968f5b991e93ab98"],"workspaceId":"1b930035-54ab-47c3-9c66-fec3ca8e6312","ConnectorKind":"ThreatIntelligenceTaxii","workspaceName":"sentinel-training-ws","workspaceTenantId":"be5120db-79b5-4b8d-868e-5d16730b6785","resourceGroupName":"sentinel-training","x-ms-correlation-request-id":["76bf513d-903c-4804-8fd6-41a38269a327"],"ExceptionLength":898,"InnerExceptionLength":1347,"Exception":"Message:'One or more errors occurred. (TAXII API root URL or collection id is not valid)' \nStackTrace: '' \n--> Message:'TAXII API root URL or collection id is not valid' \nStackTrace: '
   at Microsoft.Azure.Sentinel.Connectors.Common.Clients.Interflow.TaxiiClient.AddTaxiiClientAsync(String tenantId, String workspaceId, String workspaceRegion, String collectionId, String apiRoot, String friendlyName, String userName, String password, CancellationToken cancellationToken) in /__w/1/s/src/Common/Clients/Interflow/TaxiiClient.cs:line 153\r\n
   at Microsoft.Azure.Sentinel.Connectors.ConnectorsService.Handlers.ConnectorTypeHandlers.TaxiiConnectorHandler.ConnectorModelPreProcessing(BaseConnectorModel connectorModel, List`1 existingConnectors, CancellationToken cancellationToken) in /__w/1/s/src/ConnectorsService/Handlers/ConnectorTypeHandlers/ConcreteTypeHandlers/TaxiiConnectorHandler.cs:line 86'"}
```
##Taxii URL Structure:
Official taxii requirements: https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html#_Toc31107529

##Helpful Curl requests 
```
If your TAXII Server implements TAXII 2.0 
curl -u <username>:<password> <ApiRoot> -H "Accept: application/vnd.oasis.taxii+json; version=2.0" 
curl -u <username>:<password> <ApiRoot>/collections/<CollectionId> -H "Accept: application/vnd.oasis.taxii+json; version=2.0" 
curl -u <username>:<password> <ApiRoot>/collections/<CollectionId>/objects/ -H "Accept: application/vnd.oasis.stix+json; version=2.0" -H Range: 0-0 



If your TAXII Server implements TAXII 2.1 
curl -u <username>:<password> <ApiRoot> -H "Accept: application/taxii+json; version=2.1" 
curl -u <username>:<password> <ApiRoot>/collections/<CollectionId> -H "Accept: application/taxii+json; version=2.1" 
curl -u <username>:<password> <ApiRoot>/collections/<CollectionId>/objects/?limit=1 -H "Accept: application/taxii+json; version=2.1" 
```

##Anomaly Deprecation statement:
https://www.anomali.com/resources/limo

##Helpful ICMs:
1. https://portal.microsofticm.com/imp/v3/incidents/details/335462260/home
2. https://portal.microsofticm.com/imp/v3/incidents/details/328558056/home

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
