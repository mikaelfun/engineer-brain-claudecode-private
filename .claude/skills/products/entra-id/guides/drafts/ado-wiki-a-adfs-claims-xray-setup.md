---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Workflow - Setup Claims X-Ray RP"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Workflow%20-%20Setup%20Claims%20X-Ray%20RP"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Workflow - Setup Claims X-Ray RP

[AD FS Help](https://adfshelp.microsoft.com) provides the Claims X-Ray tool to debug claims issuance related issues.

## Setup Steps

1. Go to [Claims X-Ray setup page](https://adfshelp.microsoft.com/ClaimsXray/TokenRequest) - follow Step 1 to setup Claims X-ray on the AD FS server.

2. Log-in to the primary AD FS server

3. Open PowerShell

4. Execute the PowerShell commands as obtained from AD FS Help to setup the Claims X-Ray relying party

## Testing

To test possible authentication combinations (protocol and authentication method):

1. Use Step 2 on the AD FS Help page
2. Provide federation service name (e.g., `fs.contoso.com`) where you added the relying party
3. Select the right combination of authentication method and protocol
4. Click **Test Authentication**

## Use Cases

- Verify which claims are being issued by ADFS for a specific user
- Debug claim rule logic and transformations
- Test different authentication protocols (WS-Fed, SAML, OAuth)
- Validate claim values before configuring relying party trusts
