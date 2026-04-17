---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Ingestion tab/Read Aggregate by Heartbeat by"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Ingestion%20tab%2FRead%20Aggregate%20by%20Heartbeat%20by"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Ingestion tab - Aggregate by Heartbeat by:

There several Aggregations by options to choose from, each showing distinct aspect of data being sent with a specific Ikey.

## Key Points

- These aggregation types do not work for:
   - on-premises machines 
   - Azure VM machines

## Examples:

- Host Name
   - the name of the host resource that is, appname.azurewebsites.net

- Site Name
   - Effectively the domain name used for the application

- Stamp Name
   - This is not the same as Role Instance

- Framework
   - Framework configured for the web app resource
   - This determined by what is found on the Web App's blade, Configuration, General Settings, .Net Version

- OS Type
   - Platform application
   - "Win32NT" means it is running on a x86 Windows system
