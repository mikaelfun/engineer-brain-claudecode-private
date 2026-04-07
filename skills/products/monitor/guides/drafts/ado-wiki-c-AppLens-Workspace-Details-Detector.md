---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/AppLens Overview/AppLens Workspace Details Detector"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FAppLens%20Overview%2FAppLens%20Workspace%20Details%20Detector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### Key Features

- Comprehensive workspace details: The AppLens Detector collects and presents a wide range of workspace details, including name, ID, SKU, snapshots, creation date, region, daily cap status, installed solutions, tags, private link availability, and SecurityInsights solution flag.
- Seamless integration: The AppLens Detector seamlessly integrates with ASC linked to existing workspace, providing a hassle-free experience.
- User-friendly interface: With a simple and intuitive interface, the AppLens Detector makes it easy for users to access and interpret workspace details.

### How to Use this Detector
AppLens is located under ASC Tools on the left pane.
Enter the ARM Resource Id is not automatically filled out and press continue.
Once you are logged search for "Workspace Details."
Please select the appropriate time range to gather the relevant workspace details.

### Understanding the Collected Workspace Details
The AppLens Detector collects various workspace details to provide users with a comprehensive overview of their customer workspace environment. Here are the key details that are captured:

**Workspace Name and ID**
The workspace name represents a human-readable identifier for the workspace, while the workspace ID is a unique alphanumeric identifier associated with each workspace. These details help users easily identify and differentiate between multiple workspaces.

**SnapshotTimestamp Last Snapshot**
The last snapshot refers to the most recent backup or point-in-time copy of the workspace. This information aids users in understanding the backup status of their workspace and provides an additional layer of data protection.

**Creation Date**
The creation date indicates when the workspace was initially provisioned or deployed. It helps users track the age of the workspace and understand its lifecycle.

**Region**
The region represents the geographical location where the workspace is hosted. Knowing the region is crucial for various reasons, including compliance requirements, latency optimization, and data sovereignty.

**Daily Cap Status (DataIngestionStatus)**
The daily cap status indicates whether the workspace has reached its allocated resource limit for a specific time period. It helps users track resource utilization and manage workspaces within predefined limits.

**Installed Solutions**
The installed solutions section provides a list of solutions or services that are installed within the workspace. It helps users identify the additional capabilities and functionalities available in their workspace environment.

**Tags**
Tags are user-defined labels or metadata assigned to workspaces for organizational purposes.

**Private Link Availability**
Private link availability refers to whether the workspace has a private link configured or not.

**IsSentinel Solution Flag**
The IsSentinel solution flag determines whether the SecurityInsights solution is installed in the workspace. This help to determine if Sentinel team needs to be involved.

**QuotaInBytesPerDay**
The QuotaInBytesPerDay represents the daily data ingestion limit set by the customer, measured in gigabytes (GB).

**ExportData**
The ExportData feature indicates whether the customer is actively transferring their data to an external resource, such as a storage account or Event Hub.

**Last Workspace Snapshot**
Shows the latest workspace snapshot for the specified time period.

**Workspace Snapshot Changes**
Shows workspace snapshots where changes happened for selected properties.

**Solution Changes**
Shows changes in customer solutions.

**Resource updates**
Shows workspace and related resources API updates (PUT and DELETE) for the specified time period.
