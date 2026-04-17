---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/RPaaS Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FRPaaS%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Ralf Tseng/Andrei Ivanuta**
**<<<WIP>>>**
[[_TOC_]]

# Description

This page contains KQL queries for RPaas Clusters designed to assist engineers in troubleshooting.
 
When ARM receives a request for a resource type managed via RPaaS, the flow goes through RPaaS first. RPaaS performs these steps:
1.  Meta RP Handling
    *   RPaaS? **Meta RP** receives the request from ARM?s front door.
    *   It validates the request against the registered resource type schema and RPaaS configuration.  
2.  Authentication & Authorization
    *   Confirms the caller?s identity and RBAC permissions using Azure AD tokens.
    *   Applies RPaaS-level throttling and subscription checks before proceeding.  
3.  Configuration & Routing
    *   Looks up the resource type registration in **ProviderHub** (RPaaS internal registry).
    *   Determines whether the request should be handled by RPaaS directly (metadata-only operations) or forwarded to the User RP via **Extension API**.  
4.  Policy & Compliance Enforcement
    *   Applies Azure Policies, resource locks, and quota checks at RPaaS level.
    *   Ensures resource type constraints (e.g., allowed regions, SKU limits).  
5.  Metadata Management
    *   For operations not requiring User RP logic (e.g., simple GET, DELETE), RPaaS stores/retrieves resource metadata from its Cosmos DB backend.
    *   This avoids unnecessary calls to User RP for lightweight operations.  
6.  Forwarding to User RP
    *   If the operation requires custom logic (e.g., provisioning, complex validation), RPaaS invokes the **Extension API** to call the User RP endpoint.
    *   Passes correlation IDs and request context for traceability.


# How to access it

1. Prepare the followings:

? ?- Corporate laptop or Azure Virtual Desktop

? ?- Corporate account.

2. Open browser to https://rpsaas.kusto.windows.net/

  

3. Select Database RPaaSProd for accessing the customer's logs.

? ? _RPaaSDogfood containted the logs for clusters deployed in the lab_

? ? ![image.png](/.attachments/image-f8e69b19-0d15-4a38-9ac3-e3c590f2de2f.png)
 

# Single table query
Below are the queries executed on a per-table basis

## HttpIncomingRequests
Contains CRUD API operation received by RPaaS service

### RPaaS incomming CRUD operation
Run this query to review all CRUD operations the RPaaS service received for a given resource. It helps collect correlation IDs and timestamps and provides a complete record of actions performed on the resource.

```k
?   cluster('rpsaas.kusto.windows.net').database('RPaaSProd').HttpIncomingRequests ?
????|?where?PreciseTimeStamp?between?(datetime({startDate})..datetime({endDate}))?//datetime?format?YYYY-MM-DD?HH:MM:ss?//?>=?ago(xd)??? ?
????|?where?subscriptionId?contains?"{subscription}" ?
????|?where?targetUri?contains?"{ResourceID}" ?
????|?project??PreciseTimeStamp,?subscriptionId,correlationId,?httpMethod,?userAgent,ActivityId,?TaskName,?httpStatusCode,?operationName,apiVersion,?durationInMilliseconds, ?
????????Message?=?strcat( ?
????????iif(isnotempty(exceptionMessage),?strcat("exceptionMessage:?",?exceptionMessage,?";\n"),?""), ?
????????iif(isnotempty(tostring(errorCode)),?strcat("errorCodeE:?",?tostring(errorCode),?";\n"),?""), ?
????????iif(isnotempty(tostring(failureCause)),?strcat("failureCause:?",?tostring(failureCause),?";\n"),?""), ?
????????iif(isnotempty(errorMessage),?strcat("errorMessage:?",?errorMessage,?";\n"),?"")),referer,targetUri, ?
????????additionalData?=?strcat( ?
???????iif(isnotempty(tostring(commandName)),?strcat("commandName:?",?tostring(commandName),?";\n"),?""), ?
????????iif(isnotempty(tostring(parameterSetName)),?strcat("parameterSetName:?",?tostring(parameterSetName),?";\n"),?"")) ?
????|?sort?by?PreciseTimeStamp?asc
    //| where httpMethod =="DELETE" // Only look for delete CRUD operation
```
 

## JobTraces

### Simple JobTraces query
Check whether the request was succeeded

```k
????cluster('rpsaas.kusto.windows.net').database('RPaaSProd').JobTraces ?
????|?where?correlationId?==?"{correlationId}"? ?
????|?project?TIMESTAMP,?correlationId,?operationName,?message,?exception,?additionalProperties
```

##JobErrors

### Simple Job Errors query
If the job was failed, you could get the information here to explain the failure.

```k
cluster('rpsaas.kusto.windows.net').database('RPaaSProd').JobErrors
????|?where?correlationId?==?"{correlationId}"? ?
????|?project?TIMESTAMP,?correlationId,?operationName,?message,?exception,?additionalProperties
```

##Errors

### Simple Errors query
If the issue occurred on RP (Resource Provider), we could get the information from this table.

```k
cluster('rpsaas.kusto.windows.net').database('RPaaSProd').Errors
|?where?correlationId?==?"{correlationId}"?
|?project?TIMESTAMP,?correlationId,?operationName,?message
```

##ProvisioningOperations

### Simple Provisioning Operations query
 
Query is used to diagnose provisioning behavior, confirm customer or system actions, and understand the full operational history of any resource type tracked in the provisioning pipeline.

```k
cluster('rpsaas.kusto.windows.net').database('RPaaSProd').ProvisioningOperations
|where?resourceId?==?"{resourceid}"
|project?TIMESTAMP,?PodName,?correlationId,?operationName,?provisioningStatus,resourceId
```

#Multi table queries
<<<WIP>>>