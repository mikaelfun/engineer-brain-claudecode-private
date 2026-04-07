---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/Troubleshooting Guide/Troubleshoot Data Collection Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FChange%20Tracking(v2)%20and%20Inventory%2FChange%20Tracking%20and%20Inventory%20(CT%26I)%20V2%20-%20Windows%2FTroubleshooting%20Guide%2FTroubleshoot%20Data%20Collection%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::






# Scenario 1 - Missing all data
---
This scenario applies to CT&I v2 Windows Agent failed to collect all data, that is ConfigurationData & ConfigurationChange are empty.

## Troubleshooting Idea

![image.png](/.attachments/image-62067081-af05-4c59-bdda-11a78a8b13f1.png)


## Preliminary Checks

1. **Check AMA Heartbeat**
- Since CT&I v2 replies on AMA to report data to LAW, if no data is collected, most likely would be an AMA issue, as if AMA is in disconnected state, then no CT&I data can be collected. see [Troubleshooting Windows AMA Missing Heartbeats](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-Windows-AMA-Missing-Heartbeats)


2. **Check local CT&I DCR**
- If Heartbeat is coming then the VM is at least associated with one DCR. We can check if that one is CT&I DCR by looking to files at `C:\WindowsAzure\Resources\AMADataStore.<machine-name>\mcs\configchunks\*.json`. A good CT&I DCR file looks similar like below

<details closed>
<summary>Example CT&I DCR content:</summary>

