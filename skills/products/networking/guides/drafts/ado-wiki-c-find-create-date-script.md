---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Find Create Date script"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FFind%20Create%20Date%20script"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Find the Creation Date for an Application Gateway

Customers can use the script below to determine when their Application Gateway was created. In some cases, historical logs may no longer be available. As an alternative, the same information is available in ASC. However, these commands allow customers to retrieve the information directly, without needing to open a support ticket.

```powershell
# Ensure you are logged in to Azure
# Connect-AzAccount  # Uncomment if needed

$subscriptionId = "XXXXXXXXXXXXXXXXXXXXXXXXXXX"  # Replace with your subscription ID
$resourceGroupName = "XXXXXXXXXXXXXXXXXXXXXXXXXXX"  # Replace with your resource group name
$applicationGatewayName = "XXXXXXXXXXXXXXXXXXXXXXXXXXX"  # Replace with your Application Gateway name

# Construct the REST API path with filter for efficiency
$apiVersion = "2021-04-01"
$filter = "name eq '$applicationGatewayName' and resourceType eq 'Microsoft.Network/applicationGateways'"
$path = "/subscriptions/$subscriptionId/resourceGroups/$resourceGroupName/resources?api-version=$apiVersion&`$expand=createdTime&`$filter=$filter"

# Invoke the REST method
$response = Invoke-AzRestMethod -Path $path -Method GET

# Parse the JSON response
$resources = ($response.Content | ConvertFrom-Json).value

# Check if the resource was found
if ($resources -and $resources.Count -gt 0) {
    $createdTime = $resources[0].createdTime
    Write-Output "The Application Gateway '$applicationGatewayName' was created on: $createdTime"
} else {
    Write-Output "Application Gateway '$applicationGatewayName' not found in resource group '$resourceGroupName'."
}
```

## Notes

- This script uses `Invoke-AzRestMethod` with `$expand=createdTime` to retrieve the creation timestamp.
- The `$filter` parameter restricts results to the specific resource, improving efficiency.
- The same information is available in ASC (Azure Support Center) if needed.
