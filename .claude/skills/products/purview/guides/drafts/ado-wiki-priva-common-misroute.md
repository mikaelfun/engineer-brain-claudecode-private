---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Privacy - Microsoft Priva/Common Misroute (Microsoft Priva)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FPrivacy%20-%20Microsoft%20Priva%2FCommon%20Misroute%20(Microsoft%20Priva)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Common Misroutes - Microsoft Priva

[Official DDX Misroute Support Guide](https://internal.evergreen.microsoft.com/en-us/topic/16460127-0916-9a5d-2e35-d08f24181ef7)

Microsoft Priva as a product was already GA in M365 for Privacy Risk Management and Subject Rights Requests components. However, with the SaaSification of Purview, we have added some new functionalities to expand the Privacy solutions offered to our customers. As a result, we have a few overlapping names/components which may initially cause misroutes between the Purview-Governance and Purview-Compliance teams. So, it is extremely important to correctly identify the component areas that the Purview-Governance team will support, and route the other cases to the Compliance queues.

## Support Boundaries

**Microsoft Priva - Governance:**
- Privacy Assessments
- Consent Management
- Subject Rights Requests (beyond M365) — SRR for data sources like ADLS, SQL DB etc.
- Tracker Scanning
- Metrics/Audit

**Microsoft Priva - Compliance:**
- Privacy Risk Management — Support Path: Security/Microsoft Purview Compliance/Microsoft Priva/Privacy Risk Management
- Subject Rights Requests (within M365) — Support Path: Security/Microsoft Purview Compliance/Microsoft Priva/Subject Rights Requests (for M365 data: SharePoint, Exchange, OneDrive, Teams etc.)

## Key Distinction for Subject Rights Requests (SRR)
- **Governance team**: SRR for _Data beyond M365_ (ADLS, SQL DB, etc.)
- **Compliance team**: SRR for _Data within M365_ (SharePoint, Exchange, OneDrive, Teams, etc.)

For more information related to routing a misroute case to the compliance team: https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912716/Common-Misroute-Microsoft-Purview-M365-Compliance
