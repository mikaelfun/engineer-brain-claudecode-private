---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/SLA Breach Credit Calculation for VM's_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSLA%20Breach%20Credit%20Calculation%20for%20VM%27s_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Process
---

[[_TOC_]]

# Overview

Occasionally customers will raise a support case requesting an SLA credit when they are not sure if a certain outage impacted their environment. Note that these alert notifications indicate that the customer's resources may have been impacted, but doesn't mean they were actually impacted.

These cases usually come into the Azure Subscription & Billing team (ASMS), who don't have knowledge of which VM's may have been impacted. In this case, they cut a collab task to IaaS VM to validate.
 
We already have an established process for requesting a refund for an existing case by engaging the ASMS team as mentioned in [wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494923/Engage-Billing-(ASMS)_Process). 

However, if the customer is requesting a refund after an existing case is already closed, or if they receive an alert notification, then you can follow this process to collect information for Billing team.
 

# Information Needed From Customer
1.	List of Subscription IDs they believe are affected
2.	Tracking number from the notification email (Ex. 8S8J-9T8)
 
If the request is outside of any normal outage, then we need the following additional information:
1.	List of VMs impacted
2.	Specific date and time (and time zone) of the outage
3.	Impact statement that tells us the actual impact they had
 
Once you have the Incident Tracking Number, you can find the corresponding IcM using the following two methods:
 - [Azure CXP PowerBI Report](https://msit.powerbi.com/groups/me/reports/2ba99bc1-ea41-4c82-928e-0d3ca7581a3f/ReportSection7b9f7fe6c86400ddbf82?ctid=72f988bf-86f1-41af-91ab-2d7cd011db47) (note does not include outages)
 - [Iridias](https://iridias.microsoft.com)

# Finding impacted resources

Once you have the IcM and the affected Subscription IDs, run the following Kusto query to see if the customer has any affected resources. Note that you need to be added to this SG in IdWeb to access the below Kusto table — "VmMedic Users".

Kusto Query to use (please modify as needed):
```
cluster("Azcompute").database("CommonDataWarehouse").GetImpactedVMListForIncident(IcM_Number)
| where SubscriptionGuid == "Customer's SubscriptionID"
```

**Note: Above query to get impacted VMs from IcM# is being deprecated and may not give accurate results or may just return null.**

_**Best way to get list of potential VMs would be to query the Cluster/Node during impacted time-frame (this information should be there in IcM#, if not - please ask the owner in the IcM itself)**_

After getting information about Cluster/Node, below query can be used to get list of VMs: 
```
cluster('vmainsight').database('vmadb').VMA
| where PreciseTimeStamp > datetime(start_time) and PreciseTimeStamp < datetime(end_time)
| where Subscription in('subid')
| where Cluster contains "cluster"
| sort by PreciseTimeStamp desc
| distinct   PreciseTimeStamp, TenantName,NodeId,NodeSS_OsVersionFriendlyName, VmUniqueId ,ContainerId, Cluster,RoleInstanceName, RCALevel1, RCALevel2, RCALevel3, RCAEngineCategory, Detail
```

To find VM downtime, as shown in EG, you can run this Kusto Query (please modify as needed):
```
let subs = dynamic(["SubID1", "SubID2"]); 
cluster('vmainsight').database('vmadb').VMA 
| where Subscription in (subs)
| where StartTime >= datetime(provide_date)
| where EndTime <= datetime(provide_date)
//| where RoleInstanceName contains "VM Name"
| where RCAEngineCategory !contains "CustomerInitiated"
| project PreciseTimeStamp, RoleInstanceName, EG_DowntimeDurationInMin
```

# Tracking ID of outage notification

If we have this, we can trace back the IcM number and know the timeframes and resources impacted by going into iridias site and searching with the tracking id - https://iridias.microsoft.com/incidentcentral?range=2W&section=my
