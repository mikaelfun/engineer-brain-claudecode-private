---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Azure Virtual Network Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FAzure%20Virtual%20Network%20Manager"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Azure Virtual Network Manager is a management service that enables users to group, configure, deploy, and manage virtual networks globally across subscriptions. With Virtual Network Manager, users can define network groups to identify and logically segment their virtual networks. Then they can determine the connectivity and security configurations they want and apply them across all the selected virtual networks in network groups at once.

AVNM uses Azure Policy to add VNETs to each one of those groups, based on a specific set of conditions. Adding the VNET to a network group is done by AVNM itself based on the results Policy provides, but Policy is the one that evaluates the VNETs and provides AVNM the list of VNETs that should be added to a specific network group.

> ⚠️ **Key behavior**: A VNET that meets all conditions is considered **non-compliant** in the policy result provided back to AVNM. For AVNM, a VNET that Policy reports as non-compliant **should be added** to the network group. AVNM will take care of adding it to the network group if needed. Policy does not look into whether the VNET is already in a network group, it just looks at the conditions to determine if it should be in the network group or not.

## Architecture flow

| Step | Description | Initiator | Receiver | Trigger | Logs at initiator | Logs at receiver |
|--|--|--|--|--|--|--|
| 1 | Workers get notified for one of the triggers that cause evaluation | ARM or ARN | Policy workers / Provider workers | Pending | N/A | Pending |
| 2 | Policy worker gets a list of the VNETs based on the trigger received and their location | Policy workers | ARM or ARG | Step 1 | Pending | ARM HttpIncomingRequests table |
| 3 | Policy worker writes a notification that includes the list of VNETs and their location from step 2 | Policy workers | EventGrid | Batch every 4 minutes | Pending | N/A |
| 4 | AVNM reads the notification from EventGrid | AVNM | Event Grid | EventGrid notification | Out of Policy scope | N/A |
| 5 | AVNM calls into Dataplane service API to evaluate the VNETs received from EventGrid | AVNM | Policy Dataplane service API | Step 4 | Out of Policy scope | Pending |
| 6 | Dataplane service API triggers a scan of resources using ARG as source, then replies back to AVNM on the API call from step 5 (this is done synchronously) | Dataplane Service API | ARG | Step 5 | Pending | ARM HttpIncomingRequests table |

## Support ownership

| Component | Ownership |
|-|-|
| Policy resources (definition, initiative, assignment) | Azure Policy |
| Policy workers | Azure Policy |
| Policy Dataplane service API | Azure Policy |
| AVNM | Azure Network |

## SAPs for collaboration

| Product | SAP |
|-|-|
| Azure Virtual Network Manager | Azure/Virtual Network Manager - Preview/Configuration and setup/Configure dynamic membership |
