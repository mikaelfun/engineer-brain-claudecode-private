---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Claims_and_Token_Customization/How to/Basic, Optional, Restricted Claims"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Claims_and_Token_Customization/How%20to/Basic%2C%20Optional%2C%20Restricted%20Claims"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- Claims
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Basic, Optional, and Restricted Claims
The purpose of this document is to consolidate public documentation reference for basic, optional and restricted claims in tokens. There are multiple public documents created regarding claims.

If you find a link to claims of any type not listed here, please reach out to an App Experience SME, such as aharrison.



## Basic claims 
The basic claims that are passed in the Access and ID tokens and can be reviewed in our public documentation.

[Access token claims reference](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference#payload-claims)

[ID token claims reference](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference#payload-claims)

[Microsoft Document - Access Tokens](https://review.learn.microsoft.com/en-us/identity/microsoft-identity-platform/access-tokens?branch=main#claims-in-access-tokens)

[Microsoft Document - ID Tokens](https://review.learn.microsoft.com/en-us/identity/microsoft-identity-platform/id-tokens?branch=main#claims-in-an-id-token)

## Optional claims 
The optional claims that can be added into a token. This can be accomplished through a claims mapping policy or utilizing the Token Configuration interface.

[Microsoft Document - Optional Claims - Identity](https://review.learn.microsoft.com/en-us/identity/microsoft-identity-platform/active-directory-optional-claims?branch=main)

[Microsoft Document - Optional Claims - Dev](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims)

[Optional claims reference - Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims-reference)

## Restricted claims 
The restricted claims are passed to first party applications only. These cannot be passed to third party applications or added into a token through a claims mapping policy or token configuration interface option.

[Claims customization](https://learn.microsoft.com/en-us/entra/identity-platform/reference-claims-customization#claim-sets)
