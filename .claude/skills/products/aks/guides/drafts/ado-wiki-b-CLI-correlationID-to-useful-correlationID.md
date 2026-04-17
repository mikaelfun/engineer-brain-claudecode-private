---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Kusto/AKS CLI correlationID to useful correlationID"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Tools/Kusto/AKS%20CLI%20correlationID%20to%20useful%20correlationID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Linking CLI correlation IDs to ARM correlation IDs

[[_TOC_]]

## Summary

Currently when you run a CLI operation the correlation ID is not associated directly with the PUT operation so finding the failure can be tricky.

Here's how you go from a CLI provided correlation ID on a GET to the needed PUT.

## Details

Sample AKS attempt/failure

```bash
brett@Azure:~$ az group create -n tmp-aks-test -l westus2
 {
 "id": "/subscriptions/<>/resourceGroups/tmp-aks-test",
  "location": "westus2",
  "managedBy": null,
  "name": "tmp-aks-test",
   "properties": {
    "provisioningState": "Succeeded"
   },
   "tags": null
  }
brett@Azure:~$ az aks create -g tmp-aks-test -n tmp -s standard_b1ms
Deployment failed. Correlation ID: 997c163e-fa3b-4c73-837a-3e86bf0e9e26. Operation failed with status: 200. Details: Resource state Failed
```

This correlation ID is for a GET operation rather than the PUT we normally would work with in a create/update call.

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where correlationId == "{correlationID}" 
| where TaskName != "HttpIncomingRequestStart" 
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, targetUri, operationName, targetUri
```

Output: `GET/SUBSCRIPTIONS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/LOCATIONS/OPERATIONS/ https://management.azure.com/subscriptions/<>/providers/Microsoft.ContainerService/locations/westus2/operations/b074b8c6-1139-41b5-9711-7a69b5c753a2?api-version=2016-03-30`

We can check the targetURI for the operation GUID that is being check and this is how we'll get to the PUT we need.

And here we can see the correlation ID for the PUT operation.

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where serviceRequestId == "{serviceRequestID}" 
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, correlationId 
```

Output: `PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/`

And then look up associated failures:

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries") 
| where correlationId == "{correlationID}" 
| where status == "Failed" 
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project resourceUri, properties 
 
resourceUri properties
 /subscriptions/<>/resourcegroups/tmp-aks-test/providers/Microsoft.ContainerService/managedClusters/tmp {"statusMessage":"{\"status\":\"Failed\",\"error\":{\"code\":\"ResourceOperationFailure\",\"message\":\"The resource operation completed with terminal provisioning state 'Failed'.\",\"details\":[{\"code\":\"ProvisioningInternalError\",\"message\":\"resources.DeploymentsClient#Get: Failure responding to request: StatusCode=404 -- Original Error: autorest/azure: Service returned an error. Status=404 Code=\\\"DeploymentNotFound\\\" Message=\\\"Deployment 'b074b8c6-1139-41b5-9711-7a69b5c753a2' could not be found.\\\"\"}]}}"}
```

In this case the error for this PUT is not too actionable. This is because like ACS AKS submits a deployment from the RP so the original correlation ID is not the correlation ID that is used for the deployment of the nested resources in AKS. Similar to How to get the ACS internal template correlation Id

To get the nested correlationID/deployment within Kusto you can use the following:

Still using our original operationID/serviceRequestID:

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where targetUri contains "{deployments/xxxxxxxx}"
| where httpMethod == "PUT"
| where TaskName != "HttpIncomingRequestStart"
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, correlationId, targetUri  

operationName correlationId targetUri
 PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.RESOURCES/DEPLOYMENTS/ 68461f1a-ed06-406e-9071-730eb44fac3e https://management.azure.com/subscriptions/<>/resourcegroups/MC_tmp-aks-test_tmp_westus2/providers/Microsoft.Resources/deployments/b074b8c6-1139-41b5-9711-7a69b5c753a2?api-version=2016-09-01
```

Then check this correlation ID for something more actionable. This correlation ID would also be used for investigating other RPs involved in the create - CRP/NRP/SRP

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries") 
| where correlationId == "68461f1a-ed06-406e-9071-730eb44fac3e"
| where status == "Failed"
| project resourceUri, properties 

resourceUri properties
/subscriptions/<>/resourcegroups/MC_tmp-aks-test_tmp_westus2/providers/Microsoft.Resources/deployments/b074b8c6-1139-41b5-9711-7a69b5c753a2 {"statusCode":"BadRequest","serviceRequestId":null,"statusMessage":"{\"error\":{\"code\":\"InvalidTemplate\",\"message\":\"Deployment template validation failed: 'The provided value 'standard_b1ms' for the template parameter 'agentpool1VMSize' at line '1' and column '1765' is not valid. The parameter value is not part of the allowed value(s): 'Standard_A0,Standard_A1,Standard_A10,Standard_A11,Standard_A1_v2,Standard_A2,Standard_A2_v2,Standard_A2m_v2,Standard_A3,Standard_A4,Standard_A4_v2,Standard_A4m_v2,Standard_A5,Standard_A6,Standard_A7,Standard_A8,Standard_A8_v2,Standard_A8m_v2,Standard_A9,Standard_B1ms,Standard_B1s,Standard_B2ms,Standard_B2s,Standard_B4ms,Standard_B8ms,Standard_D1,Standard_D11,Standard_D11_v2,Standard_D11_v2_Promo,Standard_D12,Standard_D12_v2,Standard_D12_v2_Promo,Standard_D13,Standard_D13_v2,Standard_D13_v2_Promo,Standard_D14,Standard_D14_v2,Standard_D14_v2_Promo,Standard_D15_v2,Standard_D16_v3,Standard_D16s_v3,Standard_D1_v2,Standard_D2,Standard_D2_v2,Standar...
```

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>

