---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C with Custom Policies/information about JSON claim transformations including arrays"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20with%20Custom%20Policies%2Finformation%20about%20JSON%20claim%20transformations%20including%20arrays"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# JSON Claim Transformations Including Arrays

JSON claims transformation is an essential aspect of custom policies in Azure Active Directory B2C.

## Key Points

- **No fixed array length limit**: Arrays in JSON claims transformations have no fixed length limit
- **Constraint is policy size**: The overall size of the array is constrained by the maximum size limit of the policy itself
- Users should ensure implementations remain within policy size bounds to avoid unexpected behavior

## Reference

- [JSON claims transformation examples for custom policies](https://learn.microsoft.com/azure/active-directory-b2c/json-transformations)
