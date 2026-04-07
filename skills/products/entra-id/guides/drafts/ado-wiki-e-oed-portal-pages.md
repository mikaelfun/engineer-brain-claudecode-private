---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Office Engineering Direct (OED) Portal Pages"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FOffice%20Engineering%20Direct%20(OED)%20Portal%20Pages"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Office Engineering Direct (OED) Portal Pages

## Feature Overview

The Engineering Direct Portal is a feature within the Microsoft 365 admin center designed to provide OED customers with an enhanced engineering experience.

**Capabilities:**
- Delivery metrics highlighting OED usage
- Insight into support tickets escalated to product groups
- Self-service diagnostics (e.g., Visual Mail Flow)
- Features suggested by OED customers

## Licensing & Availability

- Available to all OED customers and in-scope tenants at no additional charge
- Permissions granted to anyone with RBAC support role in tenant
- No additional licensing beyond OED contract

**Region Availability:**
| Region | Status |
|--------|--------|
| Public | Available |
| Fairfax/Arlington | Not available |
| Gallatin/Mooncake | Not available |

## Accessing the Portal

1. Navigate to M365 admin center
2. Select **Support**
3. Select **Engineering Direct**

### Key Pages

- **Overview Page**: ACE contact info, key escalation metrics (last 6 months), CAB events, escalation trend charts, Request A Feature
- **Insights Page**: Detailed metrics on engineering escalations, product-level breakdown, severity distribution, ticket list with filters
- **Diagnostics Page**: Self-service diagnostic tools including Visual Mail Flow

## Visual Mail Flow Diagnostic

Investigates email-related issues: submission, group expansion, transport agent processing (AntiSpam, mail flow rules, DLP), delivery.

**Common Use Cases:**
- Checking delivery status of recipients
- Determining reasons for non-receipt of emails
- Understanding delivery variations between recipients
- Identifying mail flow rules and DLP rules applied

**Input Requirements:**
- **Message ID** (from email header, "Message-ID:" token) - e.g., `<08f1e0f806a47b4ac109109ae6ef@server.domain>`
- **Network Message ID** (from "X-MS-Exchange-Organization-Network-Message-Id:" token) - e.g., `4d4c1224-7398-4e8e-949f-ce1932c4ab9d`
- Messages must be within 1-90 days age range

**Results Include:**
- Summary: General conclusion on the mail flow
- Highlights: Outstanding info and detected issues
- Recommendations: Intelligent recommendations for resolving issues
- Visual Mail Flow Tree: Interactive display showing email processing stages

## Troubleshooting

Most cases require PG escalation. Before escalating, collect:
- Screenshot(s) of the issue
- Good description of expected vs actual behavior
- HAR trace of the issue as it occurs

## Escalation Paths

**Portal issues or diagnostic issues:**
- Product: **M365 Admin Portal (ICM)**
- Engineering team: **Engineering Direct**
- Created via Assist 365

**Visual Mail Flow result interpretation issues:**
- Product: **Exchange Online**
- Engineering team: **Transport**

## References

- [Engineering Direct Portal - Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365/enterprise/engineering-direct-portal)
- [OED Datasheet](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/unisp/documents/presentations/Enhanced%20Solutions%20Datasheet%20Office%20365%20Engineering%20Direct.pdf)
