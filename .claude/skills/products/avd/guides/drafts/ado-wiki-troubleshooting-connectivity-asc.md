---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/ASC (Azure Support Center)/Troubleshooting Connectivity issues with ASC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FASC%20(Azure%20Support%20Center)%2FTroubleshooting%20Connectivity%20issues%20with%20ASC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Connectivity Issues with ASC

## Step 1: Identify the Hostpool

Use the following Kusto query to find the hostpool the Cloud PC is connected to (requires FTE AVD Kusto access):

```kusto
let valueToSearchFor = "**CPCNameHere**"; // Input Cloud PC name
let startDate        = datetime(2023-10-01 14:30:21); // Enter Time range of interest
let endDate          = datetime(2023-10-03 11:32:59); // End of Time range
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").DiagActivity
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").DiagActivity
| where SessionHostPoolName == valueToSearchFor
  or SessionHostName contains valueToSearchFor
| where Type == "Connection"
| where TIMESTAMP >= startDate and TIMESTAMP <= endDate
| distinct ArmPath
```

## Alternative: Without AVD Kusto Access

The hostpool information can also be found within the **RDInfraAgent** registry key, exported as part of the Intune Diagnostics Log collection:

1. Download Intune diagnostics logs
2. Search for `RDInfraAgent` registry export
3. Open with Notepad++ and locate the field `HostPoolArmPath`

## Step 2: Use ASC to Review Connections

1. Open ASC and enter the active case number
2. Select **Resource Explorer** on the left pane and enter the subscription ID from the HostPoolArmPath
3. Expand: resource group -> Microsoft.DesktopVirtualization -> Hostpools -> select the Hostpool

### With ActivityID
- Select **Connection Activity** tab under the Hostpool
- Enter the Activity ID and click Run

### Without ActivityID (time range search)
- Use the **Connection Errors** tab
- Enter the time range of interest together with the Cloud PC name
- Review the output to determine the connection failure and associated error
