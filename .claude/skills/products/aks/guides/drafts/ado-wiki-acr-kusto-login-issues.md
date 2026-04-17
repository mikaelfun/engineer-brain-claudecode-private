---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Kusto Query to look up Login issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FKusto%20Query%20to%20look%20up%20Login%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto query to look up ACR login issues

1. Check the ACIS endpoint to confirm that the customer has Admin enabled: <https://acis-beta.engineering.core.windows.net/WorkFlowTools.aspx?EndpointCategory=Azure%20Container%20Registry&Endpoint=Azure%20Container%20Registry&OperationKey=GetBasicRegistryDetails&registryloginserverparam=centralitycontainerregistry-on.azurecr.io&StartExecution=false>

2. Confirm that they are getting a login failed in registryactivity

    ```json
    cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
    |  where PreciseTimeStamp > ago(2d)
    | where http_request_host !contains "acrci" and http_request_uri == "/v2/" and toint(http_response_status) >= 400
    | take 100
    ```

3. Ask the customer to check the password in portal if they are using the right password

If the customer is trying to run Admin Creds and still fails then create an ICM.

If it fails with SP creds then its an issue with the SP creds not with registry "acrci" is the test account for PG.

The /v2/ is the request that comes in when a login operation is performed
