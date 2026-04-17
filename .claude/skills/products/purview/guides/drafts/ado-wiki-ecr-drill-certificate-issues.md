---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Policy/Policy - Customer Issues/ECR Drill certificate issues TSG"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/ECR%20Drill%20certificate%20issues%20TSG"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Issue
ECR (Emergency Certificate Rotation) Drill will change the certificates used by application with the expectation that the application should pick up new certificates without any code modifications.

The application might not throw any errors as old certificates are still valid and it takes some time before being getting invalidated.

## Triaging Steps

1. If the issue has been logged by Tip Test, click on "DGrep: Tip results" to see the logs in Jarvis portal
2. Get the correlation id or account id from the logs or from the issue creator
3. Use this "Correlation ID" and search the logs again:
   ```kql
   ProjectBabylonLogEvent  
   | where CorrelationId == "<correlation id>" 
   ```
4. Possible causes - If the error in the logs says something similar to "Failed to validate client certificate", there is an issue with the certificate. Get the Thumbprint of the certificate and domain from the logs.
5. Check the Thumbprint of the certificate used and match it with certificate stored in Key vault
6. To get the name of key vault, go to region specific yaml file at: `PolicyStore/src/PolicyStoreService.Deployment/Generated/Helm/policystore/values_policystore_df_wus.yaml`
7. Go to Key vault service in Azure portal and search with the key vault name in yaml file
8. Click on the key vault and go to Certificates
9. Match the Thumbprint of the certificate in Key vault against the Thumb to the one printed in logs
10. If the Thumbprint does not match, old certificates are still being used

## Resolution
Wait for the new certificate to get reflected. If new certificate does not get reflected, please connect with SMEs.
