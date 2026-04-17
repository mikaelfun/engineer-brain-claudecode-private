---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph Pagination"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20Pagination"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph Pagination

## Overview

For more information about pagination in Microsoft Graph, please see
https://learn.microsoft.com/en-us/graph/paging?view=graph-rest-1.0&tabs=http

## PowerShell Example

Here is a **PowerShell** example for pagination:

```powershell
$url = "https://graph.microsoft.com/v1.0/users"

Do{
    $response = $null

    # Call Microsoft Graph
    try {
        $headerParams = $null
        $headerParams = @{'Authorization'="Bearer $($AccessToken)"}    
        $response = (Invoke-WebRequest -UseBasicParsing -Headers $headerParams -Uri $url -Verbose)
        
    }
    catch {
        # Error handling
    }

    # Grab URL from @odata.nextLink
    $nextLink = $content.'@odata.nextLink'
    $url = $nextLink

    # Data handling   
    $content = $null
    $content = $response.Content | ConvertFrom-Json
    $Data = $content.value

    # Stop Do/while loop if there are no other pages
    if(-not $url)
    {
        break
    }

    # Add slight delay to prevent throttling. This number may need to be higher depending on the Service throttling limit
    Start-Sleep -Milliseconds 100
} while($true)
```
