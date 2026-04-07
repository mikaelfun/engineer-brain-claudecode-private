---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Databases/[FAQ] - SQL Vulnerability assessment (VA) (Legacy plan)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Databases%2F%5BFAQ%5D%20-%20SQL%20Vulnerability%20assessment%20%28VA%29%20%28Legacy%20plan%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Legacy plan (storage based) - SQL Vulnerability assessment (VA)

## Where Baselines are Stored (Express Configuration)
Scan results and baselines are stored in a Microsoft-managed storage account in the same region as the Azure SQL Server.
[Data Residency docs](https://learn.microsoft.com/en-us/azure/defender-for-cloud/sql-azure-vulnerability-assessment-find?tabs=express#data-residency)
Data can be accessed via API. Customer does not have direct access to the storage account.
[Store VA results behind firewalls/VNets](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-vulnerability-assessment-storage?view=azuresql)

## Email Notification for SQL VA Express Settings
Internal scheduler does NOT work for Express, only for Classic mode.
Must create a Logic App for email notifications.
[Express vs Classic differences](https://learn.microsoft.com/en-us/azure/defender-for-cloud/sql-azure-vulnerability-assessment-overview#whats-the-difference-between-the-express-and-classic-configuration)

## ARM Template for Logic App Email Notifications
[GitHub - Notify-SQLVulnerabilityReport](https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Workflow%20automation/Notify-SQLVulnerabilityReport)

## Revert from Express to Classic Configuration
[Reverting docs](https://learn.microsoft.com/en-us/azure/defender-for-cloud/sql-azure-vulnerability-assessment-manage?tabs=express#revert-back-to-the-classic-configuration)

## On-Demand SQL VA Scan
- SQL Managed Instance: [Start-AzSqlInstanceDatabaseVulnerabilityAssessmentScan](https://learn.microsoft.com/en-us/powershell/module/az.sql/start-azsqlinstancedatabasevulnerabilityassessmentscan?view=azps-10.2.0)
- Azure SQL: [Start-AzSqlDatabaseVulnerabilityAssessmentScan](https://learn.microsoft.com/en-us/powershell/module/az.sql/start-azsqldatabasevulnerabilityassessmentscan?view=azps-10.2.0)
