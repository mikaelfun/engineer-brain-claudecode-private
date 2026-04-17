---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/[TSG] - Codeless Connector Framework (CCF)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Third%20Party%20Connectors/%5BTSG%5D%20-%20Codeless%20Connector%20Framework%20(CCF)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

Public Documentation: [Create a codeless connector for Microsoft Sentinel | Microsoft Docs](https://docs.microsoft.com/en-us/azure/sentinel/create-codeless-connector?tabs=deploy-via-arm-template%2Cconnect-via-the-azure-portal)

Blog post: [The Codeless Connector Platform - Microsoft Tech Community](https://techcommunity.microsoft.com/t5/microsoft-sentinel-blog/the-codeless-connector-platform/ba-p/3095455)


#Context 

Codeless Connector Framework (CCF) provides partners, advanced users, and developers with the ability to create custom connectors, connect them, and ingest data to Microsoft Sentinel. Connectors created via the CCF can be deployed via API, an ARM template, or as a solution in the Microsoft Sentinel content hub [Docs](https://docs.microsoft.com/en-us/azure/sentinel/create-codeless-connector?tabs=deploy-via-arm-template%2Cconnect-via-the-azure-portal).


# Possible causes for main issue

What may have happened:

## Creating custom connectors issues
    - *Coming soon* validate the connectors JSON configuration using the validation schema 
        - Using an Online [Json-Schema](https://json-schema.org/) validator ([JSON Schema Validation](https://jsonschema.dev/) / [JSON Schema Validator - Newtonsoft](https://www.jsonschemavalidator.net/))
        - Validate separately the `connectorUiConfig` and `pollingConfig` sections:
            - [ConnectorUiConfig.schema.json - Repos](https://dev.azure.com/msazure/One/_git/ASI-Connectors?path=/src/ConnectorsService/CCPSchemaValidation/Schemas/ConnectorUiConfig.schema.json&version=GBfeature/omhaimov/Telemetry) [PollingConfig.schema.json - Repos](https://dev.azure.com/msazure/One/_git/ASI-Connectors?path=/src/ConnectorsService/CCPSchemaValidation/Schemas/PollingConfig.schema.json&version=GBfeature/omhaimov/Telemetry) 

## Solution Install issues
    - Open a ticket for Content Hub on-call Sentinel US / Sentinel ecosystem third-party content

## Connect fail
    - Check the error coming back from the call (popup on the UI) 
        - Status 400, and a message contains:
            - *Unauthorized*  wrong input credentials inserted on the connect form
            - *The remote name could not be resolved*  the API endpoint cannot be reached. Might be wrong API credentials/properties. Might also be an issue with the connector solution definition template - Open an IcM for `Content Hub` on-call Sentinel US/ Sentinel ecosystem third-party content
        - Status 500 or message contains `Internal server error`
            - If the Failure is coming from **3rd Party API** on which **Microsoft has no control**. Customer will have to reach out the 3rd party provider to troubleshoot issues with their APIs.
                Example: [ICM-622567586](https://portal.microsofticm.com/imp/v5/incidents/details/622567586/summary)
        
            - If the failure is coming from Microsoft API - Internal issue  open a ticket for Sentinel data connectors on-call Sentinel US/ Sentinel ecosystem third-party content 

## No data
    - New data might take a while to come in and to be shown in logs (a few hours)
    - If no data received  can debug by enabling health monitoring (new health messages will be available only after enabling the monitor) 

#What to ask customer for an ICM ?

## Questions to ask a customer 

### 1) The first step is to understand where is the issue  is it in the DCR, LA table, UI or SCUBA connection rules?
     - We recommend to use this [CCFTSG](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/ccpconnector/highleveloverview) & [Useful queries](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/ccpconnector/highleveloverview)

### 2) Did you try to authenticate successfully to the product API using REST API solution such as: Visual Studio/Powershell(Invoke-RestMethod)?  

Example (Created using AI)

```
##PowerShell
$Url          = "<token-url>"
$ClientId     = "<client-id>"
$ClientSecret = "<client-secret>"
 
$Body = @{
  client_id     = $ClientId
  client_secret = $ClientSecret
  grant_type    = "client_credentials"
}
 
Invoke-RestMethod -Method Get -Uri $Url -Body $Body -ContentType "application/x-www-form-urlencoded"
```


### 3) Did you try to send requests to the product API and receive responses as expected without any missing fields using REST API Tool? 

### 4) After deploying the CCF ARM template. did you check that all the expected resources were created? 
    - Data connector definition 
    - Two ContentTemplate resources  one with the connector rule resources and the second with the definition, DCR and LA table resources
    - Validate that the content template resources create as expected (all the variables\parameters  replaced with the right value, OR defined ok in case it should not be replaced) 

### 5) [Enable health monitoring for Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/enable-monitoring). If the data fetch status is not "SUCCESS", review the logs to identify any errors or warnings that may be related to the data fetch issue. Check the data source to ensure that the data is available and accessible. 

### 6) If the customer has problems with deploying the JSON template, it is recommended to use an online JSON validator to check if there are any errors that are related to syntax or JSON limitations. 

    - Tip: You can use the solution tool: [Create Azure Sentinel Solution](https://github.com/Azure/Azure-Sentinel/blob/master/Tools/Create-Azure-Sentinel-Solution/V3/CCF_README.md) 

### 7) If the customer deployed the CCF template successfully and managed to connect the connector and does not see any data  ask the customer if he waited at least 45 minutes. It takes ~40 minutes to be able to see data ingestion. 

### 8) If it has been more than 45 minutes and the customer doesnt see data ingested, check with the customer if the deployment was configured to the right workspace. If another workspace was configured, it will still deploy the CCFtemplate as a valid connector. 

    - If the above did not help, verify the health logs as mentioned in section 5 to understand where the issue is. Send GET request to the API using a rest API Tool such as: Visual Studio/Powershell(Invoke-RestMethod) to see if the API works and return data (maybe the issue is not related to Sentinel) 

 
# Information to provide to PG from a customer 

- Workspace ID 
- CCFtemplate (If the customer is the temaple owner and it is not Microsoft solution) 
- Solution name and version (If the solution is available already) 
- Description of the problem. For example:
    - The customer cant deploy the template and receives the error: X. 
    - The customer deployed the template but cant connect the connecter and receives the error: X 
    - The customer ingests data but there are missing alerts/events. 
    - Etc... The more detailed the problem the easier it will be to investigate it. 
- If possible the product environment with license/credentials to test the connector


# Further debug steps 

Use the [health monitoring](https://docs.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health) 

# Additional info and references 

[CCFDocumentation](https://docs.microsoft.com/en-us/azure/sentinel/create-codeless-connector?tabs=deploy-via-arm-template%2Cconnect-via-the-azure-portal) 

[Official documentation](https://learn.microsoft.com/azure/sentinel/create-codeless-connector)

[Demo link](https://microsofteur-my.sharepoint.com/:v:/g/personal/dzatakovi_microsoft_com/ETY5QX-8pB9Ep8OfQ8_38mUBO1Xbll3AAooyKc-R2o07rw?e=tbL743)

[TSG for CCFissues](https://microsofteur-my.sharepoint.com/:w:/g/personal/dzatakovi_microsoft_com/ESS27nzDwxdMtbCSIjJqFx4BLf59jpSHSgB_QumZXotHuQ?e=2B5wGW)
