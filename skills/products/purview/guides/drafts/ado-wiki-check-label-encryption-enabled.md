---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/How to: MPIP Client/How to: check a label is encryption enabled?"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Check if a Sensitivity Label Has Encryption Enabled

## Prerequisites
- Admin access to the Purview Portal

## Steps

1. Edit the Sensitivity label in the Purview portal
2. Navigate to **Protection Settings** page
3. Check whether the **Control Access** option is enabled:
   - **Not enabled** → Non-encryption label
   - **Enabled** → Encryption is enabled; next page shows defined permissions
