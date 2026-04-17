---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/ICM process & templates/How to share customer data with CPC PG"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FICM%20process%20%26%20templates%2FHow%20to%20share%20customer%20data%20with%20CPC%20PG"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Share Customer Data with CPC PG

## Rules - DO NOT:
- Add PII into ICM (email, UPN, etc.)
- Attach support data files to ICM incidents
- Attach support data files to ADO work items
- Send email with attached support data
- Share via OneDrive, Teams, SharePoint, or UNC paths
- **ONLY share through DTM (Data Transfer and Management)**

## CSS Engineer Process
1. Wait for ICM transfer email, get ICM owner alias
2. Add ICM owner as contact in DFM case (domain: microsoft.com, role: Contact)
3. Open DTM Portal from DFM case
4. Copy "Customer access" link from DTM workspace
5. @mention ICM owner in incident with DTM workspace link

## Product Group Process
1. Request access from CSS engineer
2. Receive workspace link
3. Sign in to DTM page to access files
