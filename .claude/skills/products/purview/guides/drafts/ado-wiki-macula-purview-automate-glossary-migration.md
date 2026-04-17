---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Glossary/Macula Purview Automate - Glossary Migration"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Glossary/Macula%20Purview%20Automate%20-%20Glossary%20Migration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

INTRODUCTION:

Macula Purview Automate is a FREE! tool that has two components:

Purview Migrate: A streamlined tool for migrating glossaries and glossary terms from Azure Purview Classic, ensuring that your data is accurately and efficiently integrated into Microsoft Purview's comprehensive governance framework.

Purview Import: A robust import utility that provides the greatest flexibility supporting the creation and management of governance domains, data products, data assets and more. This tool ensures that your data governance practices are scalable, secure, and fully aligned with Microsoft Purview's advanced capabilities.

This is an official recommendation from the Data Governance Product Group: https://www.maculasys.com/microsoft-purview

NOTE: Customers to contact Macula support directly in case of issues with the tool. CSS WILL NOT support it.

**Step-by-Step Installation Guide for Macula Purview Automate**

**1. Download the Tool**

Visit the following link to download the tool: https://www.maculasys.com/microsoft-purview.

**2. Extract the Downloaded File**

Once the download is complete, you'll receive a compressed file. Locate the file on your local system and extract its contents.

**3. Run the Application via Command Prompt**

This tool is designed to run through the Command Prompt.

**Setting Up a Service Principal in Microsoft Entra ID**

After setting up the tool, the next step is to create a Service Principal in Microsoft Entra ID.

Note: Currently, the tool only supports a Service Principal account for authentication with both the Azure Purview and Microsoft Purview APIs.

To learn how to create a Service Principal account, follow the instructions in this tutorial: https://learn.microsoft.com/en-us/purview/tutorial-using-rest-apis

**Entra authorization:**

Optional: Add Entra User.Read.All permissions for Microsoft Graph API. This will enable using email addresses for owners in all bulk import commands instead of manually looking up the ObjectId's for each user.

Once you add the "User.Read.All" permission, click on "Grant admin consent" to change the status to "Granted".

**Assigning Permissions to the Service Principal in Microsoft Purview**

To allow the Service Principal to access content and glossary information in Microsoft Purview, it must be granted the appropriate permissions:

1. Navigate to your Microsoft Purview portal
2. Data Map -> Domains -> Role assignments
3. Add the Service Principal to the **Data Reader** role (read-only access)
4. For migration/write operations, also add **Data Steward** role (Data Catalog -> Catalog Management -> Governance domains -> Roles)

Note: The Data Reader permission can be assigned at any collection level; it does not need to be applied at the root collection level.

**Creating a Credential for the Service Principal**

Both purview-migrate and purview-import applications can share the same credentials file:

```
purview-import credentials --client-id <your client ID> --client-secret <your client secret> --tenant-id <your tenant ID> --azure-purview-url https://myapp-purview.purview.azure.com
```

**HOW TO USE THE TOOL:**

NOTE: Use 'governance-domain' instead of 'business-domain' in commands to prevent errors.

**Key Commands:**

- `purview-migrate -h` — List all available migration commands
- `purview-migrate list-glossaries` — List available glossaries
- `purview-migrate list-governance-domains` — List governance domains
- `purview-migrate migrate-terms` — Migrate glossary terms (has --dry-run true by default)

**Migration Scenarios:**

1. Migrate Glossaries into existing Governance Domains
2. Migrate Glossaries + all Terms into Governance Domains
3. Migrate subset of terms/glossaries (using filtering)
4. Migrate terms into a newly specified Governance Domain

**Example (dry-run):**
```
purview-migrate migrate-terms --filter-glossaries "Glossary1" --filter-terms "Term1" --single-governance-domain "demo" --governance-domain-type FunctionalUnit --governance-domain-status Published --map-stewards --map-experts --add-owners "ObjectId1,ObjectId2"
```

**Example (actual run):**
Add `--dry-run false` to execute.

**Important:** When creating new governance domains (--map-glossaries), grant the Service Principal the "Governance Domain Creator" permission.

**Note:** Duplicate terms per Governance Domain will not be created.
