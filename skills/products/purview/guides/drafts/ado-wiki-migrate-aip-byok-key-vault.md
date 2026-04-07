---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How To: Migrate AIP Service BYOK key vault keys"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Migrate%20AIP%20Service%20BYOK%20key%20vault%20keys"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Introduction
Customers need to move AIP Service BYOK keys from one Azure Key Vault (AKV) to another.

## Prerequisites
- Original key material
- Access to run AIP Service PowerShell module

## Starting configuration
The AIP service is using a BYOK in an AKV location. The AIP service is using the AKV key via the key's URL.

When migrating the BYOK to a new vault the key material must be provided by the customer. The customer had the original key and must create the new vault and populate it with the same key anew.

## Steps
Note, the BYOK key's key identifier will be the same, regardless of AKV location.
1. Leave the original BYOK key, subscription, AKV intact. Do not change anything.
2. Import that original BYOK key from on premises HSM and put it in a new AKV in the new subscription.
3. Configure the new AKV to allow AIP service to be able to use it.
4. Use `Convert-AipServiceKeyToKeyVault` to point the original key identifier to the new AKV key.
5. Use `Set-AipServiceKeyProperties` to change the status of an imported BYOK to be active.
6. Use `Use-AipServiceKeyVaultKey` to configure RMS to use the new active BYOK.

The key identifier is the same in the old AKV spot and in the new one.
The AKV URL will be different between old and new vaults. You are just pointing the key to the new vault location.
If anything goes wrong, the remediation is to use that command to point the key identifier to the old AKV URL.

Once confirmed (via AKV auditing) that encrypted content created using the old key uses the new AKV key, remove the old vault, etc.