```
{
	"dataSources": [
		{
			"configuration": {
				"extensionName": "ChangeTracking-Windows"
			},
			"id": "CTDataSource-Windows",
			"kind": "extension",
			"streams": [
				{
					"stream": "CONFIG_CHANGE_BLOB",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_CHANGE_BLOB"
				},
				{
					"stream": "CONFIG_CHANGE_BLOB_V2",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_CHANGE_BLOB_V2"
				},
				{
					"stream": "CONFIG_DATA_BLOB_V2",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_DATA_BLOB_V2"
				}
			],
			"sendToChannels": [
				"ods-731eac71-f4a0-479a-a013-782706f35f28"
			]
		},
		{
			"configuration": {
				"extensionName": "ChangeTracking-Linux"
			},
			"id": "CTDataSource-Linux",
			"kind": "extension",
			"streams": [
				{
					"stream": "CONFIG_CHANGE_BLOB",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_CHANGE_BLOB"
				},
				{
					"stream": "CONFIG_CHANGE_BLOB_V2",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_CHANGE_BLOB_V2"
				},
				{
					"stream": "CONFIG_DATA_BLOB_V2",
					"solution": "ChangeTracking",
					"extensionOutputStream": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_DATA_BLOB_V2"
				}
			],
			"sendToChannels": [
				"ods-731eac71-f4a0-479a-a013-782706f35f28"
			]
		}
	],
	"channels": [
		{
			"endpoint": "https://731eac71-f4a0-479a-a013-782706f35f28.ods.opinsights.azure.com",
			"tokenEndpointUri": "https://global.handler.control.monitor.azure.com/subscriptions/6f5f8fcf-a825-455a-8b79-3562e43c6748/resourceGroups/LucasRG3/providers/Microsoft.Compute/virtualMachines/LucasVMUbuntuCT/agentConfigurations/dcr-cad67fc3f9024d43bafe704f83012bc6/channels/ods-731eac71-f4a0-479a-a013-782706f35f28/issueIngestionToken?operatingLocation=eastus&platform=linux&includeMeConfig=true&api-version=2022-06-02",
			"id": "ods-731eac71-f4a0-479a-a013-782706f35f28",
			"protocol": "ods"
		}
	],
	"extensionConfigurations": {
		"ChangeTracking-Windows": [
			{
				"id": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows",
				"originIds": [
					"/subscriptions/6f5f8fcf-a825-455a-8b79-3562e43c6748/resourceGroups/lucasrg3/providers/Microsoft.Insights/dataCollectionRules/ct-dcr177230743"
				],
				"extensionSettings": {
					"enableFiles": true,
					"enableSoftware": true,
					"enableRegistry": true,
					"enableServices": true,
					"enableInventory": true,
					"registrySettings": {
						"registryCollectionFrequency": 3000,
						"registryInfo": [
							{
								"name": "Registry_1",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Group Policy\\Scripts\\Startup",
								"valueName": ""
							},
							{
								"name": "Registry_2",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Group Policy\\Scripts\\Shutdown",
								"valueName": ""
							},
							{
								"name": "Registry_3",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Run",
								"valueName": ""
							},
							{
								"name": "Registry_4",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Active Setup\\Installed Components",
								"valueName": ""
							},
							{
								"name": "Registry_5",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Classes\\Directory\\ShellEx\\ContextMenuHandlers",
								"valueName": ""
							},
							{
								"name": "Registry_6",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Classes\\Directory\\Background\\ShellEx\\ContextMenuHandlers",
								"valueName": ""
							},
							{
								"name": "Registry_7",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Classes\\Directory\\Shellex\\CopyHookHandlers",
								"valueName": ""
							},
							{
								"name": "Registry_8",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\ShellIconOverlayIdentifiers",
								"valueName": ""
							},
							{
								"name": "Registry_9",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\ShellIconOverlayIdentifiers",
								"valueName": ""
							},
							{
								"name": "Registry_10",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Browser Helper Objects",
								"valueName": ""
							},
							{
								"name": "Registry_11",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Browser Helper Objects",
								"valueName": ""
							},
							{
								"name": "Registry_12",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer\\Extensions",
								"valueName": ""
							},
							{
								"name": "Registry_13",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Internet Explorer\\Extensions",
								"valueName": ""
							},
							{
								"name": "Registry_14",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Drivers32",
								"valueName": ""
							},
							{
								"name": "Registry_15",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Windows NT\\CurrentVersion\\Drivers32",
								"valueName": ""
							},
							{
								"name": "Registry_16",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Session Manager\\KnownDlls",
								"valueName": ""
							},
							{
								"name": "Registry_17",
								"groupTag": "Recommended",
								"enabled": false,
								"recurse": true,
								"description": "",
								"keyName": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\\Notify",
								"valueName": ""
							}
						]
					},
					"fileSettings": {
						"fileCollectionFrequency": 2700,
						"uploadSetting": {
							"storageAccountResourceId": "/subscriptions/6f5f8fcf-a825-455a-8b79-3562e43c6748/resourceGroups/LucasRG3/providers/Microsoft.Storage/storageAccounts/lucassa3",
							"blobEndpoint": "https://lucassa3.blob.core.windows.net/",
							"managedIdentity": ""
						}
					},
					"softwareSettings": {
						"softwareCollectionFrequency": 1800
					},
					"inventorySettings": {
						"inventoryCollectionFrequency": 36000
					},
					"servicesSettings": {
						"serviceCollectionFrequency": 1800
					},
					"enableUpload": true
				},
				"outputStreams": {
					"CONFIG_CHANGE_BLOB": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_CHANGE_BLOB",
					"CONFIG_CHANGE_BLOB_V2": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_CHANGE_BLOB_V2",
					"CONFIG_DATA_BLOB_V2": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Windows:CONFIG_DATA_BLOB_V2"
				}
			}
		],
		"ChangeTracking-Linux": [
			{
				"id": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux",
				"originIds": [
					"/subscriptions/6f5f8fcf-a825-455a-8b79-3562e43c6748/resourceGroups/lucasrg3/providers/Microsoft.Insights/dataCollectionRules/ct-dcr177230743"
				],
				"extensionSettings": {
					"enableFiles": true,
					"enableSoftware": true,
					"enableRegistry": false,
					"enableServices": true,
					"enableInventory": true,
					"fileSettings": {
						"fileCollectionFrequency": 900,
						"fileInfo": [
							{
								"name": "ChangeTrackingLinuxPath_default",
								"enabled": true,
								"destinationPath": "/etc/.*.conf",
								"useSudo": true,
								"recurse": true,
								"maxContentsReturnable": 5000000,
								"pathType": "File",
								"type": "File",
								"links": "Follow",
								"maxOutputSize": 500000,
								"groupTag": "Recommended",
								"uploadContent": true
							},
							{
								"name": "LucasTestFile",
								"description": "",
								"destinationPath": "/home/huanggua/log/.*.log",
								"pathType": "File",
								"recurse": true,
								"links": "Follow",
								"uploadContent": true,
								"checksum": "Sha256",
								"maxOutputSize": 5000000,
								"groupTag": "Custom",
								"maxContentsReturnable": 0,
								"useSudo": true,
								"enabled": true
							}
						],
						"uploadSetting": {
							"storageAccountResourceId": "/subscriptions/6f5f8fcf-a825-455a-8b79-3562e43c6748/resourceGroups/LucasRG3/providers/Microsoft.Storage/storageAccounts/lucassa3",
							"blobEndpoint": "https://lucassa3.blob.core.windows.net/",
							"managedIdentity": ""
						}
					},
					"softwareSettings": {
						"softwareCollectionFrequency": 300
					},
					"inventorySettings": {
						"inventoryCollectionFrequency": 36000
					},
					"servicesSettings": {
						"serviceCollectionFrequency": 300
					},
					"enableUpload": true
				},
				"outputStreams": {
					"CONFIG_CHANGE_BLOB": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_CHANGE_BLOB",
					"CONFIG_CHANGE_BLOB_V2": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_CHANGE_BLOB_V2",
					"CONFIG_DATA_BLOB_V2": "dcr-cad67fc3f9024d43bafe704f83012bc6:CTDataSource-Linux:CONFIG_DATA_BLOB_V2"
				}
			}
		]
	}
}
```

