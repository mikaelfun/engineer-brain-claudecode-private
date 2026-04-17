---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Processes and Collaboration/TSG: Customer Requests for Microsoft Access to VHDs"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FProcesses%20and%20Collaboration%2FTSG%3A%20Customer%20Requests%20for%20Microsoft%20Access%20to%20VHDs"
importDate: "2026-04-05"
type: policy-guide
---

# Customer Requests for Microsoft Access to VHDs

## Statement

Support Engineers must not accept or fulfill customer requests to have Microsoft access their Virtual Hard Disks (VHDs). This restriction is in place to protect customer data integrity and privacy, and to ensure compliance with Microsoft's internal access control policies.

## Scope

This TSG applies to all Microsoft Support Engineers engaged in customer support activities across Windows 365.

## Details

### Customer Requests for VHD Access
- Support Engineers do not have access to customer VHDs and access cannot be granted even if explicitly requested by the customer
- ICMs requesting access to customer VHDs are not permitted. Any request will be declined
- Refer Enterprise and Frontline customers to the documented restore point and snapshot workflows to share relevant data with Microsoft without granting direct access to VHDs:
  - https://learn.microsoft.com/en-us/windows-365/enterprise/share-restore-points-storage
  - https://learn.microsoft.com/en-us/windows-365/enterprise/place-cloud-pc-under-review

### Service Engineer Access
- Per Microsoft's documented access control policies, only designated Service Engineers may access customer data, including VHDs, and only for approved scenarios such as quality improvement or service reliability investigations
- These accesses are governed by strict controls and auditing as outlined in the Microsoft 365 Service Engineer Access Control documentation:
  - https://learn.microsoft.com/en-us/compliance/assurance/assurance-microsoft-365-service-engineer-access-control

### Customer Responsibility
- Customers are responsible for managing and securing their own VHDs
- This includes creating and sharing snapshots or restore points as needed for troubleshooting
- Reference: https://learn.microsoft.com/en-us/windows-365/customer-microsoft-responsibilities

### Escalation and Documentation
- If a customer insists on VHD access, support engineers must decline and refer to this policy
- Any such requests should be documented in the support case and escalated to the appropriate internal compliance or service engineering teams if necessary
