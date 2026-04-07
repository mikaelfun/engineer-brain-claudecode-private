---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Lineage/OpenLineage/ADB Lineage using OpenLineage Solution Accelerator"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FLineage%2FOpenLineage%2FADB%20Lineage%20using%20OpenLineage%20Solution%20Accelerator"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Training Resources

| Session | Link |
|--|--|
| Overview | [Session Link](https://microsoft-my.sharepoint.com/:v:/p/vimals/Ea4XyAEa6zBBlr9XLSYwGFIBvNuN5CLbShUUOZKO5e0bDQ?e=In6Fe7) |
| Deep-Dive | **[TBD]** |

## Other Resources

| Resources | Link |
|--|--|
| GitHub link to the Documentation | [ADB Lineage using OpenLineage Solution Accelerator](https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator) |
| Overview page of Solution Accelerating team | [Early Access Engineering](https://microsoft.sharepoint.com/teams/EA) |
| MLADs Technical Overview Session | [Slide Deck](https://microsoft.sharepoint.com/:p:/t/PurviewACC-Team/EceJcMWi41ZMhhV-eXRFAXgBSImYIK2q4IiSZqt__-eRcQ?e=fN827c&isSPOFile=1) |
| Configuration of Databricks Cluster | [Link](https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator/blob/main/deploy-base.md#download-the-openlineage-spark-agent-and-configure-with-your-azure-databricks-clusters) |
| What is Azure Databricks | [Documentation](https://docs.microsoft.com/en-us/azure/databricks/scenarios/what-is-azure-databricks) |

## Troubleshooting

The solution accelerator has certain limitations w.r.t. Data Sources supported and the Azure Databricks to Purview Solution Accelerator Connector which affect what sort of lineage can be collected. Refer to these limitations before troubleshooting any case.

### Limitations
https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator/blob/main/LIMITATIONS.md

Refer to the following link for troubleshooting issues related to ADB Lineage using OpenLineage Solution Accelerator:

### Troubleshooting doc
https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator#troubleshooting

## How to contact OpenLineage Product Group

The Solution Accelerator for ADB Lineage will be available in Public Preview soon. Customers should only be creating Sev 3 cases during Public Preview of this feature.

Please don't raise an ICM directly for this issue with the Lineage PG. All PG requests/escalations should be first discussed on Ava with the SMEs/EEEs and the Solution Accelerator team. We need to first identify if the customer's concern is because of Lineage issue with the Purview product or because of Lineage issue with the Solution Accelerator.

SMEs can use the following command to engage Solution Accelerator team: _**Ava involve OpenLineage**_

Please reach out to [Purview EEEs](mailto:azurepurvieweees@microsoft.com) for any queries or feedback.

## Additional Information

### Unable to access github documentation
The github documentation should be publicly accessible, if you're unable to access it, please join the Microsoft organization from the list of "Available organizations" on github: [Organizations](https://repos.opensource.microsoft.com/orgs)
