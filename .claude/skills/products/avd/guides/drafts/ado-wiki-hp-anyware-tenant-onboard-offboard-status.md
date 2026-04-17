---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/HP Anyware/Tenant Onboard/HP Anyware Tenant Onboard Offboard Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FHP%20Anyware%2FTenant%20Onboard%2FHP%20Anyware%20Tenant%20Onboard%20Offboard%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Author:** Ye Zhang

# Overview

Customer will need to connect to Azure tenant in HP admin portal before they can assign HP license to customers.
This page will summarize the customer experience regarding tenant onboard and offboard and provide troubleshooting guide for support team.

# Overall Tenant Onboard Workflow
All customer operations will happen inside HP admin portal.
Once the operation finished, an API request will be sent to our EPA (External Partner API) service.

# Check Tenant Onboard Status

Check the connector status from Tenant Admin→Connectors and tokens→Windows365 partner connectors and make sure the status is healthy.
