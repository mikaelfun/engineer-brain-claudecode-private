---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/AADSTS Errors/AADSTS90092"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAADSTS%20Errors%2FAADSTS90092"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.AADSTS-Errors
- SCIM Identity
- 90092
- GraphNonRetryableError
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]

# AADSTS90092:�Non-retryable�error�has�occurred.

The exception is thrown when an invalid response from MS Graph is received while a sign-in process is being executed. To evaluate the exact details of the error and what actions should be executed to mitigate it, please follow guidance:  

1) Use [ASC Auth Troubleshooter](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps) to load the sign-in event (use Correlation ID/Request ID + Timestamp in UTC)  

2) Select "Diagnostic logs" tab and search for the details of the failed event. Example: 

```
Raising graph exception for StatusCode 401 and Message {"odata.error":{"code":"Authorization_IdentityNotFound","message":{"lang":"en","value":"The identity of the calling application could not be established."},"requestId":"353dae65-####-####-a7a3-8a1d50d40047","date":"20##-##-##T10:50:41"}} 
```  

3) With the details of the failed event, mainly the Request ID (From the above example - "requestId":"353dae65-####-####-a7a3-8a1d50d40047") and timestamp (From the above example - "date":"20##-##-##T10:50:41"), you can query the [MS Graph TSG and logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/485299/Microsoft-Graph-API-TSG) for steps to help identify and fix the issue.  
