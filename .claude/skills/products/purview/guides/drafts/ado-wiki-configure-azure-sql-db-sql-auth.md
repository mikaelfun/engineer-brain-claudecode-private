---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/How To/How to Configure the Azure SQL DB using SQL Authentication"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FHow%20To%2FHow%20to%20Configure%20the%20Azure%20SQL%20DB%20using%20SQL%20Authentication"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Azure SQL Database**

- Verify the SQL Account able to connect to the database using SSMS
- Follow the SQL Authentication section in the documentation https://docs.microsoft.com/en-us/azure/purview/register-scan-azure-sql-database

**Azure Key Vault**

- Secret | Generate / Import (Name - User Friendly and Value = password of the SQL Account)
- Go to Access Policies - Add the Purview Account Identity make sure GET Permission in place
- Topics covered in this documentation https://docs.microsoft.com/en-us/azure/purview/manage-credentials

**Purview Governance Portal**

- Create Azure SQL Database Source
- New Scan follow the Wizard | Credential | New 
- Update the Key Vault Connection
- Secret Name = AKV Secret created in previous steps
- Test Connection
- Initiate the Scan
