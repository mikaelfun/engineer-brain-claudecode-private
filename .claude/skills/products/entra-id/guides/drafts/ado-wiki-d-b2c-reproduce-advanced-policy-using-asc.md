---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Azure AD B2C - How to reproduce a customer's B2C advanced policy using ASC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Troubleshooting%2FAzure%20AD%20B2C%20-%20How%20to%20reproduce%20a%20customer's%20B2C%20advanced%20policy%20using%20ASC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to reproduce a customer's B2C advanced policy using ASC

When troubleshooting a customer's Azure AD B2C advanced policy, it is often useful to have a complete copy of their relying party policy, all extension policies, and their base policy. The below steps explain how to use Azure Support Center to reproduce a customer's entire policy structure from scratch.

## Prerequisites

- Customer's B2C Tenant ID (e.g., b2ctenant.onmicrosoft.com)
- B2C relying party policy ID (e.g., B2C_1A_signup_signin)
- Azure Support Case ID with customer consent for advanced diagnostic information
- Visual Studio Code with Azure AD B2C extension installed
- Understanding of Azure AD B2C Advanced Policy Inheritance Model

## Steps

### 1. Install Visual Studio Code and Azure AD B2C Extension

1. Download and install VS Code
2. Open Extensions Marketplace (CTRL+SHIFT+X)
3. Search for "Azure AD B2C" extension and install

### 2. Locate Customer B2C Policy Definition in ASC

1. Open Azure Support Center (ASC) for your customer's support case
2. Browse to Tenant Explorer
3. Choose **Add Tenant** and add the customer's Azure AD B2C tenant name
4. Browse to the **AAD B2C** menu of tenant explorer
5. Select the **Custom Policy** tab and paste the relying party policy ID

### 3. Create a local copy of the B2C policy in VS Code

1. Create a "B2C Policy" folder on your desktop
2. Open it in VS Code (File -> Open Folder)
3. Create a new .XML file with the policy name (e.g., B2C_1A_signup_signin.xml)
4. From ASC, copy the ENTIRE xml contents of the policy's "View Details"
5. Paste into the VS Code XML file
6. Save the file

### 4. Locate any Extension or Base Policy references

1. Search for `<BasePolicy>` element in the policy file
2. If found, note the referenced Policy ID (e.g., B2C_1A_TrustFrameworkExtensions)
3. Repeat Steps 2-4 for each referenced base policy:
   - Look up the base policy in ASC
   - Create a new XML file with the base policy name
   - Paste the contents
   - Check for further `<BasePolicy>` references
4. Continue until you reach the base policy with no `<BasePolicy>` element

Use the Azure AD B2C extension's **Policy Explorer** to browse the entire policy structure.

### 5. Remove and replace unique identifiers

Before uploading policies to your B2C lab tenant, use VSCode's **Edit -> Replace In Files** (CTRL+SHIFT+H) to replace:

1. Policy Names and Tenant IDs
2. Any client_id references (ProxyIdentityExperienceFramework, IdentityExperienceFramework)
3. Any StorageReferenceId's for Policy Keys not in your lab tenant
4. Any Custom ContentDefinition references
5. Any ApplicationInsights keys

Upload base policy first, then each child policy. B2C Portal will show errors for missed items.
