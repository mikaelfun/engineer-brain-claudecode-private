---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Data Management"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Data%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sentinel Data Lake - Data Management TSG

This guide assists with preliminary troubleshooting and issue diagnosis related to Microsoft Sentinel data lake setup, data ingestion, table management, and retention settings.

## Setup & Onboarding

**Q1. What are the prerequisites to setting up Microsoft Sentinel data lake?**
- Complete the onboarding process. Connectors on workspace automatically start sending data to the lake. No extra steps needed unless adding or updating connectors.

**Q2. How long does it take for data to appear in the Data Lake after setup?**
- Typically 90-120 minutes after onboarding. For new connectors or DCR updates, allow up to 30 minutes.

**Q3. Is historical data backfilled into the Data Lake?**
- No, mirroring starts only from the time of Data Lake enablement.

**Q4. What permissions are required to manage tables in Table Management?**
- Contributor-level access (Log Analytics Contributor or Defender XDR Data manage roles) needed to modify settings. Reader-level roles can only view data.

## Data Connectors & Ingestion

**Q5. What does Analytics + Lake tier mean in connector setup?**
- Data is sent to the Analytics tier and mirrored to the Data Lake with the same retention setting.

**Q6. Can I switch a table to Lake-only ingestion?**
- Yes. This stops new data from being ingested into the Analytics tier but does not remove existing data from it.

**Q7. What if a connector's data is not showing in the lake?**
- Wait 90-120 minutes. Check Table Management to confirm tier settings and that retention is correctly configured.

## Table Management & Retention Settings

**Q8. What is the difference between Retention Period and Long-Term Retention?**
- Retention Period: Days in hot storage (Analytics tier)
- Long-Term Retention: Total retention time, including cold (Lake) storage

**Q9. How do I change a table's storage tier or retention period?**
- Table Management > Select table > Click Manage table > Adjust settings > Save. Changes apply once saved.

**Q10. What happens if I change the table's tier from Analytics to Lake-only?**
- Existing analytics features (detections, hunting queries) will no longer work for that data. Platform warns before making the change.

**Q11. Why can't I edit retention or tier settings on a table?**
- May lack required permissions, or table might not support tier management.

## Finding and Querying Data

**Q12. Where can I query data stored in Analytics and Lake tiers?**
- Analytics Tier: Azure portal (Logs), Defender portal (Advanced Hunting)
- Lake Tier: Use Lake Explorer in the Defender portal

**Q13. Why can't I find certain logs in the lake but they appear in Analytics?**
- Data is mirrored to the Lake only after enabling Data Lake. Historical data prior to enablement isn't backfilled.

**Q14. What happens to archived data in Analytics after switching to Lake-only?**
- Archived data remains available through Search and Restore but will not receive new ingestions.

## Default Data, Auto-Enabled, Lake-Only Ingestion Tables

**Q15. What data is automatically added to the Data Lake setup?**
- All XDR tables (with 30-day retention) if only one Sentinel workspace is present
- Asset tables from Entra, M365, and ARG
- All mirrored data from Analytics is also sent to the lake

**Q16. Are there tables that do not get mirrored to the Data Lake?**
- Yes, CLv1 tables are excluded from Data Lake mirroring.

**Q17. Do all Sentinel tables support both analytics and Data Lake ingestion?**
- No. Refer to official docs:
  - [Data tables in the Microsoft Defender XDR advanced hunting schema](https://review.learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables?branch=pr-en-us-6334#learn-the-schema-tables)
  - [Find your Microsoft Sentinel data connector](https://learn.microsoft.com/en-us/azure/sentinel/data-connectors-reference)

## Known Behaviors & Limitations

**Q18. What is the default retention period for Sentinel and Defender XDR?**
- Sentinel Analytics Tier: 90 days
- Defender XDR: 30 days
- Retention beyond this incurs extra costs.

**Q19. Will changing retention settings for XDR tables affect their connection to Table Management?**
- Yes. Setting retention >30 days enables the Table Management setting. Reducing to 30 days disables it.
