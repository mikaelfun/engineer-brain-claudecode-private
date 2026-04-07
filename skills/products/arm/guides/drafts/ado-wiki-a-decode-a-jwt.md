---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Decode a JWT"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Decode a JWT"
importDate: "2026-04-06"
type: troubleshooting-guide
---

The **Authorization** request header present in all calls to ARM APIs is a **JSON Web Token (JWT)**. This token can be retrieved from any HTTP trace. See [[TSG] Get a HTTP trace](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623815).

> Some traces remove it for security reasons.

A JWT can be decoded as base64 and examined for troubleshooting.

To decode it, **remove the `Bearer` keyword from the beginning of the token** and copy it to the [jwt.ms](https://jwt.ms/) tool.

Here is an explanation of some of the fields an AAD JWT includes:

- **iss:** *Issuer*. Indicates the URL (includes the tenant id) the token was generated from. The tenant id is usually the same as the **tid** property, unless the user authenticated to another tenant that is not their home tenant, as in Azure B2B scenarios. See [[LEARN] B2B collaboration overview](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/what-is-b2b).
- **iat:** *Issued at*. Indicates the timestamp when the token was generated in EPOCH format. Any EPOCH decoder tool can be used to convert this to a human readable timestamp, such as [Epoch & Unix Timestamp Conversion Tools](https://www.epochconverter.com/).
- **nbf:** Indicates that the token will not be valid before this timestamp in EPOCH format. Any EPOCH decoder tool can be used to convert this to a human readable timestamp, such as [Epoch & Unix Timestamp Conversion Tools](https://www.epochconverter.com/).
- **exp:** Indicates that the timestamp in EPOCH format for when the token expires. Any EPOCH decoder tool can be used to convert this to a human readable timestamp, such as [Epoch & Unix Timestamp Conversion Tools](https://www.epochconverter.com/).
- **appId:** Application id where the security principal authenticated from.
- **oid:** Object id of the security principal for this token.
- **tid:** Home tenant id that the principal id belongs to.
