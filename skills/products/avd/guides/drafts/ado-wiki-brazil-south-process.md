---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Restricted Regions/Brazil South Process"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FRestricted%20Regions%2FBrazil%20South%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Brazil South Process

## Customer-Facing Guidance
- Brazil South region is **Restricted** per public documentation
- Direct customer to their **Microsoft Account Team**
- If no Account Team → no exception can be processed
- Archive the case - no action required from CSS or SaaF

## Internal Process (Do Not Share)
### Brazil South Allowlisting for CPC Deployment
- **Flighting Tag**: `BrazilSupportedRegionEnabled`

### Engineering Workflow
1. Business Desk sends customer details to `win365brazildeploy@microsoft.com` (TPID, Customer Name, Tenant ID, Executive Email, Expected LATAM users)
2. ANC OCE team adds Tenant ID to flight enabling Brazil South
3. ANC OCE team records in `Approved_Customers_For_Brazil_South.xlsx` tracker
4. ANC OCE team replies to original email when complete
