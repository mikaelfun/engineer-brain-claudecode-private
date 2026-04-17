---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Known Issues/Request to Increase the Number of Collections"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/Request%20to%20Increase%20the%20Number%20of%20Collections"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Request to Increase the Number of Collections

## Issue Description

Customers may request to increase the limit of collections beyond the supported maximum.

## Default Response

Microsoft Purview does not support more than 400 collections. However, if the customer provides a reasonable use case and no other solution is viable, additional information will need to be collected for further evaluation.

## Information to Gather from the Customer

1. **User Permissions:**
   - How many users will have permissions to how many collections?

2. **Domain Details:**
   - Will all collections reside within the same domain?
   - Total number of domains involved.

3. **Collection Distribution:**
   - Number of collections assigned per user.
   - Number of collections the same user will have access to.

## Next Steps

1. After gathering the above information, reach out to Blesson John for approval.
2. Open an ICM with the platform team to do the required analysis, as this will impact other customers and may cause performance issues for the requester. If they grant access to more than the said users, there will be search timeouts.
