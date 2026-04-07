---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/Concept/How Change Tracking & Inventory for AMA Windows Data is Collected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/Concept/How%20Change%20Tracking%20%26%20Inventory%20for%20AMA%20Windows%20Data%20is%20Collected"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::



# How CT&I Agent collects Data
---

This section has two parts involved, namely what AMA does and what CT&I Agent does. 

## Part 1: AMA Initialization
![image.png](/.attachments/image-51f59a40-4c16-4817-bc44-9a8082d17aa5.png)

1. Azure Monitor Agent (AMA) fetches all the DCRs and the MCSConfiguration, stores them at `C:\WindowsAzure\Resources\AMADataStore.LucasWin2019AIO\mcs\configchunks\*.json` and `C:\WindowsAzure\Resources\AMADataStore.LucasWin2019AIO\mcs\mcsconfig.latest.xml` respectively.

2. As per the mcsconfig details, AMA loads the datasources and initializes the LocalStore(cache) at `C:\WindowsAzure\Resources\AMADataStore.<machine-name>\Tables`. Specifically for CT&I DCR, below tables will be created under the above cache directory (they will not be created until first data arrives).
    - <stream>_18299827115690051523.tsf (CONFIG_DATA_BLOB_V2)

    - <stream>_13148241926187733235.tsf (CONFIG_CHANGE_BLOB_V2)

    - <stream>_11545608512621991890.tsf (CONFIG_CHANGE_BLOB)
    ![image.png](/.attachments/image-b3b6561b-6094-4f45-bcd0-376da66af828.png)

3. AMA initializes extension pipes. 
    - `\\.\\pipe\\CAgentStream_CloudAgentInfo_AzureMonitorAgent` - CT&I agent will connect to this socket to obtain DCR config from AMA. 

    - `\\.\\pipe\\CAgentStream_ChangeTracking-Linux_<stream-name>_AzureMonitorAgent` - isn't used by Windows CT&I Agent.

    - `\\.\\pipe\\CAgentStream_ChangeTracking-Windows_<stream-name>_AzureMonitorAgent` - CT&I will write collected data(Software ,Services, Files, Registry Keys) to AMA via this named pipe.  
    ![image.png](/.attachments/image-c7ae34eb-055b-4ac5-bfb2-1c7d0d0a1f4d.png)
    
## Part 2: CT&I Agent Workflow

1. CT&I Agent gets DCR from AMA via  `\\.\\pipe\\CAgentStream_CloudAgentInfo_AzureMonitorAgent`. This behaviour refreshes every 5 mins. 
**Note**: CT&I Agent does not support multiple DCRs. At a time only 1 DCR is supported. If there are multiple CT DCRs assigned to AMA, which DCR finally CT&I Agent gets is random.
2. Per the frequency defined in DCR, Files Scheduler, Services Scheduler, Software Scheduler and Registry Scheduler will be initialized. These schedulers will then trigger corresponding workers to fetch the CT&I data. Please refer to detailed workflow chart as below.
3. When CT&I data are collected, CT&I Agent forwards these data to AMA via `\\.\\pipe\\CAgentStream_ChangeTracking-Windows_<stream-name>_AzureMonitorAgent`. AMA will be then responsible for data upload to ODS. 

## Services
![Snipaste_2024-07-02_15-22-42.png](/.attachments/Snipaste_2024-07-02_15-22-42-bb811d8b-4bbc-4f25-9920-88e2d459098d.png)


```
Get-WmiObject -Query "SELECT * FROM Win32_Service" | Select-Object Name, DisplayName, State, PathName, StartMode, StartName, Description | Format-Table
```


## Software (Patches data included)

![Snipaste_2024-07-02_15-23-18.png](/.attachments/Snipaste_2024-07-02_15-23-18-81dd68c0-c666-4c58-95c9-92637bef4c5a.png)


```
C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\agent\resources\CTResourceApplication\CTResourceApplication.exe SoftwareInventory
```

**Sample Output**:
![Snipaste_2024-07-02_16-57-15.png](/.attachments/Snipaste_2024-07-02_16-57-15-093e4e76-ae32-4ecd-ae5e-ce40ecd26155.png)



## Files
![Snipaste_2024-07-02_15-24-37.png](/.attachments/Snipaste_2024-07-02_15-24-37-7a530763-ede7-4e6a-be3e-88f4a6f7aaae.png)




## Registry Keys
![Snipaste_2024-07-04_11-34-36.png](/.attachments/Snipaste_2024-07-04_11-34-36-648ab1d6-4bbc-4518-9d9e-805dfddadcca.png)

Note:
- There is no inventory blob for registry keys inventory. All data are just sent to CONFIG_CHANGE_BLOB


# What is DB in above workflows
---
The CT&I Agent will store collected data in the DB file `%SystemDrive%\Program Files\ChangeAndInventory\db\changetracking.db`. The DB file can be directly open by any text editor like below, or use https://github.com/ShoshinNikita/boltBrowser. 
![image.png](/.attachments/image-0774c908-edde-47bd-87e9-0fe76bfe9522.png)

Though it contains all the data, it is not recommended to analyze the DB file directly as it is hard to read. We have friendly readable json files (Registry data is not exported to json) at below folder for Azure Arc and Azure VM respectively,  which corresponds to the workers results, and are the same with the DB's content.
- Azure VM: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>`
- Azure Arc: `C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>`
  - File.json             
  - Applications.json         
  - Services.json     
  - Patches.json 

Please note that both DB and the json files only stores the latest collected data (last worker run result). 