</details>


3. **Check AMA extension named pipes**
- Once CT&I DCR is downloaded, then extension named pipes should be initialized. Check named pipes establishment by `[System.IO.Directory]::GetFiles("\\.\\pipe\\") | findStr "CAgentStream"`, similar result to below represents a good one.  If no such named pipes, please double check if CT&I DCR has been downloaded in step 2.
![image.png](/.attachments/image-c7ae34eb-055b-4ac5-bfb2-1c7d0d0a1f4d.png)

4. **Check if AMA received data from CT&I Agent**
- Suggested to use AMA Windows Troubleshooter to collect AMA logs, since it will automatically parse tsf to csv for us. Please refer to here [How To run  AgentTroubleshooter.exe for AMA - Windows](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Windows/How%2DTo/How-To-run--AgentTroubleshooter.exe-for-AMA-%2D-Windows).
- After which, let's view file `...\AgentTroubleshooterOutput-{DateTime}\AgentDataStore\Mcs\mcsconfig.latest.xml`, where you can find the localStoreName of CT&I data in "eventName" field.
![image.png](/.attachments/image-c2d0a37c-ae8b-4a6e-9fb7-cfd3acc3fc61.png)
- Now let's go to `...\AgentTroubleshooterOutput-{DateTime}\AgentDataStore\Tables\{localStoreName}.csv` and see if we have CT&I data that the AMA has received and cached. Example of my environment:
![image.png](/.attachments/image-ec65e498-9b56-4301-a6a2-db4403d19b7a.png)
![image.png](/.attachments/image-5e6375ef-5793-4da2-866c-9ce1d66f71ef.png)


5. **Check if CT&I Agent is collecting CT&I data**
- If above localStore files does not exist or is empty, please check CT&I Agent log `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\cta_windows_agent.log` or [How To: Kusto for checking CT&I V2 Agent Log](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Kusto-for-checking-CT&I-V2-Agent-Log) to find out if CT&I Agent is collecting data. Similar output as below represents a good one.
```
...
time="2023-12-12T08:02:59Z" level=info msg="Number of Package received in this run: 613"
...
time="2023-12-12T08:03:00Z" level=info msg="Number of services recieved in this run: 180"
....
``` 



# Scenario 2 - Missing partial data
---
This scenario applies to CT&I v2 Windows Agent failed to collect partial data, that is missing partial entries/fields.

## Troubleshooting Idea

![image.png](/.attachments/image-3434bcdc-bfb1-4fd1-ac56-05017a18b869.png)

## Preliminary Checks

1. **Check list for AMA**
- We need to check AMA's localStore and see if it has the same data with what customer have in the workspace. If data is complete in localStore but not in workspace, then we should create an IcM towards AMA's Product Group.

2. **Check list for CT&I Agent**
- See [How Change Tracking & Inventory for AMA Windows Data is Collected](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/Concept/How-Change-Tracking-&-Inventory-for-AMA-Windows-Data-is-Collected) and manual run corresponding commands to compare with results in customer's workspace.
- If the real query result doesn't contain what customer is expecting, then we should explain to customer how the agent works and no such data is expected. 
- Or if the real query result do have the data, but our agent doesn't collect as expected, please double check the debug log on why our agent ignores this record. See [How To: Enable Trace Logging of CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Enable-Trace-Logging-of-CT&I-Windows-Agent).


