---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/Concept/How Change Tracking & Inventory for AMA Linux Data is Collected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/Concept/How%20Change%20Tracking%20%26%20Inventory%20for%20AMA%20Linux%20Data%20is%20Collected"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


# How CT&I Agent collects Data
---

This section has two parts involved, namely what AMA does and what CT&I Agent does. 

## Part 1: AMA Initialization

![Snipaste_2024-01-18_19-16-49.png](/.attachments/Snipaste_2024-01-18_19-16-49-b0dc2e28-4a9b-4a77-bf11-31a51438e336.png)


1. Azure Monitor Agent (AMA) fetches all the DCRs, including CT&I DCR, and stores those DCRs at `/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks`

2. As per the DCRs details, AMA loads the datasources and initializes the LocalSink(cache) at `/var/opt/microsoft/azuremonitoragent/events`. Specifically for CT&I DCR, below folders will be created under the above cache directory.

    - dcr-xxx:CTDataSource-Linux:CONFIG_CHANGE_BLOB

    - dcr-xxx:CTDataSource-Linux:CONFIG_CHANGE_BLOB_V2

    - dcr-xxx:CTDataSource-Linux:CONFIG_DATA_BLOB_V2

    - Similarly, Windows *3 (though won't be used)

3. AMA initializes ODSUploader Tasks for these cache. So that cache data will be uploaded to backend at an interval. 

4. AMA initializes extension sockets. (These are virtual sockets, not a socket file on OS)
    - `@CAgentStream_CloudAgentInfo_config_default_fluent.socket` - CT&I agent will connect to this socket to obtain DCR config from AMA. 

    - `@CAgentStream_CloudAgentInfo_MaExtensionDiagnostics_default_fluent.socket` - so far CT&I Agent don't use this. 

    - `@CAgentStream_CloudAgentInfo_ChangeTracking-Windows_default_fluent.socket` - isn't used by Linux  CT&I Agent.

    - `@CAgentStream_CloudAgentInfo_ChangeTracking-Linux_default_fluent.socket` - CT&I will write collected data(Software ,Services, files) to AMA via this socket.  


## Part 2: CT&I Agent Workflow

1. CT&I Agent gets DCR from AMA via  `@CAgentStream_CloudAgentInfo_config_default_fluent.socket`. This behaviour refreshes every 5 mins. 
**Note**: CT&I Agent does not support multiple DCRs. At a time only 1 DCR is supported. If there are multiple CT DCRs assigned to AMA, which DCR finally CT&I Agent gets is random.
2. Per the frequency defined in DCR, Files Scheduler, Services Scheduler, Software Scheduler will be initialized. These schedulers will then trigger corresponding workers to fetch the CT&I data. Please refer to detailed workflow chart as below.
3. When CT&I data are collected, CT&I Agent forwards these data to AMA via `@CAgentStream_CloudAgentInfo_ChangeTracking-Linux_default_fluent.socket`. AMA will be then responsible for data upload to ODS. 

## Services
![Snipaste_2024-01-19_10-56-09.png](/.attachments/Snipaste_2024-01-19_10-56-09-b7b99a03-c186-4872-9b66-1ab4d02e8726.png)


```
systemctl -a list-unit-files *.service | grep .service | grep -v "@" | awk '{print $1}' | xargs systemctl -a --no-pager --no-legend -p "Names,WantedBy,Description,SubState,FragmentPath,UnitFileState" show
```


## Software
![Snipaste_2024-01-19_10-56-35.png](/.attachments/Snipaste_2024-01-19_10-56-35-86955c0b-095e-4e7b-81b6-52fb01290fa1.png)


- Distros with dpkg (Ubuntu, Debian, etc.): 
```
dpkg-query -W -f 'Name:{Package}\nDescription:{Description}\nMaintainer:{Maintainer}\n'Unknown';4\nSize:{Installed-Size}\nVersion:{Version}\nStatus:{Status}\n{db:Status-Status}\nArch:{Architecture}\n\n'
```


- Distros with rpm (Redhat, CentOS, SUSE, etc.): 
```
rpm -qa --queryformat "%{NAME}; %{SUMMARY}; %{PACKAGER}; %{INSTALLTIME}; %{SIZE}; %{EPOCH}:%{VERSION}-%{RELEASE}; installed; %{ARCH}\n@@" | sed "s/(none)/0/g"
```



## Files
![Snipaste_2024-01-19_10-56-58.png](/.attachments/Snipaste_2024-01-19_10-56-58-736ac116-f656-4daa-a754-f8f6f77ba77d.png)


# What is DB in above workflows
---
The CT&I Agent will store collected data in the DB file `/opt/microsoft/changetrackingdata/db/changetracking.db`. The DB file can be directly open by any text editor like below, or use https://github.com/ShoshinNikita/boltBrowser. 
![image.png](/.attachments/image-0774c908-edde-47bd-87e9-0fe76bfe9522.png)

Though it contains all the data, it is not recommended to analyze the DB file directly as it is hard to read. We have friendly readable json files at below folder for Azure Arc and Azure VM respectively, which corresponds to the workers results, and are the same with the DB's content.

- Azure VM: `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux`
- Azure Arc: `/var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-<version>`
  - File.json             
  - Packages.json         
  - Services.json         

Please note that both DB and the json files only stores the latest collected data (last worker run result). 
