---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/Troubleshooting Scenarios: AipService/Scenario: Unable to Activate AIPService keys (BYOK or MMK)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/AIP%20Service/Troubleshooting%20Scenarios%3A%20AipService/Scenario%3A%20Unable%20to%20Activate%20AIPService%20keys%20(BYOK%20or%20MMK)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario: Unable to Activate AIPService Keys (BYOK or MMK)

This TSG describes how to troubleshoot issues with activating a Key in the AIP Service, including:
- A key imported from AD RMS
- A BYOK key created in KeyVault
- Switching one key to another (MMK to BYOK or BYOK to MMK)

## Prerequisites

- Access to AIP service PowerShell with Global Admin or AIP admin role assigned

## Key Commands

- **[Use-AipServiceKeyVaultKey](https://learn.microsoft.com/en-us/powershell/module/aipservice/use-aipservicekeyvaultkey?view=azureipps)** — tells Azure Information Protection to use a customer-managed key (BYOK) in Azure Key Vault
- **[Set-AipServiceKeyProperties](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicekeyproperties?view=azureipps)** — sets a key status to Archived or Active. Only one active tenant key at a time; activating one key automatically archives the previous.

## Step-By-Step Troubleshooting

### Step 1: Identify what command is failing

- If switching from a BYOK key to another key:
  - Verify the previously active BYOK key is still present in KeyVault
  - Verify proper access to AIPService is granted in KeyVault
  - If AIP service cannot access the Active key or it was deleted from KeyVault, the switch command will fail
  - If BYOK key was deleted → collect error details and correlation ID → escalate

- Verify AIP Service has correct permissions in Key Vault:
  [Bring Your Own Key (BYOK)](https://learn.microsoft.com/en-us/azure/information-protection/byok-price-restrictions#enabling-key-authorization-using-powershell)

- If activating BYOK, verify key length is supported:
  [BYOK Key Length Requirements](https://learn.microsoft.com/en-us/azure/information-protection/byok-price-restrictions#key-length-requirements)

### Step 2: Get Assistance

If above steps do not resolve the issue, escalate with:
- Command output with **-Verbose** parameter
- Error details and correlationID