# Logs for CT&I Agent Analysis
---
-  Always collect AMA Windows log. See [How To run  AgentTroubleshooter.exe for AMA - Windows](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Windows/How%2DTo/How-To-run--AgentTroubleshooter.exe-for-AMA-%2D-Windows).
- All the files from path 
Azure VM: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\`
Azure Arc: `C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\`
  - CommandExecution.log  (Extension log)
  - cta_windows_handler.log  (Handler log)
  - cta_windows_watcher.log  (Watcher log)
  - cta_windows_agent.log   (Main Agent log)
  - File.json             (DB data of last run of File worker)
  - Applications.json         (DB data of last run of Software worker for applications)
  - patches.json         (DB data of last run of Software worker for patches)
  - Services.json         (DB data of last run of Service worker)

- DB file at `%SystemDrive%\Program Files\ChangeAndInventory\db\changetracking.db`


- For getting an equivalent logging of `cta_windows_agent.log` from backend, please refer to [How To: Kusto for checking CT&I V2 Agent Log](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Kusto-for-checking-CT&I-V2-Agent-Log).

- If above logs aren't enough to help you identify issues, we can do further analysis by enabling debug logging. Please  refer to [How To: Enable Debug Logging of CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Enable-Trace-Logging-of-CT&I-Windows-Agent).



# Support Boundary 
Refer to the below support boundary to determine the correct team to reach out to support based on the scenarios. 




|**Scenario**| **IcM Escalation Path** | **Support Topics**  |
|--|--|--|
| **Change Tracking V2** <br> 1.Extension installation and uninstallation<br>2. issues related to default DCR created for Change tracking| Azure Automation/Change Tracking(Sev 3 & Sev 4) | Azure\Change Tracking and Inventory\Change Tracking and Inventory with AMA  |
| **AMA Agent**<br> 1. Installing and uninstalling AMA Agent<br> 2. No heartbeat for Agent <br> 3. Missing or no data from Agent<br>| Azure Monitor Data Collection/AMA Linux <br> Azure Monitor Data Collection/AMA Windows | Data Colletion rules (DCR) and Agent  |
| **DCR scenarios:** <br>1. Error creating, deleting DCR <br> 2. Need help with creating ,associating or viewing DCR|Azure Monitor Control Service (AMCS)/Triage|Data Colletion rules (DCR) and Agent |
| **FIM Scenarios** <br> 1.Error enabling FIM in the Log Analytics workspace<br>2. Migration from legacy to new FIM<br>3. Not tracking changes<br>|Microsoft Defender for Cloud\Guardians| Azure\Microsoft Defender for Cloud\Enhanced security features for servers\File Integrity Monitoring (FIM) |

 



# IcM Escalation path 
<details closed>
<summary><b>Scenarios & Templates</b></summary>
<div style="margin:25px">

Refer to the following for IcM Escalation path based on scenario

|**Scenario**| **IcM Escalation Path** | **ICM Template**  |
|--|--|--|
| **Change Tracking V2** <br> Extension installation and uninstallation| Azure Automation/Change Tracking(Sev 3 & Sev 4) | Icm template -Change Tracking and Inventory with AMA [j234o3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j234o3) |
| **AMA Agent**<br> 1. Installing and uninstalling AMA Agent<br> 2. No heartbeat for Agent <br> 3. Missing or no data<br>| Azure Monitor Data Collection/AMA Linux <br> Azure Monitor Data Collection/AMA Windows | ICM template for Windows [4231G3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=4231G3) Icm template for Linux [n3w2h3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=n3w2h3) |
| **DCR scenarios:** <br>1. Error creating, deleting DCR <br> 2. Need help with creating ,associating or viewing DCR|Azure Monitor Control Service (AMCS)/Triage| Icm template for DCR [mri3w1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=mri3w1) |
| **FIM Scenarios** <br> 1.Error enabling FIM in the Log Analytics workspace<br>2. Migration from legacy to new FIM<br>3. Not tracking changes<br>|Microsoft Defender for Cloud\Guardians| Azure\Microsoft Defender for Cloud\Enhanced security features for servers\File Integrity Monitoring (FIM) |

</details>



